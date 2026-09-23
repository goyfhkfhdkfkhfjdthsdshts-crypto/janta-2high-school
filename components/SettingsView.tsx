'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  User,
  Shield,
  Database,
  LogOut,
  HelpCircle,
  HardDrive,
  CheckCircle2,
  Trash2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { SchoolClass, UserProfile } from '@/lib/types';

interface SettingsViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  language: 'hi' | 'en';
  onLanguageChange: (lang: 'hi' | 'en') => void;
  onOpenAdminModal: () => void;
  onNavigateToSection: (section: string) => void;
  onLogout: () => void;
}

export function SettingsView({
  user,
  isAdmin,
  selectedClass,
  language,
  onLanguageChange,
  onOpenAdminModal,
  onNavigateToSection,
  onLogout,
}: SettingsViewProps) {
  const [notifPreferences, setNotifPreferences] = useState({
    notices: true,
    exams: true,
    liveClasses: true,
    homework: true,
    attendance: true,
  });

  const [cacheCleared, setCacheCleared] = useState(false);

  const toggleNotif = (key: keyof typeof notifPreferences) => {
    setNotifPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('janta_school_books_cache');
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-200 backdrop-blur-xs">
            <SettingsIcon className="w-3.5 h-3.5" />
            {language === 'hi' ? 'ऐप सेटिंग्स एवं प्राथमिकताएं' : 'App Settings & Preferences'}
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {language === 'hi' ? 'सेटिंग्स व खाता प्रबंधन' : 'Settings & Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {language === 'hi'
              ? 'भाषा बदलें, नोटिफिकेशन कस्टमाइज़ करें और सुरक्षा विकल्प प्रबंधित करें।'
              : 'Customize language, notification alerts, safety preferences, and offline cache.'}
          </p>
        </div>
      </div>

      {/* 1. Language Preferences */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'भाषा (Language)' : 'App Language'}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'ऐप की संपूर्ण सामग्री को हिंदी अथवा अंग्रेजी में देखें।'
            : 'Select your preferred display language for UI controls and study modules.'}
        </p>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onLanguageChange('hi')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
              language === 'hi'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div>
              <span className="text-sm block font-bold">हिन्दी (Hindi)</span>
              <span className="text-[11px] text-slate-500">हिंदी माध्यम (JAC बोर्ड)</span>
            </div>
            {language === 'hi' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>

          <button
            onClick={() => onLanguageChange('en')}
            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
              language === 'en'
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div>
              <span className="text-sm block font-bold">English</span>
              <span className="text-[11px] text-slate-500">English Medium</span>
            </div>
            {language === 'en' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'नोटिफिकेशन एवं अलर्ट सेटिंग्स' : 'Notification Preferences'}
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { key: 'notices', label: language === 'hi' ? 'नए नोटिस व सरकारी परिपत्र' : 'School Notices & Circulars' },
            { key: 'exams', label: language === 'hi' ? 'परीक्षा तिथियां व एडमिट कार्ड' : 'Exam Dates & Schedules' },
            { key: 'liveClasses', label: language === 'hi' ? 'लाइव क्लास प्रारंभ अलर्ट' : 'Live Class Start Alerts' },
            { key: 'homework', label: language === 'hi' ? 'दैनिक गृहकार्य व असाइनमेंट' : 'Daily Homework Updates' },
            { key: 'attendance', label: language === 'hi' ? 'दैनिक उपस्थिति पुष्टिकरण' : 'Attendance Confirmation' },
          ].map((item) => (
            <div key={item.key} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-700 font-medium">{item.label}</span>
              <button
                onClick={() => toggleNotif(item.key as keyof typeof notifPreferences)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifPreferences[item.key as keyof typeof notifPreferences]
                    ? 'bg-blue-600'
                    : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    notifPreferences[item.key as keyof typeof notifPreferences]
                      ? 'left-6'
                      : 'left-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Account Details */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'छात्र / उपयोगकर्ता विवरण' : 'Account Profile'}
          </h2>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{language === 'hi' ? 'नाम' : 'Name'}:</span>
            <span className="font-bold text-slate-900">{user?.name || 'Student / Guest'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{language === 'hi' ? 'ईमेल' : 'Email'}:</span>
            <span className="font-bold text-slate-900">{user?.email || 'student@jantahighschool.edu.in'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{language === 'hi' ? 'नामांकित कक्षा' : 'Class'}:</span>
            <span className="font-bold text-slate-900">Class {selectedClass}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{language === 'hi' ? 'भूमिका' : 'Role'}:</span>
            <span className="font-bold text-blue-700">{isAdmin ? 'Teacher / Admin' : 'Student (छात्र)'}</span>
          </div>
        </div>
      </div>

      {/* 4. Offline & Cache Management */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-amber-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'ऑफ़लाइन कैश एवं डेटा बचत' : 'Low-Data & Offline Storage'}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'पाठ्यपुस्तकें और NCERT नोट्स ऑफ़लाइन पढ़ने हेतु आपके डिवाइस में सुरक्षित रहते हैं।'
            : 'Study materials and NCERT notes are cached locally for offline reading in low-network areas.'}
        </p>
        <div className="pt-1 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-semibold">
            {cacheCleared ? (
              <span className="text-emerald-600">✓ Cache Cleared Successfully</span>
            ) : (
              'Local Cache Size: ~4.2 MB'
            )}
          </span>
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'कैश साफ़ करें' : 'Clear Cache'}</span>
          </button>
        </div>
      </div>

      {/* 5. Admin Audit & Safety Portal (Admin Link) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {language === 'hi' ? 'प्रबंधन, ऑडिट व सुरक्षा' : 'Admin Audit & Content Safety'}
            </h2>
          </div>
          {isAdmin ? (
            <button
              onClick={() => onNavigateToSection('audit')}
              className="px-3 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'ऑडिट लॉग देखें' : 'View Audit Logs'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'शिक्षक पासवर्ड' : 'Admin Login'}</span>
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'प्रबंधन पोर्टल द्वारा सभी परिवर्तनों का ऑडिट इतिहास रखा जाता है और आपत्तिजनक संदेशों की निगरानी की जाती है।'
            : 'All administrative changes to notices, results, and timetables are logged with audit trails.'}
        </p>
      </div>

      {/* 6. Help & Support Link */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {language === 'hi' ? 'मदद एवं सहायता केंद्र (Help & Support)' : 'Help & Support Center'}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'hi' ? 'ऐप के सभी फीचर्स का उपयोग सरल भाषा में सीखें' : 'Guide for all app features in Hindi + English'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigateToSection('help')}
          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
        >
          <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 7. Logout */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{language === 'hi' ? 'लॉगआउट करें (Sign Out)' : 'Log Out from Account'}</span>
        </button>
      </div>
    </div>
  );
}
