'use client';

import React from 'react';
import { Home, BookOpen, Video, FileCheck2, MessageSquare, User } from 'lucide-react';

export type NavTab = 'home' | 'study' | 'live' | 'mcq' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveLiveSession?: boolean;
}

export function BottomNav({
  activeTab,
  onTabChange,
  hasActiveLiveSession = false,
}: BottomNavProps) {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'study' as NavTab, label: 'Study', icon: BookOpen },
    {
      id: 'live' as NavTab,
      label: 'Live',
      icon: Video,
      badge: hasActiveLiveSession,
    },
    { id: 'mcq' as NavTab, label: 'MCQ', icon: FileCheck2 },
    { id: 'chat' as NavTab, label: 'Chat', icon: MessageSquare },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all select-none touch-manipulation ${
                isActive
                  ? 'text-blue-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight leading-none ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-blue-700 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
