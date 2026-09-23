'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Bell,
  BookOpen,
  Calendar,
  Award,
  Clock,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Users,
  School,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  category: 'Notices' | 'Books' | 'MCQs' | 'Timetable' | 'Exams' | 'Results' | 'Homework' | 'Calendar' | 'About School';
  title: string;
  subtitle: string;
  section: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (section: string) => void;
  selectedClass?: string;
  language: 'hi' | 'en';
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigateToSection,
  selectedClass,
  language,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}${
            selectedClass ? `&class=${selectedClass}` : ''
          }`
        );
        const data = await res.json();
        if (data.success && data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, selectedClass]);

  if (!isOpen) return null;

  const categories = ['All', 'Notices', 'Books', 'MCQs', 'Timetable', 'Exams', 'Results', 'Homework', 'Calendar', 'About School'];

  const filteredResults = results.filter((r) =>
    activeCategory === 'All' ? true : r.category === activeCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Notices':
        return <Bell className="w-4 h-4 text-purple-600" />;
      case 'Books':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'MCQs':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Timetable':
        return <Clock className="w-4 h-4 text-sky-600" />;
      case 'Exams':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'Results':
        return <Award className="w-4 h-4 text-indigo-600" />;
      case 'Homework':
        return <ClipboardList className="w-4 h-4 text-teal-600" />;
      case 'Calendar':
        return <Sparkles className="w-4 h-4 text-orange-600" />;
      case 'About School':
        return <School className="w-4 h-4 text-blue-800" />;
      default:
        return <Search className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    onNavigateToSection(item.section);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 sm:pt-16 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Search Input */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'नोटिस, किताबें, MCQ, रूटीन, परीक्षा, परिणाम, होमवर्क खोजें...'
                : 'Search notices, books, MCQs, timetable, exams, results, homework...'
            }
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-7 h-7 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">
                {language === 'hi' ? 'खोज जारी है...' : 'Searching school database...'}
              </p>
            </div>
          ) : !query.trim() ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">
                {language === 'hi'
                  ? 'कुछ भी खोजें: “Mathematics”, “Pre-board”, “Attendance”, “Science”'
                  : 'Type to search: "Mathematics", "Pre-board", "Routine", "Trigonometry"'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'यह सर्च बॉक्स सभी 10 मॉड्यूल में तुरंत खोजता है।'
                  : 'Searches across Notices, Books, MCQs, Timetable, Exams, Results & Calendar.'}
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? `“${query}” से संबंधित कोई रिकॉर्ड नहीं मिला। कृपया अलग शब्द का उपयोग करें।`
                  : `No records matching "${query}". Try different keywords.`}
              </p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-blue-50 transition-colors shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
