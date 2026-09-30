'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  X,
  Volume2,
  Loader2,
  AlertCircle,
  ArrowRight,
  FileAudio,
} from 'lucide-react';

interface TranscribeAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
  onUseTranscription?: (text: string) => void;
}

export function TranscribeAudioModal({
  isOpen,
  onClose,
  language,
  onUseTranscription,
}: TranscribeAudioModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up timers and audio object URLs on unmount/close
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (!isOpen) return null;

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में माइक्रोफ़ोन रिकॉर्डिंग समर्थित नहीं है।'
          : 'Microphone recording is not supported in this browser.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = selectedMime || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Auto trigger transcription once recorded
        performTranscription(blob, mime);
      };

      recorder.start(250); // collect 250ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to access microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          language === 'hi'
            ? 'माइक्रोफ़ोन अनुमति अस्वीकृत की गई। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
            : 'Microphone access denied. Please allow microphone permissions in your browser.'
        );
      } else {
        setErrorMessage(
          language === 'hi'
            ? 'माइक्रोफ़ोन प्रारंभ करने में त्रुटि: ' + (err.message || 'अज्ञात त्रुटि')
            : 'Error starting microphone: ' + (err.message || 'Unknown error')
        );
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const performTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Read blob as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to transcribe audio.');
      }

      setTranscription(data.transcription);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(
        err.message ||
          (language === 'hi'
            ? 'ऑडियो ट्रांसक्रिप्शन विफल रहा। कृपया पुनः प्रयास करें।'
            : 'Audio transcription failed. Please try again.')
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyTranscription = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shadow-xs">
              <Mic className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base leading-tight">
                  {language === 'hi' ? 'ऑडियो ट्रांसक्रिप्शन' : 'Transcribe Audio'}
                </h3>
                <span className="text-[10px] bg-amber-400/90 text-blue-950 font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-blue-100">
                {language === 'hi'
                  ? 'माइक से बोलें और सटीक टेक्स्ट प्राप्त करें'
                  : 'Speak into microphone for instant AI speech-to-text'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Recording Status & Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center space-y-3">
            {isRecording ? (
              <div className="space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-red-100 animate-ping absolute" />
                  <button
                    onClick={stopRecording}
                    className="relative w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    <Square className="w-8 h-8 fill-current" />
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="inline-block text-xl font-mono font-bold text-red-700 tracking-wider">
                    {formatTime(recordingSeconds)}
                  </span>
                  <p className="text-xs font-semibold text-red-600 animate-pulse">
                    {language === 'hi' ? 'रिकॉर्डिंग चालू है... (रोकने के लिए दबाएं)' : 'Recording audio... (Tap to stop)'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="w-20 h-20 rounded-full bg-linear-to-tr from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 mx-auto disabled:opacity-50"
                >
                  <Mic className="w-8 h-8" />
                </button>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {language === 'hi' ? 'बोलना शुरू करने के लिए टैप करें' : 'Tap to start speaking'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {language === 'hi'
                      ? 'हिंदी या अंग्रेजी में अपना प्रश्न या नोट्स स्पष्ट आवाज़ में बोलें।'
                      : 'Speak your question or school notes clearly in Hindi or English.'}
                  </p>
                </div>
              </div>
            )}

            {/* Audio Preview if available */}
            {audioUrl && !isRecording && (
              <div className="w-full pt-2 border-t border-slate-200 mt-2 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <FileAudio className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'रिकॉर्ड किया गया ऑडियो:' : 'Recorded Audio:'}</span>
                </div>
                <audio src={audioUrl} controls className="w-full max-w-md h-9" />
              </div>
            )}
          </div>

          {/* Transcribing Loading State */}
          {isTranscribing && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center gap-3 text-indigo-900">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <div className="text-xs">
                <span className="font-bold">
                  {language === 'hi'
                    ? 'AI द्वारा ऑडियो ट्रांसक्राइब किया जा रहा है...'
                    : 'Transcribing audio with Gemini 3.5 Transcribe...'}
                </span>
                <p className="text-[11px] text-indigo-700">
                  {language === 'hi' ? 'कृपया कुछ सेकंड प्रतीक्षा करें' : 'Processing audio waves into text'}
                </p>
              </div>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'ट्रांसक्राइब किया गया टेक्स्ट:' : 'Transcription Result:'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyTranscription}
                    className="p-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied') : (language === 'hi' ? 'कॉपी' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 font-medium leading-relaxed select-text">
                {transcription}
              </div>

              {/* Action buttons */}
              {onUseTranscription && (
                <button
                  onClick={() => {
                    onUseTranscription(transcription);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>
                    {language === 'hi' ? 'इस प्रश्न को AI कक्षा में पूछें' : 'Use in AI Class Doubt'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            Model: <strong className="text-slate-700">gemini-3.5-transcribe</strong>
          </span>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
