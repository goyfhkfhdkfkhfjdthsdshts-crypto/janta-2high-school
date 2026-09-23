'use client';

import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Bell,
  HelpCircle,
  FolderHeart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { BookmarkItem, BookmarkType } from '@/lib/types';

interface BookmarksViewProps {
  onNavigateToSection: (section: string) => void;
  language: 'hi' | 'en';
}

const STORAGE_KEY = 'janta_school_bookmarks_v1';

// Seed initial saved items if student hasn't saved yet
const initialSavedItems: BookmarkItem[] = [
  {
    id: 'bm-1',
    itemId: 'b-10-1',
    type: 'book',
    title: 'NCERT Mathematics (गणित) Class 10',
    subtitle: 'JCERT / NCERT Complete Hindi & English Editions',
    section: 'study',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'bm-2',
    itemId: 'mcq-1',
    type: 'mcq',
    title: 'Real Numbers: Fundamental Theorem of Arithmetic',
    subtitle: 'Every composite number can be expressed as a product of primes uniquely.',
    section: 'mcq',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'bm-3',
    itemId: 'n-1',
    type: 'notice',
    title: 'JAC Board Matric & Intermediate Examination Form Fill-up',
    subtitle: 'Official circular for regular & private candidates registration.',
    section: 'notice',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

export function BookmarksView({ onNavigateToSection, language }: BookmarksViewProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeType, setActiveType] = useState<string>('all');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      } else {
        setBookmarks(initialSavedItems);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSavedItems));
      }
    } catch {
      setBookmarks(initialSavedItems);
    }
  }, []);

  const saveBookmarks = (items: BookmarkItem[]) => {
    setBookmarks(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    saveBookmarks(updated);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        language === 'hi'
          ? 'क्या आप सभी सहेजी गई सामग्री हटाना चाहते हैं?'
          : 'Clear all saved bookmarks?'
      )
    ) {
      saveBookmarks([]);
    }
  };

  const filtered = bookmarks.filter((b) =>
    activeType === 'all' ? true : b.type === activeType
  );

  const getIcon = (type: BookmarkType) => {
    switch (type) {
      case 'book':
      case 'study':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'mcq':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'notice':
        return <Bell className="w-4 h-4 text-purple-600" />;
      default:
        return <Bookmark className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-blue-200 backdrop-blur-xs">
              <BookmarkCheck className="w-3.5 h-3.5" />
              {language === 'hi' ? 'मेरी सहेजी गई सामग्री' : 'My Saved & Bookmarks'}
            </span>
            {bookmarks.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-red-200 hover:text-white underline font-semibold"
              >
                {language === 'hi' ? 'सभी हटाएं' : 'Clear All'}
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi' ? 'सहेजे गए प्रश्न, पुस्तकें व नोटिस' : 'Personal Saved Library'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mt-1">
              {language === 'hi'
                ? 'आपके द्वारा बुकमार्क किए गए महत्वपूर्ण प्रश्न, पाठ्यपुस्तकें और सूचनाएं ऑफ़लाइन भी उपलब्ध हैं।'
                : 'Quickly access questions, formulas, circulars, and textbooks you bookmarked for later review.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
          { id: 'book', label: language === 'hi' ? 'किताबें' : 'Books' },
          { id: 'mcq', label: language === 'hi' ? 'MCQ प्रश्न' : 'MCQs' },
          { id: 'notice', label: language === 'hi' ? 'नोटिस' : 'Notices' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeType === tab.id
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Saved Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
          <FolderHeart className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi' ? 'कोई सहेजी गई सामग्री नहीं है' : 'No Bookmarks Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'अध्ययन सामग्री, किताबों या MCQ प्रश्नों के पास दिए गए बुकमार्क आइकन पर टैप करके उन्हें यहाँ सहेजें।'
              : 'Tap the bookmark icon on any book, MCQ question, or notice to save it here for fast revision.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateToSection(item.section)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                      {item.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase shrink-0">
                      {item.type}
                    </span>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {language === 'hi' ? 'सहेजा गया:' : 'Saved:'} {new Date(item.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleRemove(item.id, e)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
