'use client';

import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, SchoolClass } from '@/lib/types';
import {
  User,
  Mail,
  GraduationCap,
  Shield,
  ShieldCheck,
  LogOut,
  MapPin,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  ChevronRight,
  PhoneCall,
  TrendingUp,
  BookmarkCheck,
  Settings,
  Database,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
  onLogout: () => void;
  language: 'hi' | 'en';
  onOpenHelp?: () => void;
  onNavigateToSection?: (section: string) => void;
}

export function ProfileView({
  user,
  isAdmin,
  selectedClass,
  onSelectClass,
  onOpenAdminModal,
  onLogoutAdmin,
  onLogout,
  language,
  onOpenHelp,
  onNavigateToSection,
}: ProfileViewProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner & Profile Card */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/10 ring-4 ring-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
            {user?.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white/80" />
            )}
          </div>

          {/* User Details */}
          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black tracking-tight">{user?.name || 'Student User'}</h2>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  Teacher / Admin
                </span>
              )}
            </div>

            <p className="text-xs text-blue-200 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email || 'Authenticated with Google'}</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20">
                Enrolled: Class {selectedClass}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Google Verified ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Switcher Section */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Enrolled Class</h3>
            <p className="text-[11px] text-slate-500">
              Select your class to customize live sessions, NCERT books, timetables, and MCQ tests
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
            <button
              key={c}
              onClick={() => onSelectClass(c)}
              className={`py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
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

      {/* Teacher / Admin Controls Switcher */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Teacher & Admin Privileges</h3>
              <p className="text-[11px] text-slate-500">
                {isAdmin
                  ? 'Authorized: You can start live classes, edit routines & post notices.'
                  : 'Teachers and staff can enter security credentials here.'}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Exit Admin
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
            >
              Enter Password
            </button>
          )}
        </div>
      </div>

      {/* Student Workspace Quick Actions */}
      {onNavigateToSection && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {language === 'hi' ? 'छात्र कार्यक्षेत्र एवं प्राथमिकताएं' : 'Student Hub & Shortcuts'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => onNavigateToSection('progress')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block group-hover:text-indigo-700">
                    {language === 'hi' ? 'मेरी प्रगति' : 'My Progress'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {language === 'hi' ? 'स्कोर व उपस्थिति' : 'Scores & Analytics'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700" />
            </button>

            <button
              onClick={() => onNavigateToSection('saved')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-700">
                    {language === 'hi' ? 'सहेजी गई सामग्री' : 'My Saved'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {language === 'hi' ? 'बुकमार्क प्रश्न व किताबें' : 'Bookmarked Items'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
            </button>

            <button
              onClick={() => onNavigateToSection('settings')}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-200 text-slate-700">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {language === 'hi' ? 'सेटिंग्स' : 'App Settings'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {language === 'hi' ? 'भाषा व अलर्ट' : 'Preferences'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => onNavigateToSection('audit')}
              className="w-full mt-2 p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 text-left flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">
                    {language === 'hi' ? 'प्रबंधन ऑडिट लॉग एवं डेटा बैकअप' : 'Admin Audit Logs & Backup Export'}
                  </span>
                  <span className="text-[10px] text-indigo-700">
                    {language === 'hi' ? 'परिवर्तन इतिहास और डेटा डाउनलोड' : 'Accountability history & JSON export'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600" />
            </button>
          )}
        </div>
      )}

      {/* Help & Support Center Menu Option */}
      {onOpenHelp && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-3xl p-5 border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>Help &amp; Support</span>
                  <span className="text-[11px] font-semibold text-blue-700">(सहायता केंद्र)</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  {language === 'hi'
                    ? '18 सुविधाएं, मार्गदर्शिकाएं, समस्याओं का समाधान व संपर्क'
                    : 'All 18 feature guides, common fixes & official support'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenHelp}
              className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 shrink-0"
            >
              <span>{language === 'hi' ? 'खोलें' : 'Open'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Official School Details */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <SchoolLogo size={38} showText={false} />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase">
              Janta +2 High School, Khalari
            </h3>
            <p className="text-[11px] text-slate-500">
              Affiliated with Jharkhand Academic Council (JAC), Ranchi
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>Khalari, Ranchi District, Jharkhand - 829205</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>School Code: 23045 • U-DISE Code: 20210403502</span>
          </div>
          {onNavigateToSection && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                {language === 'hi' ? 'विस्तृत इतिहास, सुविधाएं व नियम:' : 'History, facilities, rules & gallery:'}
              </span>
              <button
                onClick={() => onNavigateToSection('about')}
                className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                {language === 'hi' ? 'विद्यालय परिचय (About School) →' : 'About Our School →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3.5 px-4 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-bold transition-all border border-red-200 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of School Portal</span>
        </button>
      </div>
    </div>
  );
}
