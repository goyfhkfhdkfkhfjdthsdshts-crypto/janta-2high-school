'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChatMessage,
  ChatConversation,
  UserProfile,
  SchoolClass,
  UserRole,
} from '@/lib/types';
import { SchoolLogo } from './SchoolLogo';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  Paperclip,
  Mic,
  MicOff,
  Smile,
  Trash2,
  Reply,
  Volume2,
  Search,
  Bell,
  BellOff,
  RefreshCw,
  Users,
  User,
  ShieldCheck,
  X,
  FileText,
  Download,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface ChatViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function ChatView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: ChatViewProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>(`group-${selectedClass}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Attachments & Voice
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = user?.id || 'guest_student';
  const currentUserName = user?.name || (user?.email ? user.email.split('@')[0] : 'Student');
  const currentUserRole: UserRole = isAdmin ? 'admin' : user?.role || 'student';

  // Fetch all conversations for user
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/chat?type=conversations&userId=${encodeURIComponent(currentUserId)}&role=${currentUserRole}&class=${selectedClass}&userName=${encodeURIComponent(currentUserName)}`
      );
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  }, [currentUserId, currentUserRole, selectedClass, currentUserName]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch(
        `/api/chat?conversationId=${encodeURIComponent(convId)}&userId=${encodeURIComponent(currentUserId)}&role=${currentUserRole}`
      );
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [currentUserId, currentUserRole]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Update active conversation when class changes (if current is group)
  useEffect(() => {
    if (activeConvId.startsWith('group-')) {
      const targetGroup = `group-${selectedClass}`;
      setActiveConvId(targetGroup);
      fetchMessages(targetGroup);
    }
  }, [selectedClass]);

  // Load messages on active conv change
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId, fetchMessages]);

  // Auto-polling for real-time updates every 4 seconds
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      fetchMessages(activeConvId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConvId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Document / PDF selection
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice recording
  const handleStartVoiceRecord = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          // Send voice message
          sendMessage(
            language === 'hi' ? '🎤 वॉयस संदेश' : '🎤 Voice message',
            base64Audio,
            'audio'
          );
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const handleStopVoiceRecord = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancelVoiceRecord = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecordingVoice(false);
      if (timerRef.current) clearInterval(timerRef.current);
      audioChunksRef.current = [];
    }
  };

  // Send message
  const sendMessage = async (
    textToSend: string,
    mediaUrlToSend?: string,
    mediaTypeToSend?: 'image' | 'file' | 'audio',
    fileNameToSend?: string
  ) => {
    if (!textToSend.trim() && !mediaUrlToSend) return;

    const payload = {
      conversationId: activeConvId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: user?.picture,
      text: textToSend.trim(),
      mediaUrl: mediaUrlToSend,
      mediaType: mediaTypeToSend,
      fileName: fileNameToSend,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text.substring(0, 70),
          }
        : undefined,
    };

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      ...payload,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setSelectedPhoto(null);
    setAttachedFile(null);
    setReplyingTo(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
        );
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSendForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPhoto) {
      sendMessage(
        inputText || (language === 'hi' ? 'फ़ोटो साझा की' : 'Shared a photo'),
        selectedPhoto,
        'image'
      );
    } else if (attachedFile) {
      sendMessage(
        inputText || (language === 'hi' ? 'दस्तावेज़ संलग्न' : 'Document attached'),
        attachedFile.url,
        'file',
        attachedFile.name
      );
    } else {
      sendMessage(inputText);
    }
  };

  // Reaction
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reaction',
          messageId,
          emoji,
          userId: currentUserId,
          userName: currentUserName,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? data.message : m))
        );
      }
    } catch (err) {
      console.error('Error updating reaction:', err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस संदेश को हटाना चाहते हैं?' : 'Delete this message?')) return;
    try {
      const res = await fetch(
        `/api/chat?id=${encodeURIComponent(messageId)}&userId=${encodeURIComponent(currentUserId)}&role=${currentUserRole}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  // Toggle Mute
  const handleToggleMute = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mute',
          conversationId: activeConvId,
          userId: currentUserId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? { ...c, isMuted: data.isMuted } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Filter messages by search query
  const displayedMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                {activeConv?.title || `Class ${selectedClass} Discussion Group`}
              </h2>
              {activeConv?.type === 'group' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 shrink-0">
                  Class {activeConv.class || selectedClass}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {activeConv?.subtitle || 'Verified Academic School Chat'}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search in chat */}
          <button
            onClick={() => setIsSearching(!isSearching)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              isSearching
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mute toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              activeConv?.isMuted
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
            title={activeConv?.isMuted ? 'Muted' : 'Mute Notifications'}
          >
            {activeConv?.isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>

          {/* Refresh */}
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await fetchMessages(activeConvId);
              await fetchConversations();
              setIsRefreshing(false);
            }}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors"
            title="Refresh Chat"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Conversation Selector Tabs */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">
          {language === 'hi' ? 'संवाद:' : 'Channels:'}
        </span>
        {conversations.map((conv) => {
          const isActive = activeConvId === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {conv.type === 'group' ? (
                <Users className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span>{conv.title.split(' - ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* In-chat Search Input (if opened) */}
      {isSearching && (
        <div className="bg-amber-50/70 p-2.5 border-b border-amber-200/80 flex items-center gap-2 shrink-0 animate-in fade-in">
          <Search className="w-4 h-4 text-amber-700 shrink-0" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'इस चैट में संदेश खोजें...' : 'Search in this conversation...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white px-3 py-1.5 text-xs rounded-xl border border-amber-300 focus:outline-hidden font-medium text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => {
              setIsSearching(false);
              setSearchQuery('');
            }}
            className="text-xs font-bold text-amber-800 hover:underline px-1"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-7 h-7 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">{language === 'hi' ? 'संदेश लोड हो रहे हैं...' : 'Loading messages...'}</p>
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">
              {searchQuery
                ? language === 'hi' ? 'खोज से संबंधित कोई संदेश नहीं मिला' : 'No matching messages found'
                : language === 'hi' ? 'इस समूह में शैक्षणिक संवाद शुरू करें' : 'Start the academic conversation'}
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              {language === 'hi'
                ? 'प्रश्न पूछें, नोट्स साझा करें या शिक्षक से मार्गदर्शन प्राप्त करें।'
                : 'Ask questions, share study notes, or discuss lessons with teachers and classmates.'}
            </p>
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            const isTeacher = msg.senderRole === 'teacher';
            const isPrincipal = msg.senderRole === 'principal';
            const isAdminSender = msg.senderRole === 'admin';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs shadow-xs ${
                    isPrincipal
                      ? 'bg-amber-600 text-white'
                      : isTeacher
                      ? 'bg-indigo-700 text-white'
                      : isAdminSender
                      ? 'bg-rose-700 text-white'
                      : isOwn
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  {msg.senderAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.senderAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    msg.senderName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs space-y-1 relative ${
                    isOwn
                      ? 'bg-blue-700 text-white rounded-tr-none'
                      : isPrincipal
                      ? 'bg-amber-50 text-slate-900 border border-amber-300 rounded-tl-none'
                      : isTeacher
                      ? 'bg-indigo-50/90 text-slate-900 border border-indigo-200 rounded-tl-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Sender Name & Role Badge */}
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span
                      className={`font-bold truncate ${
                        isOwn
                          ? 'text-blue-200'
                          : isPrincipal
                          ? 'text-amber-900 font-extrabold'
                          : isTeacher
                          ? 'text-indigo-800 font-extrabold'
                          : 'text-slate-600'
                      }`}
                    >
                      {msg.senderName}
                    </span>
                    {(isTeacher || isPrincipal || isAdminSender) && (
                      <span
                        className={`px-1.5 py-0.2 rounded-md font-black text-[9px] uppercase ${
                          isPrincipal
                            ? 'bg-amber-200 text-amber-950'
                            : isTeacher
                            ? 'bg-indigo-200 text-indigo-950'
                            : 'bg-rose-200 text-rose-950'
                        }`}
                      >
                        {msg.senderRole}
                      </span>
                    )}
                  </div>

                  {/* Quoted Reply if present */}
                  {msg.replyTo && (
                    <div
                      className={`p-2 rounded-xl text-[11px] border-l-3 mb-1 ${
                        isOwn
                          ? 'bg-blue-800/80 border-blue-300 text-blue-100'
                          : 'bg-slate-100 border-blue-600 text-slate-600'
                      }`}
                    >
                      <span className="font-bold block text-[10px] text-blue-400">
                        Replying to {msg.replyTo.senderName}
                      </span>
                      <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Photo Attachment if present */}
                  {msg.mediaUrl && msg.mediaType === 'image' && (
                    <div className="rounded-xl overflow-hidden border border-black/10 my-1 max-h-56">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.mediaUrl}
                        alt="Photo attachment"
                        className="w-full h-auto object-cover max-h-56"
                      />
                    </div>
                  )}

                  {/* Document Attachment if present */}
                  {msg.mediaUrl && msg.mediaType === 'file' && (
                    <div
                      className={`p-2 rounded-xl flex items-center justify-between gap-2 border my-1 ${
                        isOwn ? 'bg-blue-800/80 border-blue-500' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 shrink-0 text-red-500" />
                        <span className="text-xs font-semibold truncate">
                          {msg.fileName || 'Attached Document'}
                        </span>
                      </div>
                      <a
                        href={msg.mediaUrl}
                        download={msg.fileName || 'document.pdf'}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/30 text-xs font-bold shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Audio Message if present */}
                  {msg.mediaUrl && msg.mediaType === 'audio' && (
                    <div className="my-1">
                      <audio controls src={msg.mediaUrl} className="w-full h-8" />
                    </div>
                  )}

                  {/* Text Message */}
                  {msg.text && (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.text}
                    </p>
                  )}

                  {/* Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {Object.entries(msg.reactions).map(([emoji, usersArr]) => (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            usersArr.includes(currentUserName)
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : isOwn
                              ? 'bg-blue-800/90 text-white border-blue-600'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                          title={usersArr.join(', ')}
                        >
                          <span>{emoji}</span>
                          <span>{usersArr.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Message Action Bar */}
                  <div
                    className={`flex items-center justify-between gap-2 text-[10px] pt-1 border-t ${
                      isOwn ? 'border-blue-600 text-blue-200' : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Quick Action Icons: Reply, Emoji, Delete */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      {/* Emoji reaction shortcuts */}
                      <button
                        onClick={() => handleToggleReaction(msg.id, '👍')}
                        className="hover:scale-125 transition-transform px-0.5"
                        title="Thumb up"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleToggleReaction(msg.id, '👏')}
                        className="hover:scale-125 transition-transform px-0.5"
                        title="Clap"
                      >
                        👏
                      </button>
                      <button
                        onClick={() => handleToggleReaction(msg.id, '💡')}
                        className="hover:scale-125 transition-transform px-0.5"
                        title="Good Idea"
                      >
                        💡
                      </button>

                      {/* Reply button */}
                      <button
                        onClick={() => setReplyingTo(msg)}
                        className={`p-1 rounded hover:bg-black/10 transition-colors ${
                          isOwn ? 'text-blue-100' : 'text-slate-500'
                        }`}
                        title="Reply to message"
                      >
                        <Reply className="w-3 h-3" />
                      </button>

                      {/* Delete button (own or admin/teacher) */}
                      {(isOwn || isAdmin || currentUserRole === 'teacher' || currentUserRole === 'principal') && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className={`p-1 rounded hover:bg-red-500/20 text-rose-300 hover:text-rose-100 transition-colors ${
                            !isOwn ? 'text-rose-600' : ''
                          }`}
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quoted Reply Preview Bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-4 h-4 text-blue-700 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-bold text-blue-900 block truncate">
                Replying to {replyingTo.senderName}:
              </span>
              <span className="text-slate-600 truncate block">
                {replyingTo.text || 'Attachment'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-blue-700 hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Selected Photo Preview */}
      {selectedPhoto && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPhoto} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-semibold text-slate-800">
              {language === 'hi' ? 'फ़ोटो संलग्न' : 'Photo attached'}
            </span>
          </div>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attached Document Preview */}
      {attachedFile && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 truncate">
              {attachedFile.name}
            </span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {isRecordingVoice ? (
        <div className="bg-red-50 px-4 py-3 border-t border-red-200 flex items-center justify-between gap-3 shrink-0 animate-pulse">
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span>
              {language === 'hi' ? 'वॉयस रिकॉर्ड हो रहा है...' : 'Recording voice message...'} ({recordingSeconds}s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelVoiceRecord}
              className="px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleStopVoiceRecord}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      ) : (
        /* Chat Input Controls Bar */
        <form
          onSubmit={handleSendForm}
          className="bg-white p-2.5 sm:p-3 border-t border-slate-200 shrink-0 flex items-center gap-1.5 sm:gap-2"
        >
          {/* Photo File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {/* Doc File Input */}
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleDocSelect}
            className="hidden"
          />

          {/* Attach Photo button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Attach Photo"
          >
            <ImageIcon className="w-4 h-4 text-blue-700" />
          </button>

          {/* Attach Document button */}
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
            title="Attach Document / PDF"
          >
            <Paperclip className="w-4 h-4 text-slate-700" />
          </button>

          {/* Voice Record button */}
          <button
            type="button"
            onClick={handleStartVoiceRecord}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-amber-700 transition-colors shrink-0"
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4 text-amber-600" />
          </button>

          {/* Message Text Input */}
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'संदेश लिखें, प्रश्न पूछें या नोट्स साझा करें...'
                : 'Type a message, doubt or share notes...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 transition-all font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedPhoto && !attachedFile}
            className="p-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shadow-xs shrink-0 cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
