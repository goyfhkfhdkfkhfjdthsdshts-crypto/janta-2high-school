'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { SchoolClass, UserProfile } from '@/lib/types';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  Volume2,
  Square,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  X,
  FileQuestion,
  Check,
  Globe,
  Loader2,
} from 'lucide-react';

interface AiClassViewProps {
  user: UserProfile | null;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  audioText?: string;
  timestamp: string;
}

export function AiClassView({
  user,
  selectedClass,
  onSelectClass,
  language,
  onToggleLanguage,
}: AiClassViewProps) {
  // Subjects by Class
  const subjectsByClass: Record<SchoolClass, string[]> = {
    '9': ['Mathematics', 'Science', 'Social Science', 'Hindi', 'English', 'Sanskrit', 'Information Technology'],
    '10': ['Mathematics', 'Science', 'Social Science', 'Hindi', 'English', 'Sanskrit', 'Information Technology'],
    '11': [
      'Physics (Science)',
      'Chemistry (Science)',
      'Mathematics',
      'Biology (Science)',
      'Accountancy (Commerce)',
      'Business Studies (Commerce)',
      'Economics',
      'History (Arts)',
      'Political Science (Arts)',
      'Geography (Arts)',
      'English Core',
      'Hindi Core',
    ],
    '12': [
      'Physics (Science)',
      'Chemistry (Science)',
      'Mathematics',
      'Biology (Science)',
      'Accountancy (Commerce)',
      'Business Studies (Commerce)',
      'Economics',
      'History (Arts)',
      'Political Science (Arts)',
      'Geography (Arts)',
      'English Core',
      'Hindi Core',
    ],
  };

  const [currentSubject, setCurrentSubject] = useState(subjectsByClass[selectedClass][0]);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      text:
        language === 'hi'
          ? `नमस्ते ${user?.name ? user.name.split(' ')[0] : 'विद्यार्थी'}! मैं जनता +2 उच्च विद्यालय, खलारी का एआई शिक्षक हूँ। आप कक्षा ${selectedClass} के ${currentSubject} या किसी भी विषय से संबंधित प्रश्न पूछ सकते हैं। आप प्रश्न टाइप कर सकते हैं, बोल सकते हैं या अपनी कॉपी/किताब की फ़ोटो खींचकर भेज सकते हैं!`
          : `Hello ${user?.name ? user.name.split(' ')[0] : 'Student'}! I am your AI Teacher for Janta +2 High School, Khalari. You can ask any question for Class ${selectedClass} ${currentSubject}. Type your doubt, speak into the mic, or upload a photo of your book/notebook!`,
      audioText:
        language === 'hi'
          ? 'नमस्ते विद्यार्थी! जनता उच्च विद्यालय खलारी की एआई कक्षा में आपका स्वागत है।'
          : 'Welcome to Janta High School AI Classroom. Ask your doubt now.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentSpeakingMsgId, setCurrentSpeakingMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Update subject when class changes
  useEffect(() => {
    const available = subjectsByClass[selectedClass];
    if (!available.includes(currentSubject)) {
      setCurrentSubject(available[0]);
    }
  }, [selectedClass]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Input (Speech-to-Text)
  const handleToggleVoiceInput = () => {
    if (isRecordingVoice) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टाइप करें।'
          : 'Voice recognition not supported on this browser. Please type your question.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecordingVoice(false);
    }
  };

  // Voice Output (Text-to-Speech)
  const handleSpeakAnswer = (msgId: string, textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Text-to-speech is not supported on this device.');
      return;
    }

    if (isPlayingAudio && currentSpeakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    // Try finding Indian English or Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find((v) =>
      language === 'hi' ? v.lang.startsWith('hi') : v.lang.includes('en-IN') || v.lang.includes('en')
    );
    if (voiceMatch) utterance.voice = voiceMatch;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setCurrentSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setCurrentSpeakingMsgId(null);
  };

  // Submit Question to AI Tutor
  const handleSendQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!question.trim() && !selectedPhoto) || isLoading) return;

    const userPrompt = question.trim();
    const photoToSend = selectedPhoto;

    // Reset inputs
    setQuestion('');
    setSelectedPhoto(null);

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: userPrompt || (language === 'hi' ? 'इस फ़ोटो के प्रश्न को हल करें:' : 'Solve this question from photo:'),
      image: photoToSend || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userPrompt,
          imageBase64: photoToSend,
          selectedClass,
          subject: currentSubject,
          language,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const assistantMsg: MessageItem = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          text: data.answer,
          audioText: data.audioText || data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: MessageItem = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          text:
            data.message ||
            (language === 'hi'
              ? 'क्षमा करें, सर्वर पर व्यस्तता के कारण उत्तर प्राप्त करने में समस्या हुई। कृपया प्रश्न पुनः पूछें।'
              : 'The AI server is experiencing temporary high demand. Please try asking again.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: MessageItem = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        text:
          language === 'hi'
            ? 'नेटवर्क समस्या के कारण उत्तर लोड नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'Network connection issue. Please retry asking your question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm">
      {/* AI Class Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <SchoolLogo size={36} showText={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                {language === 'hi' ? 'एआई क्लास (डिजिटल गुरु)' : 'AI Tutor Classroom'}
              </h2>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              JAC Board 24/7 Problem Solver & Concept Teacher
            </p>
          </div>
        </div>

        {/* Language switch & Subject selector */}
        <div className="flex items-center gap-2">
          {/* Language Toggle: 🇮🇳 हिंदी / 🇬🇧 English */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs hover:bg-amber-100 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}</span>
          </button>
        </div>
      </div>

      {/* Subject Bar */}
      <div className="bg-white/80 backdrop-blur-xs px-3 py-2 border-b border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-slate-500 uppercase px-1 shrink-0">
          {language === 'hi' ? 'विषय:' : 'Subject:'}
        </span>
        {subjectsByClass[selectedClass].map((sub) => (
          <button
            key={sub}
            onClick={() => setCurrentSubject(sub)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              currentSubject === sub
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeakingThis = isPlayingAudio && currentSpeakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-700 text-white font-bold text-xs'
                    : 'bg-gradient-to-tr from-amber-600 to-indigo-700 text-white'
                }`}
              >
                {isUser ? (
                  user?.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    'U'
                  )
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-xs ${
                  isUser
                    ? 'bg-blue-700 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                }`}
              >
                {/* Photo attachment if present */}
                {msg.image && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/20 max-h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.image}
                      alt="Question attachment"
                      className="w-full h-auto object-contain max-h-48"
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Footer Controls: Audio Listen / Stop / Replay */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between gap-2 text-[10px] border-t ${
                    isUser ? 'border-blue-600/60 text-blue-200' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      {/* Audio Controls */}
                      <button
                        onClick={() => handleSpeakAnswer(msg.id, msg.audioText || msg.text)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold transition-colors ${
                          isSpeakingThis
                            ? 'bg-red-100 text-red-700 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Listen to Explanation / व्याख्या सुनें"
                      >
                        {isSpeakingThis ? (
                          <>
                            <Square className="w-3 h-3 text-red-600" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-blue-700" />
                            <span>{language === 'hi' ? '🔊 सुनें' : '🔊 Listen'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeakAnswer(msg.id, msg.audioText || msg.text)}
                        className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        title="Replay Audio"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold bg-white p-3 rounded-2xl border border-blue-200 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>
              {language === 'hi'
                ? 'शिक्षक उत्तर तैयार कर रहे हैं (चरण-दर-चरण समाधान)...'
                : 'AI Tutor is preparing step-by-step solution...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Photo Preview before sending */}
      {selectedPhoto && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-amber-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPhoto} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-amber-900">
              {language === 'hi' ? 'फ़ोटो प्रश्न संलग्न' : 'Question photo attached'}
            </span>
          </div>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-1 rounded-full text-amber-700 hover:bg-amber-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Controls Bar */}
      <form
        onSubmit={handleSendQuestion}
        className="bg-white p-2.5 sm:p-3 border-t border-slate-200 shrink-0 space-y-2"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Photo Upload / Camera input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Ask from Photo / फ़ोटो से प्रश्न पूछें"
          >
            <Camera className="w-5 h-5 text-blue-700" />
          </button>

          {/* Voice Input (STT) */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isRecordingVoice
                ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Ask by Voice / बोलकर प्रश्न पूछें"
          >
            {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-600" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? `कक्षा ${selectedClass} ${currentSubject} का कोई भी प्रश्न पूछें...`
                : `Ask any question for Class ${selectedClass} ${currentSubject}...`
            }
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!question.trim() && !selectedPhoto) || isLoading}
            className="p-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shadow-xs shrink-0"
            title="Send Question"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
            {language === 'hi' ? 'त्वरित प्रश्न:' : 'Quick doubts:'}
          </span>
          {[
            language === 'hi' ? 'त्रिकोणमिति सूत्र समझाएं' : 'Explain Trigonometry formulas',
            language === 'hi' ? 'प्रकाश का परावर्तन नियम' : 'Laws of Reflection of Light',
            language === 'hi' ? 'JAC बोर्ड महत्वपूर्ण प्रश्न' : 'JAC Board High-Weightage Questions',
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(chip);
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
