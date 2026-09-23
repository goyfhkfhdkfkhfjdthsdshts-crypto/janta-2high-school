'use client';

import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, SchoolClass } from '@/lib/types';
import { Shield, ShieldCheck, Globe, User, LogOut, UserCheck, HelpCircle, Search, Bell } from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  onGoHome: () => void;
  onOpenProfile: () => void;
  onOpenAttendance?: () => void;
  onOpenHelp?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export function Header({
  user,
  isAdmin,
  selectedClass,
  onSelectClass,
  onOpenAdminModal,
  onLogout,
  language,
  onToggleLanguage,
  onGoHome,
  onOpenProfile,
  onOpenAttendance,
  onOpenHelp,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-3.5 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: School Logo & Branding (Click to go Home) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          title="Go to Home"
        >
          <SchoolLogo size={42} showText={false} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-blue-950 text-sm tracking-tight leading-tight uppercase group-hover:text-blue-700 transition-colors">
                Janta +2 High School
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <span className="text-blue-700 font-bold uppercase tracking-wider">Khalari</span>
              <span>•</span>
              <span className="text-amber-700 text-[10px] hidden xs:inline font-medium">
                शिक्षा • अनुशासन • सफलता
              </span>
            </div>
          </div>
        </button>

        {/* Right: Search, Notifications, User, Class & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors"
              title="Global Search / खोजें"
            >
              <Search className="w-4 h-4 text-slate-700" />
            </button>
          )}

          {/* Notifications Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors"
              title="Notifications & Alerts / सूचनाएं"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick Attendance Button */}
          {onOpenAttendance && (
            <button
              onClick={onOpenAttendance}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors"
              title="Online Attendance / ऑनलाइन उपस्थिति"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>उपस्थिति</span>
            </button>
          )}

          {/* Quick Help & Support Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors"
              title="Help & Support / सहायता केंद्र"
            >
              <HelpCircle className="w-4 h-4 text-blue-700" />
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-blue-700" />
            <span>{language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}</span>
          </button>

          {/* Admin Shield Badge / Trigger */}
          <button
            onClick={onOpenAdminModal}
            className={`p-1.5 rounded-full border transition-all ${
              isAdmin
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={isAdmin ? 'Teacher/Admin Mode Active' : 'Teacher/Admin Login'}
          >
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            ) : (
              <Shield className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Avatar / Profile Button */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition-all max-w-[130px]"
              title={`Logged in as ${user.name}`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-semibold truncate leading-none">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              title="Sign In with Google"
            >
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
