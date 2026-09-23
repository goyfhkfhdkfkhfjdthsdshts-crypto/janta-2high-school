'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { SchoolClass, UserProfile, LiveClassSession, Notice } from '@/lib/types';
import {
  BookOpen,
  Video,
  Bot,
  FileCheck2,
  Calendar,
  Bell,
  Clock,
  Award,
  Users,
  Radio,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Play,
  GraduationCap,
  UserCheck,
  HelpCircle,
  ClipboardList,
  TrendingUp,
  BookmarkCheck,
  Settings,
  Search,
  School,
} from 'lucide-react';

interface HomeViewProps {
  user: UserProfile | null;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onNavigateTab: (tab: any) => void;
  onOpenSection: (section: string) => void;
  language: 'hi' | 'en';
}

export function HomeView({
  user,
  selectedClass,
  onSelectClass,
  onNavigateTab,
  onOpenSection,
  language,
}: HomeViewProps) {
  const [liveSessions, setLiveSessions] = useState<LiveClassSession[]>([]);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);

  useEffect(() => {
    // Fetch live sessions
    fetch('/api/live/sessions')
      .then((res) => res.json())
      .then((data) => {
        if (data.sessions) {
          setLiveSessions(data.sessions.filter((s: LiveClassSession) => s.status === 'live'));
        }
      })
      .catch(() => {});

    // Fetch notices for marquee/summary
    fetch('/api/data/notices')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setRecentNotices(data.data.slice(0, 2));
        }
      })
      .catch(() => {});
  }, []);

  const activeLiveForCurrentClass = liveSessions.find((s) => s.class === selectedClass);
  const anyActiveLive = liveSessions[0];

  const dashboardCards = [
    {
      id: 'attendance',
      title: 'Online Attendance',
      subtitle: 'Voice & Manual Daily Check-in',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Daily Attendance',
      action: () => onOpenSection('attendance'),
    },
    {
      id: 'study',
      title: 'Study Books',
      subtitle: 'NCERT / JCERT Class ' + selectedClass,
      icon: BookOpen,
      color: 'from-blue-600 to-indigo-700',
      tag: 'Textbooks',
      action: () => onOpenSection('study'),
    },
    {
      id: 'live',
      title: 'Live Classes',
      subtitle: 'Real Video Audio Classroom',
      icon: Video,
      color: 'from-rose-600 to-red-700',
      tag: activeLiveForCurrentClass ? '🔴 LIVE NOW' : 'Scheduled',
      isLive: !!activeLiveForCurrentClass,
      action: () => onOpenSection('live'),
    },
    {
      id: 'ai',
      title: 'AI Class (24/7)',
      subtitle: 'Voice, Photo & Text Doubts',
      icon: Bot,
      color: 'from-amber-600 to-orange-700',
      tag: 'Smart Tutor',
      action: () => onOpenSection('ai'),
    },
    {
      id: 'mcq',
      title: 'JAC MCQ Practice',
      subtitle: 'Objective Chapter & Mock Tests',
      icon: FileCheck2,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Practice',
      action: () => onOpenSection('mcq'),
    },
    {
      id: 'homework',
      title: language === 'hi' ? 'दैनिक गृहकार्य' : 'Daily Homework',
      subtitle: language === 'hi' ? 'विषयवार कार्य, नोट्स व प्रगति' : 'Subject Assignments & Deadlines',
      icon: ClipboardList,
      color: 'from-emerald-700 to-teal-800',
      tag: 'Assignments',
      action: () => onOpenSection('homework'),
    },
    {
      id: 'calendar',
      title: language === 'hi' ? 'स्कूल कैलेंडर' : 'School Calendar',
      subtitle: language === 'hi' ? 'अवकाश, परीक्षा व वार्षिक तिथियां' : 'Holidays, Exams & Activity Dates',
      icon: Calendar,
      color: 'from-amber-700 to-orange-800',
      tag: 'Calendar',
      action: () => onOpenSection('calendar'),
    },
    {
      id: 'progress',
      title: language === 'hi' ? 'मेरी प्रगति' : 'My Progress',
      subtitle: language === 'hi' ? 'MCQ स्कोर, उपस्थिति व टेस्ट विश्लेषण' : 'Analytics, Scores & Strengths',
      icon: TrendingUp,
      color: 'from-indigo-700 to-blue-900',
      tag: 'Analytics',
      action: () => onOpenSection('progress'),
    },
    {
      id: 'saved',
      title: language === 'hi' ? 'मेरी सहेजी गई सामग्री' : 'My Saved Library',
      subtitle: language === 'hi' ? 'बुकमार्क किए गए प्रश्न व किताबें' : 'Bookmarked Questions & Books',
      icon: BookmarkCheck,
      color: 'from-blue-700 to-cyan-800',
      tag: 'Bookmarks',
      action: () => onOpenSection('saved'),
    },
    {
      id: 'timetable',
      title: 'Weekly Timetable',
      subtitle: 'Routine with Saturday Spl Schedule',
      icon: Clock,
      color: 'from-sky-600 to-blue-700',
      tag: 'Schedule',
      action: () => onOpenSection('timetable'),
    },
    {
      id: 'notice',
      title: 'Notice Board',
      subtitle: 'Official Circulars & Orders',
      icon: Bell,
      color: 'from-purple-600 to-indigo-800',
      tag: 'Circulars',
      action: () => onOpenSection('notice'),
    },
    {
      id: 'exam',
      title: 'Exam Schedule',
      subtitle: 'JAC Board & Terminal Date Sheet',
      icon: Calendar,
      color: 'from-amber-700 to-yellow-800',
      tag: 'Datesheet',
      action: () => onOpenSection('exam'),
    },
    {
      id: 'results',
      title: 'Published Results',
      subtitle: 'Search Roll Code & Marksheet',
      icon: Award,
      color: 'from-cyan-700 to-blue-800',
      tag: 'Marks',
      action: () => onOpenSection('results'),
    },
    {
      id: 'faculty',
      title: 'Faculty & Staff',
      subtitle: 'Teachers Directory & Qualifications',
      icon: Users,
      color: 'from-slate-700 to-slate-900',
      tag: 'Directory',
      action: () => onOpenSection('faculty'),
    },
    {
      id: 'about',
      title: language === 'hi' ? 'विद्यालय के बारे में' : 'About Our School',
      subtitle: language === 'hi' ? 'इतिहास, सुविधाएं, नियम व फोटो गैलरी' : 'History, Facilities, Staff & Gallery',
      icon: School,
      color: 'from-blue-900 to-indigo-950',
      tag: 'Official',
      action: () => onOpenSection('about'),
    },
    {
      id: 'settings',
      title: language === 'hi' ? 'सेटिंग्स व सुरक्षा' : 'App Settings',
      subtitle: language === 'hi' ? 'भाषा, नोटिफिकेशन व सुरक्षा' : 'Language, Alerts & Offline Storage',
      icon: Settings,
      color: 'from-slate-800 to-slate-950',
      tag: 'Preferences',
      action: () => onOpenSection('settings'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: '18 Guides, Solutions & Contact',
      icon: HelpCircle,
      color: 'from-blue-700 to-indigo-900',
      tag: 'सहायता केंद्र',
      action: () => onOpenSection('help'),
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* REAL-TIME LIVE CLASS BANNER (if active) */}
      {(activeLiveForCurrentClass || anyActiveLive) && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-red-400 animate-in fade-in space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white text-red-700 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                🔴 LIVE NOW: Class {(activeLiveForCurrentClass || anyActiveLive).class}
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                {(activeLiveForCurrentClass || anyActiveLive).title}
              </h3>
              <p className="text-xs text-red-100">
                Subject: <span className="font-bold text-white">{(activeLiveForCurrentClass || anyActiveLive).subject}</span> • Teacher:{' '}
                <span className="font-bold text-white">{(activeLiveForCurrentClass || anyActiveLive).teacherName}</span>
              </p>
            </div>

            <button
              onClick={() => onOpenSection('live')}
              className="py-2.5 px-5 bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-transform active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-red-700" />
              <span>[ Join Live ]</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome & School Identity Header */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left relative z-10">
          <div className="flex items-center gap-3">
            <SchoolLogo size={58} showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                  Janta +2 High School
                </h1>
              </div>
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-0.5">
                Khalari, Ranchi • Jharkhand
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/30 rounded-full">
                <span className="text-[11px] font-semibold text-amber-300">
                  शिक्षा • अनुशासन • सफलता
                </span>
              </div>
            </div>
          </div>

          {/* User Welcome Pill */}
          <div className="bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20 text-center sm:text-right shrink-0">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Welcome Back</p>
            <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[160px]">
              {user?.name || 'Student'}
            </p>
            <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
              Current: Class {selectedClass}
            </p>
          </div>
        </div>

        {/* Quick Urgent Notice ticker if available */}
        {recentNotices.length > 0 && (
          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-blue-100">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500 text-white shrink-0">
              Notice
            </span>
            <span className="truncate">{recentNotices[0].title}</span>
            <button
              onClick={() => onOpenSection('notice')}
              className="ml-auto text-[11px] font-bold text-amber-300 hover:underline shrink-0"
            >
              View All
            </button>
          </div>
        )}
      </div>

      {/* Class Selector Bar: [ 9 ] [ 10 ] [ 11 ] [ 12 ] */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            Select Your Class:
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Active: Class {selectedClass}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
            <button
              key={c}
              onClick={() => onSelectClass(c)}
              className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition-all border ${
                selectedClass === c
                  ? 'bg-blue-700 text-white border-blue-700 shadow-md scale-102 ring-2 ring-blue-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Class {c}
            </button>
          ))}
        </div>
      </div>

      {/* About Our School Showcase Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-md border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 ring-2 ring-white/10">
            <School className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                School Information
              </span>
              <span className="text-[11px] text-blue-200 font-semibold">
                Est. 1978 • JAC Code: 23045
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              {language === 'hi' ? 'विद्यालय के बारे में (About Our School)' : 'About Janta +2 High School – Khalari'}
            </h3>
            <p className="text-xs text-blue-100 line-clamp-1">
              {language === 'hi'
                ? 'प्रधानाध्यापक संदेश, सभी 16 कक्षाएं, विज्ञान लैब, कंप्यूटर लैब, खेल व फोटो गैलरी'
                : 'Principal message, 16 classrooms, Labs, IT Center, Sports & verified photos'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSection('about')}
          className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
        >
          <span>{language === 'hi' ? 'विद्यालय देखें →' : 'View School Info →'}</span>
        </button>
      </div>

      {/* Quick Online Attendance Action Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
                Daily Attendance
              </span>
              <span className="text-[11px] text-emerald-200 font-semibold">
                Class {selectedClass}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
              Online Student Attendance System
            </h3>
            <p className="text-xs text-emerald-100">
              बोलकर या टाइप करके आज की उपस्थिति दर्ज करें (Voice or Manual)
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSection('attendance')}
          className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
        >
          <span>Mark Attendance</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main 9 Dashboard Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {dashboardCards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={card.action}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-left group flex items-start gap-4 active:scale-98"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      card.isLive
                        ? 'bg-red-100 text-red-700 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {card.tag}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 leading-snug group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{card.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
