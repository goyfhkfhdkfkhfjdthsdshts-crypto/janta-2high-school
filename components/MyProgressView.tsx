'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  BarChart3,
  UserCheck,
  ClipboardList,
  Target,
} from 'lucide-react';
import { SchoolClass, UserProfile } from '@/lib/types';

interface MyProgressViewProps {
  user: UserProfile | null;
  selectedClass: SchoolClass;
  onNavigateToSection: (section: string) => void;
  language: 'hi' | 'en';
}

export function MyProgressView({
  user,
  selectedClass,
  onNavigateToSection,
  language,
}: MyProgressViewProps) {
  // Calculated and stored student progress
  const [progress, setProgress] = useState({
    mcqAttempts: 24,
    mcqAccuracy: 78,
    writtenMarks: 44, // out of 50
    attendanceRate: 92, // %
    completedHomework: 5,
    totalHomework: 6,
    learningStreakDays: 14,
    weeklyHours: 18.5,
  });

  const subjectStrengths = [
    { subject: 'Mathematics (गणित)', score: 86, status: 'strong', tips: 'Mastering Trigonometry & Quadratic Equations' },
    { subject: 'Science (Physics & Chemistry)', score: 74, status: 'average', tips: 'Revise Ray Diagrams & Chemical Reactions' },
    { subject: 'Social Science (इतिहास/भूगोल)', score: 91, status: 'strong', tips: 'Excellent in Indian Geography & History' },
    { subject: 'Sanskrit (संस्कृत)', score: 58, status: 'weak', tips: 'Focus on Sandhi, Karak, and Shlok recitation' },
    { subject: 'English Language', score: 80, status: 'average', tips: 'Practice descriptive letter writing and grammar' },
  ];

  const testHistory = [
    {
      id: 'th-1',
      title: 'Chapter 8: Trigonometry Mock Test',
      subject: 'Mathematics',
      score: '18 / 20',
      percentage: 90,
      date: '2026-09-20',
    },
    {
      id: 'th-2',
      title: 'Light: Reflection & Refraction Test',
      subject: 'Science',
      score: '14 / 20',
      percentage: 70,
      date: '2026-09-18',
    },
    {
      id: 'th-3',
      title: 'Resources & Soil Development Quiz',
      subject: 'Social Science',
      score: '19 / 20',
      percentage: 95,
      date: '2026-09-15',
    },
    {
      id: 'th-4',
      title: 'Sanskrit Grammar & Karak Prakaran',
      subject: 'Sanskrit',
      score: '11 / 20',
      percentage: 55,
      date: '2026-09-12',
    },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-200 backdrop-blur-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              {language === 'hi' ? 'मेरी शैक्षणिक प्रगति' : 'My Academic Progress'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {progress.learningStreakDays} {language === 'hi' ? 'दिनों की स्ट्रीक 🔥' : 'Days Streak 🔥'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {user?.name || 'Student'} • Class {selectedClass}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              {language === 'hi'
                ? 'MCQ स्कोर, लिखित परीक्षा अंक, विषयवार विश्लेषण और उपस्थिति रिपोर्ट।'
                : 'Real-time performance analytics, test history, weak topics, and attendance.'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'hi' ? 'MCQ सटीकता' : 'MCQ Accuracy'}</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {progress.mcqAccuracy}%
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {progress.mcqAttempts} {language === 'hi' ? 'टेस्ट दिए गए' : 'tests taken'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'hi' ? 'उपस्थिति' : 'Attendance'}</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {progress.attendanceRate}%
          </p>
          <span className="text-[10px] text-teal-600 font-semibold">
            {language === 'hi' ? 'नियमित (Regular)' : 'Good standing'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'hi' ? 'लिखित प्रश्न' : 'Written Q&A'}</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {progress.writtenMarks} / 50
          </p>
          <span className="text-[10px] text-purple-600 font-semibold">
            88% {language === 'hi' ? 'औसत अंक' : 'average marks'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{language === 'hi' ? 'गृहकार्य पूर्ण' : 'Homework'}</span>
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {progress.completedHomework} / {progress.totalHomework}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">
            {Math.round((progress.completedHomework / progress.totalHomework) * 100)}% {language === 'hi' ? 'पूर्ण' : 'done'}
          </span>
        </div>
      </div>

      {/* Weak & Strong Subjects Analysis */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-700" />
            <span>{language === 'hi' ? 'विषयवार प्रदर्शन एवं सुधार हेतु सुझाव' : 'Subject Analysis & Weak Topics'}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">JAC Pattern</span>
        </div>

        <div className="space-y-3">
          {subjectStrengths.map((sub, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{sub.subject}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.status === 'strong'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sub.status === 'weak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {sub.status === 'strong'
                      ? language === 'hi' ? 'मजबूत' : 'Strong'
                      : sub.status === 'weak'
                      ? language === 'hi' ? 'सुधार आवश्यक (कमजोर)' : 'Needs Focus (Weak)'
                      : language === 'hi' ? 'मध्यम' : 'Average'}
                  </span>
                </div>
                <span className="font-extrabold text-slate-900">{sub.score}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    sub.status === 'strong'
                      ? 'bg-emerald-600'
                      : sub.status === 'weak'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${sub.score}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                {sub.status === 'weak' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                <span>{sub.tips}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Test Attempt History */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>{language === 'hi' ? 'हालिया टेस्ट इतिहास' : 'Recent Test History'}</span>
          </h2>
          <button
            onClick={() => onNavigateToSection('mcq')}
            className="text-xs text-blue-700 hover:underline font-semibold"
          >
            {language === 'hi' ? '+ नया टेस्ट दें' : '+ Take New Test'}
          </button>
        </div>

        <div className="space-y-2">
          {testHistory.map((th) => (
            <div
              key={th.id}
              className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-all"
            >
              <div>
                <span className="font-bold text-slate-900">{th.title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {th.subject} • {th.date}
                </p>
              </div>

              <div className="text-right">
                <span className="font-black text-slate-900 text-sm">{th.score}</span>
                <span
                  className={`block text-[10px] font-bold ${
                    th.percentage >= 80
                      ? 'text-emerald-600'
                      : th.percentage >= 60
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {th.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
