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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-2.5 sm:px-4 py-2 sm:py-2.5 pt-[max(env(safe-area-inset-top,0px),0.5rem)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Left: School Logo & Branding (Click to go Home) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 sm:gap-2.5 text-left focus:outline-hidden group min-w-0 shrink"
          title="Go to Home"
        >
          <SchoolLogo size={34} className="sm:hidden shrink-0" showText={false} />
          <SchoolLogo size={42} className="hidden sm:block shrink-0" showText={false} />
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-blue-950 text-[11px] sm:text-sm tracking-tight leading-tight uppercase group-hover:text-blue-700 transition-colors truncate max-w-[125px] xs:max-w-[180px] sm:max-w-none">
              Janta +2 High School
            </span>
            <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-slate-500 font-semibold leading-tight">
              <span className="text-blue-700 font-bold uppercase tracking-wider shrink-0">Khalari</span>
              <span className="hidden xs:inline">•</span>
              <span className="text-amber-700 text-[10px] hidden sm:inline font-medium truncate">
                शिक्षा • अनुशासन • सफलता
              </span>
            </div>
          </div>
        </button>

        {/* Right: Search, Notifications, User, Class & Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Global Search Button */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors shrink-0"
              title="Global Search / खोजें"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
            </button>
          )}

          {/* Notifications Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors shrink-0"
              title="Notifications & Alerts / सूचनाएं"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-600 text-[8px] sm:text-[9px] font-black text-white shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick Attendance Button */}
          {onOpenAttendance && (
            <button
              onClick={onOpenAttendance}
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors shrink-0"
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
              className="hidden xs:flex p-1.5 rounded-full text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 transition-colors shrink-0"
              title="Help & Support / सहायता केंद्र"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shrink-0"
            title="Switch Language / भाषा बदलें"
          >
            <Globe className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">{language === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 EN'}</span>
            <span className="sm:hidden">{language === 'hi' ? 'हिं' : 'EN'}</span>
          </button>

          {/* User Avatar / Profile Button */}
          {user ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition-all max-w-[85px] sm:max-w-[130px] cursor-pointer"
                title={`${user.role}: ${user.name}`}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-700 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-[11px] sm:text-xs font-semibold truncate leading-none">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="p-1 sm:p-1.5 rounded-full text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
                title="Logout / लॉग आउट"
              >
                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenProfile}
              className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer shrink-0"
              title="Student Profile"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
