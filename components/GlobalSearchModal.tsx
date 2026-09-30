'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Edit3,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  category:
    | 'Notices'
    | 'Books'
    | 'MCQs'
    | 'Timetable'
    | 'Exams'
    | 'Results'
    | 'Homework'
    | 'Calendar'
    | 'About School'
    | 'Faculty'
    | 'Help Articles'
    | 'Written Q&A'
    | 'Chat & Groups';
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
  const [hasError, setHasError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterClass, setFilterClass] = useState<string>(selectedClass || 'All');
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'All',
    'Notices',
    'Books',
    'MCQs',
    'Written Q&A',
    'Homework',
    'Timetable',
    'Exams',
    'Results',
    'Chat & Groups',
    'Faculty',
    'Calendar',
    'About School',
    'Help Articles',
  ];

  const subjects = [
    'All',
    'Mathematics',
    'Science',
    'Social Science',
    'Hindi',
    'English',
    'Sanskrit',
    'Information Technology',
  ];

  const performSearch = useCallback(async (searchQuery: string, cNum: string, sub: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const classParam = cNum !== 'All' ? `&class=${cNum}` : '';
      const subjectParam = sub !== 'All' ? `&subject=${encodeURIComponent(sub)}` : '';
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}${classParam}${subjectParam}`);
      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
      } else {
        setHasError(true);
      }
    } catch (err) {
      console.error('Search error:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setFilterClass(selectedClass || 'All');
    } else {
      setQuery('');
      setResults([]);
      setHasError(false);
      setActiveCategory('All');
      setFilterSubject('All');
    }
  }, [isOpen, selectedClass]);

  // Search while typing with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query, filterClass, filterSubject);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, filterClass, filterSubject, performSearch]);

  const handleManualSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(query, filterClass, filterSubject);
  };

  if (!isOpen) return null;

  // Filter results by active category and subject
  const filteredResults = results.filter((r) => {
    const matchCategory = activeCategory === 'All' ? true : r.category === activeCategory;
    const matchSubject =
      filterSubject === 'All'
        ? true
        : r.title.toLowerCase().includes(filterSubject.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(filterSubject.toLowerCase()) ||
          (r.badge && r.badge.toLowerCase().includes(filterSubject.toLowerCase()));
    return matchCategory && matchSubject;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Notices':
        return <Bell className="w-4 h-4 text-purple-600" />;
      case 'Books':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'MCQs':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Written Q&A':
        return <Edit3 className="w-4 h-4 text-teal-600" />;
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
      case 'Faculty':
        return <Users className="w-4 h-4 text-slate-800" />;
      case 'Chat & Groups':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'Help Articles':
        return <HelpCircle className="w-4 h-4 text-indigo-600" />;
      default:
        return <Search className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    onNavigateToSection(item.section);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 sm:pt-14 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Top Search Input Form */}
        <form
          onSubmit={handleManualSearch}
          className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center gap-2.5"
        >
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualSearch();
              }
            }}
            placeholder={
              language === 'hi'
                ? 'Maths, Science, नोट्स, MCQ, रूटीन, नोटिस, परीक्षा, शिक्षक खोजें...'
                : 'Search Maths, Science, notes, MCQs, timetable, notices, teachers...'
            }
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setHasError(false);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            {language === 'hi' ? 'खोजें' : 'Search'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 shrink-0"
          >
            ESC
          </button>
        </form>

        {/* Filter Controls Bar (Class & Subject) */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px] uppercase">Class:</span>
            {['All', '9', '10', '11', '12'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterClass(c)}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  filterClass === c
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {c === 'All' ? 'All' : `${c}th`}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 text-[11px] uppercase">Subject:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Type Filter Chips */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
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
                {language === 'hi' ? 'डेटाबेस में खोज जारी है...' : 'Searching school database...'}
              </p>
            </div>
          ) : hasError ? (
            <div className="py-10 text-center text-red-600 space-y-2">
              <AlertCircle className="w-9 h-9 mx-auto text-red-500" />
              <p className="text-sm font-bold">
                {language === 'hi' ? 'खोज में त्रुटि हुई' : 'Search request failed'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'hi'
                  ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
                  : 'Unable to reach the school database. Please check your connection and retry.'}
              </p>
              <button
                type="button"
                onClick={() => performSearch(query, filterClass, filterSubject)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Search'}</span>
              </button>
            </div>
          ) : !query.trim() ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Search className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">
                {language === 'hi'
                  ? 'कुछ भी खोजें: “Maths”, “Science”, “Sharma Sir”, “Pre-board”, “Routine”'
                  : 'Type to search: "Maths", "Science", "Sharma Sir", "Pre-board", "Routine"'}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === 'hi'
                  ? 'किताबें, MCQ, लिखित प्रश्न, नोटिस, रूटीन, परीक्षा, परिणाम व चैट में तुरंत खोजें।'
                  : 'Real searches across Textbooks, MCQs, Written Q&A, Notices, Timetable, Exams & Teachers.'}
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
