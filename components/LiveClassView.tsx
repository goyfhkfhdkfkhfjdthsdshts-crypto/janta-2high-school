'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LiveClassSession,
  SchoolClass,
  UserProfile,
} from '@/lib/types';
import { SchoolLogo } from './SchoolLogo';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Radio,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Users,
  Plus,
  Play,
  Lock,
  ArrowLeft,
  Volume2,
} from 'lucide-react';

interface LiveClassViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

export function LiveClassView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: LiveClassViewProps) {
  // Session states
  const [sessions, setSessions] = useState<LiveClassSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveClassSession | null>(null);
  const [inMeeting, setInMeeting] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // Student join input
  const [studentName, setStudentName] = useState(user?.name || '');

  // Teacher start inputs
  const [teacherClass, setTeacherClass] = useState<SchoolClass>(selectedClass);
  const [teacherSubject, setTeacherSubject] = useState('Mathematics');
  const [teacherName, setTeacherName] = useState(user?.name || 'Mr. R. K. Sharma');
  const [teacherTitle, setTeacherTitle] = useState('Chapter Problem Solving & Live Discussion');
  const [isStartingLive, setIsStartingLive] = useState(false);

  // Meeting connection status
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed' | 'ended'>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Cleanup Jitsi instance
  const cleanupJitsi = useCallback(() => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (e) {
        console.error('Error disposing Jitsi API:', e);
      }
      jitsiApiRef.current = null;
    }
  }, []);

  // Fetch active sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/live/sessions');
      const data = await res.json();
      if (res.ok && data.sessions) {
        setSessions(data.sessions);

        // If currently in a meeting, check if it was ended by teacher
        if (activeSession) {
          const current = data.sessions.find((s: LiveClassSession) => s.id === activeSession.id);
          if (current && current.status === 'ended') {
            setConnectionStatus('ended');
            cleanupJitsi();
          }
        }
      }
    } catch (err) {
      console.error('Error fetching live sessions:', err);
    }
  }, [activeSession, cleanupJitsi]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  // Keep studentName updated if user profile loads
  useEffect(() => {
    if (user?.name && !studentName) {
      setStudentName(user.name);
    }
  }, [user, studentName]);

  // Launch Jitsi Meeting
  const startJitsiMeeting = (session: LiveClassSession, asTeacher: boolean) => {
    cleanupJitsi();
    setConnectionStatus('connecting');
    setInMeeting(true);
    setIsTeacherMode(asTeacher);

    // Ensure external_api script is present
    const initJitsiInstance = () => {
      if (!jitsiContainerRef.current) {
        setTimeout(initJitsiInstance, 300);
        return;
      }

      if (typeof window.JitsiMeetExternalAPI === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsiInstance();
        script.onerror = () => {
          setConnectionStatus('failed');
        };
        document.body.appendChild(script);
        return;
      }

      try {
        const domain = 'meet.jit.si';
        const displayName = asTeacher
          ? `${session.teacherName} (Teacher)`
          : (studentName.trim() || 'Student');

        const options = {
          roomName: session.meetingId,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            // Student audio & video OFF by default as required
            startWithAudioMuted: !asTeacher,
            startWithVideoMuted: !asTeacher,
            disableDeepLinking: true,
            enableWelcomePage: false,
            liveStreamingEnabled: false,
            fileRecordingsEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            TOOLBAR_BUTTONS: asTeacher
              ? [
                  'microphone',
                  'camera',
                  'closedcaptions',
                  'desktop',
                  'fullscreen',
                  'hangup',
                  'chat',
                  'raisehand',
                  'tileview',
                ]
              : [
                  'microphone',
                  'camera',
                  'fullscreen',
                  'hangup',
                  'chat',
                  'raisehand',
                  'tileview',
                ],
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // REAL CONNECTION EVENTS
        api.addEventListener('videoConferenceJoined', () => {
          // MANDATORY: Show "Live Connected" ONLY after the actual video meeting connection succeeds
          setConnectionStatus('connected');
        });

        api.addEventListener('videoConferenceLeft', () => {
          handleLeaveMeeting();
        });

        api.addEventListener('readyToClose', () => {
          handleLeaveMeeting();
        });

        api.addEventListener('audioMuteStatusChanged', (e: { muted: boolean }) => {
          setIsAudioMuted(e.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (e: { muted: boolean }) => {
          setIsVideoMuted(e.muted);
        });

        api.addEventListener('suspended', () => {
          setConnectionStatus('failed');
        });
      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        setConnectionStatus('failed');
      }
    };

    setTimeout(initJitsiInstance, 200);
  };

  // Student joins live
  const handleStudentJoin = (session: LiveClassSession) => {
    if (!studentName.trim()) {
      alert('Please enter your Student Name to join');
      return;
    }
    setActiveSession(session);
    startJitsiMeeting(session, false);
  };

  // Teacher starts live
  const handleTeacherStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    setIsStartingLive(true);
    try {
      const res = await fetch('/api/live/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolClass: teacherClass,
          subject: teacherSubject,
          teacherName,
          title: teacherTitle,
          createdBy: user?.email || 'Teacher',
        }),
      });

      const data = await res.json();
      if (res.ok && data.session) {
        setActiveSession(data.session);
        fetchSessions();
        startJitsiMeeting(data.session, true);
      } else {
        alert(data.message || 'Failed to start live session');
      }
    } catch (err) {
      console.error('Error starting live session:', err);
      alert('Failed to start live session. Please check your network connection.');
    } finally {
      setIsStartingLive(false);
    }
  };

  // Teacher ends live session
  const handleEndLiveSession = async () => {
    if (!activeSession) return;
    if (!window.confirm('Are you sure you want to end this live class for all students?')) {
      return;
    }

    try {
      await fetch('/api/live/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: activeSession.id }),
      });
      setConnectionStatus('ended');
      cleanupJitsi();
      fetchSessions();
    } catch (err) {
      console.error('Error ending session:', err);
    }
  };

  // Student or Teacher leaves view
  const handleLeaveMeeting = () => {
    cleanupJitsi();
    setInMeeting(false);
    setActiveSession(null);
    setConnectionStatus('idle');
    fetchSessions();
  };

  // Active Live session for current class
  const liveForSelectedClass = sessions.filter(
    (s) => s.status === 'live' && s.class === selectedClass
  );
  const otherLiveSessions = sessions.filter(
    (s) => s.status === 'live' && s.class !== selectedClass
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner / Logo */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SchoolLogo size={46} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Real Live Classroom
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 animate-pulse">
                <Radio className="w-3 h-3" />
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Janta +2 High School Khalari • Class {selectedClass} Session
            </p>
          </div>
        </div>

        {/* Start Live button for Teacher */}
        {!inMeeting && (
          <button
            onClick={() => {
              if (isAdmin) {
                const formElem = document.getElementById('teacher-start-form');
                formElem?.scrollIntoView({ behavior: 'smooth' });
              } else {
                onOpenAdminModal();
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
              isAdmin
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
            }`}
          >
            {isAdmin ? (
              <>
                <Plus className="w-4 h-4" />
                <span>Start Live</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Teacher Login</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* ACTIVE MEETING STAGE */}
      {inMeeting && activeSession ? (
        <div className="bg-slate-950 rounded-3xl p-3 sm:p-4 text-white shadow-2xl border border-slate-800 space-y-3">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLeaveMeeting}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Leave Classroom"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                    Class {activeSession.class} Live
                  </span>
                  <h3 className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-xs">
                    {activeSession.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subject: <span className="text-blue-400 font-semibold">{activeSession.subject}</span> • Teacher:{' '}
                  <span className="text-slate-200 font-medium">{activeSession.teacherName}</span>
                </p>
              </div>
            </div>

            {/* Connection Status Badge */}
            <div className="flex items-center gap-2">
              {connectionStatus === 'connecting' && (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Connecting to Live Class...
                </span>
              )}

              {connectionStatus === 'connected' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Live Connected
                </span>
              )}

              {connectionStatus === 'failed' && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-800">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  Live connection failed
                </span>
              )}

              {connectionStatus === 'ended' && (
                <span className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                  This Live Class has ended.
                </span>
              )}
            </div>
          </div>

          {/* REAL VIDEO EMBED AREA */}
          <div className="relative w-full aspect-video min-h-[380px] sm:min-h-[460px] bg-black rounded-2xl overflow-hidden border border-slate-800">
            {/* The Jitsi Meeting Mount */}
            <div
              id="jitsi-container"
              ref={jitsiContainerRef}
              className="w-full h-full min-h-[380px] sm:min-h-[460px]"
            />

            {/* If Connection Failed: Show required buttons [ Retry ] [ Reconnect ] [ Open in Browser ] */}
            {connectionStatus === 'failed' && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-red-500 animate-bounce" />
                <h4 className="text-base font-bold text-white">Live connection failed</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  We could not connect directly inside the frame. You can retry connection or open the official room in your browser.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => startJitsiMeeting(activeSession, isTeacherMode)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                  <button
                    onClick={() => startJitsiMeeting(activeSession, isTeacherMode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    Reconnect
                  </button>
                  <a
                    href={activeSession.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Browser
                  </a>
                </div>
              </div>
            )}

            {/* If Class Ended */}
            {connectionStatus === 'ended' && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <VideoOff className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-lg font-bold text-white">This Live Class has ended.</h4>
                <p className="text-xs text-slate-400">
                  The teacher has concluded this live class session. Study materials and MCQ tests are available.
                </p>
                <button
                  onClick={handleLeaveMeeting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Return to Live Class List
                </button>
              </div>
            )}
          </div>

          {/* TEACHER / STUDENT CONTROLS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              {/* Camera Toggle */}
              <button
                onClick={() => {
                  if (jitsiApiRef.current) {
                    jitsiApiRef.current.executeCommand('toggleVideo');
                  }
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isVideoMuted
                    ? 'bg-red-900/60 text-red-200 border border-red-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Camera ON/OFF"
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4 text-red-400" /> : <Video className="w-4 h-4 text-emerald-400" />}
                <span>Camera {isVideoMuted ? 'OFF' : 'ON'}</span>
              </button>

              {/* Mic Toggle */}
              <button
                onClick={() => {
                  if (jitsiApiRef.current) {
                    jitsiApiRef.current.executeCommand('toggleAudio');
                  }
                }}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isAudioMuted
                    ? 'bg-red-900/60 text-red-200 border border-red-700'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title="Microphone ON/OFF"
              >
                {isAudioMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>Mic {isAudioMuted ? 'OFF' : 'ON'}</span>
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isSpeakerOn ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-slate-400'
                }`}
                title="Speaker ON/OFF"
              >
                <Volume2 className="w-4 h-4" />
                <span>Speaker</span>
              </button>
            </div>

            {/* End Live (TEACHER ONLY) vs Leave Class (STUDENT) */}
            <div>
              {isTeacherMode && isAdmin ? (
                <button
                  onClick={handleEndLiveSession}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>🔴 End Live</span>
                </button>
              ) : (
                <button
                  onClick={handleLeaveMeeting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PhoneOff className="w-4 h-4 text-red-400" />
                  <span>Leave Live Class</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* STUDENT JOIN DASHBOARD: Shows LIVE NOW cards */}
      {!inMeeting && (
        <div className="space-y-4">
          {/* Active Live for current class */}
          {liveForSelectedClass.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Live Now for Class {selectedClass}
              </h3>

              {liveForSelectedClass.map((session) => (
                <div
                  key={session.id}
                  className="bg-gradient-to-br from-red-500/10 via-white to-red-500/5 rounded-3xl p-5 border-2 border-red-300 shadow-md space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600 text-white">
                        <Radio className="w-3.5 h-3.5" />
                        🔴 LIVE NOW
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Class: <span className="font-bold text-slate-900">{session.class}</span> • Subject:{' '}
                        <span className="font-bold text-blue-700">{session.subject}</span> • Teacher:{' '}
                        <span className="font-bold text-slate-900">{session.teacherName}</span>
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6 animate-pulse" />
                    </div>
                  </div>

                  {/* Student Name Input & Join button */}
                  <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-red-200 space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Enter Student Name to Join
                      </label>
                      <input
                        type="text"
                        placeholder="Your Full Name (e.g. Rahul Kumar)"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="text-[11px] text-slate-500">
                        * Camera and Mic are muted by default. No password required.
                      </p>
                      <button
                        onClick={() => handleStudentJoin(session)}
                        className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        [ JOIN LIVE ]
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No active live class currently running for Class {selectedClass}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Classes are scheduled as per the official school timetable. If your teacher has scheduled a class, it will appear here in real-time.
              </p>
            </div>
          )}

          {/* Other classes currently live */}
          {otherLiveSessions.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Other Live Classes in School
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherLiveSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 mb-1">
                        Class {session.class} • {session.subject}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {session.title}
                      </h5>
                      <p className="text-[11px] text-slate-500">{session.teacherName}</p>
                    </div>
                    <button
                      onClick={() => handleStudentJoin(session)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEACHER START LIVE SECTION */}
          <div
            id="teacher-start-form"
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  👨‍🏫
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Teacher Live Broadcast Control
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Start live audio/video session from mobile phone or computer
                  </p>
                </div>
              </div>

              {!isAdmin && (
                <button
                  onClick={onOpenAdminModal}
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Unlock Teacher Mode
                </button>
              )}
            </div>

            {isAdmin ? (
              <form onSubmit={handleTeacherStart} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Class
                    </label>
                    <select
                      value={teacherClass}
                      onChange={(e) => setTeacherClass(e.target.value as SchoolClass)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-medium"
                    >
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                      <option value="11">Class 11 (+2)</option>
                      <option value="12">Class 12 (+2)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={teacherSubject}
                      onChange={(e) => setTeacherSubject(e.target.value)}
                      placeholder="e.g. Mathematics"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Mr. R. K. Sharma"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Live Class Title
                    </label>
                    <input
                      type="text"
                      value={teacherTitle}
                      onChange={(e) => setTeacherTitle(e.target.value)}
                      placeholder="e.g. Height & Distance Trigonometry Problems"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isStartingLive}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>[ START LIVE ]</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Only verified teachers and administrators can start or broadcast live classes.
                </p>
                <button
                  onClick={onOpenAdminModal}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                >
                  Enter Teacher Password to Start Live
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
