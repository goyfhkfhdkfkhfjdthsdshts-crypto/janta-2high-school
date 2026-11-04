'use client';

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { SchoolLogo } from './SchoolLogo';
import { MCQQuestion, SchoolClass, UserProfile } from '@/lib/types';
import {
  CLASS_10_VERIFIED_MCQS,
  CLASS_10_SUBJECTS,
  SubjectMetadata,
} from '@/lib/jacClass10McqBank';
import { apiFetch } from '@/lib/apiConfig';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Trophy,
  Filter,
  Check,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Layers,
  Calculator,
  FlaskConical,
  Globe,
  BookText,
  Languages,
  Laptop,
  HeartPulse,
  Search,
  Award,
  Play,
  RotateCw,
} from 'lucide-react';

interface McqPracticeViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

function createAttemptRecord(
  selectedChapter: string,
  activeSubject: string,
  correctCount: number,
  totalCount: number,
  percentage: number
) {
  return {
    id: `th-${Date.now()}`,
    title: `${selectedChapter !== 'All' ? selectedChapter : activeSubject !== 'All' ? activeSubject : 'Mixed'} JAC Practice Test`,
    subject: activeSubject !== 'All' ? activeSubject : 'General',
    score: `${correctCount} / ${totalCount}`,
    percentage,
    date: new Date().toISOString().split('T')[0],
    totalQuestions: totalCount,
    correctCount,
  };
}

// Map subject icon names to Lucide icon components
const getSubjectIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Calculator':
      return Calculator;
    case 'FlaskConical':
      return FlaskConical;
    case 'Globe':
      return Globe;
    case 'BookText':
      return BookText;
    case 'Languages':
      return Languages;
    case 'Laptop':
      return Laptop;
    case 'HeartPulse':
      return HeartPulse;
    default:
      return BookOpen;
  }
};

export function McqPracticeView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: McqPracticeViewProps) {
  // Pre-seed state with verified JAC MCQs so it is NEVER blank or empty
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>(() => {
    if (selectedClass === '10') {
      return CLASS_10_VERIFIED_MCQS;
    }
    const filtered = CLASS_10_VERIFIED_MCQS.filter((q) => q.class === selectedClass);
    return filtered.length > 0 ? filtered : CLASS_10_VERIFIED_MCQS;
  });

  const [activeSubject, setActiveSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [practiceMode, setPracticeMode] = useState<'subject' | 'chapter' | 'mixed' | 'random'>('mixed');
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(10);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [subjectCategoryFilter, setSubjectCategoryFilter] = useState<'all' | 'core' | 'language' | 'vocational'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  // Active quiz session states
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Admin Add / Edit MCQ Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMcq, setEditingMcq] = useState<MCQQuestion | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Form states for Admin Add/Edit
  const [formSubject, setFormSubject] = useState('Science');
  const [formChapter, setFormChapter] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrect, setFormCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [formExplanation, setFormExplanation] = useState('');

  // Fetch MCQs via unified apiFetch with pre-bundled fallback
  const fetchMcqs = async () => {
    try {
      const { res, data } = await apiFetch(`/api/data/mcq?class=${selectedClass}`);
      if (res.ok && data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setAllQuestions(data.data);
      } else {
        const fallback = CLASS_10_VERIFIED_MCQS.filter(
          (q) => !selectedClass || q.class === selectedClass
        );
        setAllQuestions(fallback.length > 0 ? fallback : CLASS_10_VERIFIED_MCQS);
      }
    } catch (err) {
      console.warn('Network issue fetching MCQs, using verified JAC question bank:', err);
      const fallback = CLASS_10_VERIFIED_MCQS.filter(
        (q) => !selectedClass || q.class === selectedClass
      );
      setAllQuestions(fallback.length > 0 ? fallback : CLASS_10_VERIFIED_MCQS);
    }
  };

  const studentAccountId = user?.studentId || user?.id || 'default_student';

  useEffect(() => {
    fetchMcqs();
    try {
      const historyKey = `janta_test_history_${studentAccountId}`;
      const bookmarkKey = `janta_bookmarks_${studentAccountId}`;
      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) setTestHistory(JSON.parse(storedHistory));
      const storedBookmarks = localStorage.getItem(bookmarkKey);
      if (storedBookmarks) {
        const parsed = JSON.parse(storedBookmarks);
        setBookmarkedIds(parsed.map((b: any) => b.itemId));
      }

      // Fetch from persistent database for this specific student if online
      if (studentAccountId && studentAccountId !== 'default_student') {
        fetch(`/api/student/activity?studentId=${encodeURIComponent(studentAccountId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.success && data?.data) {
              if (data.data.testAttempts && data.data.testAttempts.length > 0) {
                setTestHistory(data.data.testAttempts);
                localStorage.setItem(historyKey, JSON.stringify(data.data.testAttempts));
              }
              if (data.data.bookmarks && data.data.bookmarks.length > 0) {
                const bIds = data.data.bookmarks.map((b: any) => b.itemId);
                setBookmarkedIds(bIds);
                localStorage.setItem(bookmarkKey, JSON.stringify(data.data.bookmarks));
              }
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [selectedClass, studentAccountId]);

  // Compute available subjects from both static registry and question bank
  const subjectsList = useMemo(() => {
    if (selectedClass === '10') {
      return CLASS_10_SUBJECTS;
    }
    // For other classes, build dynamic subject list from questions
    const dynamicSubjects = Array.from(new Set(allQuestions.map((q) => q.subject)));
    return dynamicSubjects.map((s) => ({
      id: s,
      name: s,
      hindiName: s,
      category: 'core' as const,
      icon: 'BookOpen',
      color: 'from-blue-600 to-indigo-700',
      description: `Class ${selectedClass} ${s} preparation and exercises`,
      chapters: [],
    }));
  }, [selectedClass, allQuestions]);

  // Compute available chapters for current subject
  const availableChapters = useMemo(() => {
    const list = allQuestions
      .filter((q) => activeSubject === 'All' || q.subject.toLowerCase() === activeSubject.toLowerCase())
      .map((q) => q.chapter)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [allQuestions, activeSubject]);

  // Filtered subjects based on category tabs
  const filteredSubjects = useMemo(() => {
    if (subjectCategoryFilter === 'all') return subjectsList;
    return subjectsList.filter((s) => s.category === subjectCategoryFilter);
  }, [subjectsList, subjectCategoryFilter]);

  // Filtered question bank list for browsing below
  const displayedQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (activeSubject !== 'All' && q.subject.toLowerCase() !== activeSubject.toLowerCase()) {
        return false;
      }
      if (selectedChapter !== 'All' && q.chapter.toLowerCase() !== selectedChapter.toLowerCase()) {
        return false;
      }
      if (onlyBookmarks && !bookmarkedIds.includes(q.id)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question.toLowerCase().includes(query);
        const matchesChapter = q.chapter?.toLowerCase().includes(query);
        const matchesSubject = q.subject?.toLowerCase().includes(query);
        const matchesOptions =
          q.optionA?.toLowerCase().includes(query) ||
          q.optionB?.toLowerCase().includes(query) ||
          q.optionC?.toLowerCase().includes(query) ||
          q.optionD?.toLowerCase().includes(query);
        return matchesQuestion || matchesChapter || matchesSubject || matchesOptions;
      }
      return true;
    });
  }, [allQuestions, activeSubject, selectedChapter, onlyBookmarks, bookmarkedIds, searchQuery]);

  // Bookmark toggler
  const handleToggleBookmark = (q: MCQQuestion) => {
    try {
      const key = `janta_bookmarks_${studentAccountId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const existsIdx = stored.findIndex((b: any) => b.itemId === q.id);
      let updated: any[];
      if (existsIdx >= 0) {
        updated = stored.filter((b: any) => b.itemId !== q.id);
        setBookmarkedIds((prev) => prev.filter((id) => id !== q.id));

        if (studentAccountId !== 'default_student') {
          fetch('/api/student/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'remove_bookmark',
              studentId: studentAccountId,
              itemId: q.id,
            }),
          }).catch(() => {});
        }
      } else {
        const newBm = {
          id: `bm-${Date.now()}`,
          itemId: q.id,
          type: 'mcq',
          title: q.question,
          subtitle: `${q.subject} • ${q.chapter} (Option ${q.correctAnswer})`,
          section: 'mcq',
          savedAt: new Date().toISOString(),
        };
        updated = [newBm, ...stored];
        setBookmarkedIds((prev) => [...prev, q.id]);

        if (studentAccountId !== 'default_student') {
          fetch('/api/student/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'save_bookmark',
              studentId: studentAccountId,
              bookmark: newBm,
            }),
          }).catch(() => {});
        }
      }
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Start Practice Quiz (with optional subject override from card button)
  const handleStartQuiz = (overrideSubject?: string, overrideCount?: number) => {
    const targetSub = overrideSubject !== undefined ? overrideSubject : activeSubject;
    const count = overrideCount !== undefined ? overrideCount : targetQuestionCount;

    let pool = [...allQuestions];
    if (targetSub !== 'All') {
      pool = pool.filter((q) => q.subject.toLowerCase() === targetSub.toLowerCase());
    }
    if (selectedChapter !== 'All' && !overrideSubject) {
      pool = pool.filter((q) => q.chapter.toLowerCase() === selectedChapter.toLowerCase());
    }

    if (practiceMode === 'random' || overrideSubject) {
      pool.sort(() => Math.random() - 0.5);
    }

    if (pool.length === 0) {
      // If no questions match chapter filter, fallback to subject pool
      pool = allQuestions.filter((q) => targetSub === 'All' || q.subject.toLowerCase() === targetSub.toLowerCase());
    }

    const selected = pool.slice(0, count);
    if (selected.length === 0) {
      alert('No MCQs available matching this selection. Showing all Class 10 questions.');
      setQuizQuestions(allQuestions.slice(0, 10));
    } else {
      setQuizQuestions(selected);
    }

    if (overrideSubject) {
      setActiveSubject(overrideSubject);
      setSelectedChapter('All');
    }

    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizCompleted(false);
    setQuizActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Answer selection
  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswers[currentIndex]) return; // already answered

    const updated = { ...selectedAnswers, [currentIndex]: option };
    setSelectedAnswers(updated);
    setShowExplanation({ ...showExplanation, [currentIndex]: true });

    // If last question, complete
    if (currentIndex === quizQuestions.length - 1) {
      setTimeout(() => {
        handleFinishQuiz(updated);
      }, 1200);
    }
  };

  // Complete Quiz & Trigger Celebration & Save to History
  const handleFinishQuiz = (answers: Record<number, 'A' | 'B' | 'C' | 'D'>) => {
    setQuizCompleted(true);
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });

    const percentage = Math.round((correctCount / quizQuestions.length) * 100);

    const newAttempt = createAttemptRecord(
      selectedChapter,
      activeSubject,
      correctCount,
      quizQuestions.length,
      percentage
    );

    try {
      const historyKey = `janta_test_history_${studentAccountId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const updated = [newAttempt, ...existingHistory].slice(0, 50);
      localStorage.setItem(historyKey, JSON.stringify(updated));
      setTestHistory(updated);

      if (studentAccountId !== 'default_student') {
        fetch('/api/student/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_test_attempt',
            studentId: studentAccountId,
            subject: activeSubject,
            chapter: selectedChapter,
            class: selectedClass,
            totalQuestions: quizQuestions.length,
            correctAnswers: correctCount,
            scorePercentage: percentage,
          }),
        }).catch((err) => console.error('Error saving test attempt to database:', err));
      }
    } catch (e) {
      console.error(e);
    }

    if (percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Calculate Score
  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: quizQuestions.length,
      percentage: quizQuestions.length > 0 ? Math.round((correct / quizQuestions.length) * 100) : 0,
    };
  };

  // AI MCQ Generator
  const handleGenerateAiMcqs = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/mcq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedClass,
          subject: activeSubject !== 'All' ? activeSubject : 'Science',
          chapter: 'JAC Board High Weightage Practice Topics',
          count: 5,
        }),
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        for (const q of data.questions) {
          await apiFetch('/api/data/mcq', {
            method: 'POST',
            body: JSON.stringify(q),
          });
        }
        fetchMcqs();
        alert('5 new practice MCQs generated and added to your practice bank!');
      } else {
        alert('Unable to generate AI questions right now. Practice using the pre-bundled JAC questions below.');
      }
    } catch (err) {
      console.error(err);
      alert('Network issue while generating practice questions.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Admin Save MCQ (Add or Edit)
  const handleSaveMcq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const payload = {
      class: selectedClass,
      subject: formSubject,
      chapter: formChapter || 'General Chapter',
      question: formQuestion,
      optionA: formOptA,
      optionB: formOptB,
      optionC: formOptC,
      optionD: formOptD,
      correctAnswer: formCorrect,
      explanation: formExplanation || 'Official JAC / NCERT standard solution.',
    };

    try {
      if (editingMcq) {
        await apiFetch('/api/data/mcq', {
          method: 'PUT',
          body: JSON.stringify({ id: editingMcq.id, ...payload }),
        });
      } else {
        await apiFetch('/api/data/mcq', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsAddModalOpen(false);
      setEditingMcq(null);
      resetForm();
      fetchMcqs();
    } catch (err) {
      console.error(err);
      alert('Error saving MCQ question.');
    }
  };

  // Delete MCQ
  const handleDeleteMcq = async (id: string) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }
    if (!window.confirm('Are you sure you want to delete this MCQ question?')) return;

    try {
      await apiFetch(`/api/data/mcq?id=${id}`, { method: 'DELETE' });
      fetchMcqs();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormSubject('Science');
    setFormChapter('');
    setFormQuestion('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrect('A');
    setFormExplanation('');
  };

  const currentQ = quizQuestions[currentIndex];
  const currentAnswer = selectedAnswers[currentIndex];
  const scoreResult = calculateScore();

  return (
    <div className="space-y-4 pb-24 max-w-5xl mx-auto px-1 sm:px-0 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <SchoolLogo size={46} showText={false} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight uppercase">
                {language === 'hi' ? 'झारखंड बोर्ड (JAC) वस्तुनिष्ठ प्रश्न बैंक' : 'JAC Board MCQ Question Bank'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {allQuestions.length} Questions
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {language === 'hi'
                ? 'सभी 9 विषय • कक्षा 10 परीक्षा पैटर्न • त्वरित व्याख्या व स्व-मूल्यांकन'
                : 'All 9 Subjects • Full Syllabus Mock Tests & Instant NCERT Solutions'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateAiMcqs}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            title="Generate AI Practice MCQs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isGeneratingAi ? 'Generating...' : 'AI Practice MCQs'}</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => {
                setEditingMcq(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Teacher Mode
            </button>
          )}
        </div>
      </div>

      {/* QUIZ ACTIVE VIEW */}
      {quizActive ? (
        <div className="space-y-4">
          {!quizCompleted && currentQ ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-md space-y-4">
              {/* Progress and Question Counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-blue-900 text-sm">
                    Question {currentIndex + 1} of {quizQuestions.length}
                  </span>
                  {currentQ.difficulty && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {currentQ.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                    {currentQ.subject} • {currentQ.chapter}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(currentQ)}
                    className={`p-1 rounded-lg border transition-colors ${
                      bookmarkedIds.includes(currentQ.id)
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                    title="Bookmark Question"
                  >
                    {bookmarkedIds.includes(currentQ.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="py-1">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
                {currentQ.topic && (
                  <p className="text-[11px] text-blue-600 font-semibold mt-1">
                    📌 Topic: {currentQ.topic}
                  </p>
                )}
                {currentQ.isAiGenerated && (
                  <p className="text-[10px] text-amber-700 font-medium mt-1">
                    * AI-generated practice question for self-study
                  </p>
                )}
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2.5">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const optText =
                    opt === 'A'
                      ? currentQ.optionA
                      : opt === 'B'
                      ? currentQ.optionB
                      : opt === 'C'
                      ? currentQ.optionC
                      : currentQ.optionD;

                  const isSelected = currentAnswer === opt;
                  const isCorrect = currentQ.correctAnswer === opt;
                  const hasAnswered = !!currentAnswer;

                  let buttonStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-blue-300';
                  if (hasAnswered) {
                    if (isCorrect) {
                      buttonStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 font-bold ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrect) {
                      buttonStyle = 'bg-red-50 text-red-950 border-red-500 font-bold ring-2 ring-red-300';
                    } else {
                      buttonStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={hasAnswered}
                      className={`w-full min-h-[48px] p-3 sm:p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${buttonStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          hasAnswered && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : hasAnswered && isSelected && !isCorrect
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {opt}
                      </span>
                      <span className="text-xs sm:text-sm font-medium flex-1 pt-0.5 leading-snug">
                        {optText}
                      </span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Box */}
              {showExplanation[currentIndex] && (
                <div
                  className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
                    currentAnswer === currentQ.correctAnswer
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50/80 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1.5">
                    {currentAnswer === currentQ.correctAnswer ? (
                      <span className="text-emerald-700 text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>सही उत्तर! (Correct Answer)</span>
                      </span>
                    ) : (
                      <span className="text-red-700 text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        <span>गलत उत्तर। सही विकल्प: Option {currentQ.correctAnswer}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 font-medium">
                    <span className="font-bold text-slate-900">JCERT / NCERT व्याख्या: </span>
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuizActive(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Exit Practice
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      disabled={!currentAnswer}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFinishQuiz(selectedAnswers)}
                      disabled={!currentAnswer}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Submit & Finish</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* QUIZ COMPLETED SUMMARY CARD */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-md">
                <Trophy className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {scoreResult.percentage >= 80
                    ? '🎉 Excellent Performance!'
                    : scoreResult.percentage >= 60
                    ? '👍 Good Job!'
                    : '📖 Keep Practicing!'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  JAC Board Practice Test for Class {selectedClass} • {activeSubject}
                </p>
              </div>

              {/* Score Metric Cards */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Score</span>
                  <p className="text-lg font-black text-blue-700">
                    {scoreResult.correct} / {scoreResult.total}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Percentage</span>
                  <p className="text-lg font-black text-emerald-700">{scoreResult.percentage}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Result</span>
                  <p className="text-xs font-black text-slate-800 mt-1">
                    {scoreResult.percentage >= 60 ? '1st Div' : scoreResult.percentage >= 45 ? '2nd Div' : 'Practice More'}
                  </p>
                </div>
              </div>

              {/* Actions: Retry or Review */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleStartQuiz()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Test</span>
                </button>
                <button
                  onClick={() => setQuizActive(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Back to All Subjects & Question Bank
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MAIN DASHBOARD: ALL 9 SUBJECT CARDS + QUIZ CONFIG + QUESTION BANK LIST     */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* Section: JAC Class 10 All Subjects Grid */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                  JAC Class 10 Syllabus
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                  All Class 10 Subjects (सभी विषय)
                </h3>
                <p className="text-xs text-slate-500">
                  Select a subject to practice chapter-wise MCQs or launch an instant 10-question mock test.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full">
                {[
                  { id: 'all' as const, label: 'All Subjects (9)' },
                  { id: 'core' as const, label: 'Core / मुख्य (3)' },
                  { id: 'language' as const, label: 'Language / भाषा (4)' },
                  { id: 'vocational' as const, label: 'Vocational / व्यावसायिक (2)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSubjectCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                      subjectCategoryFilter === cat.id
                        ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredSubjects.map((sub) => {
                const IconComponent = getSubjectIconComponent(sub.icon);
                const subQuestions = allQuestions.filter(
                  (q) => q.subject.toLowerCase() === sub.name.toLowerCase()
                );
                const isSelected = activeSubject.toLowerCase() === sub.name.toLowerCase();

                return (
                  <div
                    key={sub.id}
                    className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between space-y-3 group bg-gradient-to-br ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-200'
                        : 'border-slate-200/80 hover:border-blue-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color} text-white flex items-center justify-center shadow-xs shrink-0`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            sub.category === 'core'
                              ? 'bg-blue-100 text-blue-800'
                              : sub.category === 'language'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sub.category}
                        </span>
                      </div>

                      {/* Subject Name */}
                      <h4 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                        {sub.name}
                      </h4>
                      <p className="text-xs font-bold text-blue-700">
                        {sub.hindiName}
                      </p>

                      {/* Description */}
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {sub.description}
                      </p>

                      {/* Counts */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{sub.chapters.length > 0 ? `${sub.chapters.length} Chapters` : 'All Topics'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{subQuestions.length} Questions</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions: Start Test or Browse */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleStartQuiz(sub.name, 10)}
                        className="w-full py-2 px-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                        title={`Start 10 MCQs Test for ${sub.name}`}
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>अभ्यास शुरू</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSubject(sub.name);
                          setSelectedChapter('All');
                        }}
                        className={`w-full py-2 px-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-700 text-white border-blue-700'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>अध्याय देखें</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Quiz Configuration Panel */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Custom Practice Mode
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">Configure Your Self-Test</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Customize question pool, choose specific chapters, and pick duration.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mixed', label: 'Mixed Mode (मिश्रित)' },
                { id: 'subject', label: 'Subject-wise (विषयवार)' },
                { id: 'chapter', label: 'Chapter-wise (अध्यायवार)' },
                { id: 'random', label: 'Random 10 (यादृच्छिक)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPracticeMode(m.id as any)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    practiceMode === m.id
                      ? 'bg-white text-blue-950 border-white shadow-md'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Subject and Chapter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-blue-200 mb-1">
                  Select Subject:
                </label>
                <select
                  value={activeSubject}
                  onChange={(e) => {
                    setActiveSubject(e.target.value);
                    setSelectedChapter('All');
                  }}
                  className="w-full p-2 bg-white/15 border border-white/25 rounded-xl text-xs font-semibold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All" className="text-slate-900">
                    All Subjects ({allQuestions.length} Questions)
                  </option>
                  {subjectsList.map((s) => {
                    const count = allQuestions.filter(
                      (q) => q.subject.toLowerCase() === s.name.toLowerCase()
                    ).length;
                    return (
                      <option key={s.id} value={s.name} className="text-slate-900">
                        {s.name} ({s.hindiName}) — {count} Qs
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-blue-200 mb-1">
                  Select Chapter:
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full p-2 bg-white/15 border border-white/25 rounded-xl text-xs font-semibold text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="All" className="text-slate-900">
                    All Chapters ({availableChapters.length})
                  </option>
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch} className="text-slate-900">
                      {ch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Count Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-200 mb-1.5">
                Number of Questions for this Test:
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 20, 30].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTargetQuestionCount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetQuestionCount === num
                        ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-200'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Start CTA */}
            <div className="pt-1">
              <button
                onClick={() => handleStartQuiz()}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <span>
                  Start Practice Quiz Now (
                  {selectedChapter !== 'All' ? selectedChapter : activeSubject !== 'All' ? activeSubject : 'All Subjects'}
                  )
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Test Attempt History Card (if exists) */}
          {testHistory.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Recent Test Attempts & Score History</span>
                </span>
                <span className="text-[11px] text-slate-500">{testHistory.length} recorded</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {testHistory.slice(0, 4).map((th) => (
                  <div
                    key={th.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{th.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {th.date} • {th.subject}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black ${
                          th.percentage >= 60 ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {th.percentage}%
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold">{th.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search, Filter & Question Bank Browser */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by formula, chapter or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                    onlyBookmarks
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Bookmarks ({bookmarkedIds.length})</span>
                </button>
              </div>
            </div>

            {/* Subject Filter Chips Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => {
                  setActiveSubject('All');
                  setSelectedChapter('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeSubject === 'All'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Subjects ({allQuestions.length})
              </button>
              {subjectsList.map((sub) => {
                const count = allQuestions.filter(
                  (q) => q.subject.toLowerCase() === sub.name.toLowerCase()
                ).length;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveSubject(sub.name);
                      setSelectedChapter('All');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activeSubject === sub.name
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Questions Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="font-bold uppercase tracking-wider">
                Question Bank List ({displayedQuestions.length} Available)
              </span>
              <span>Class {selectedClass} JAC Syllabus</span>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {displayedQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-50/60 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                          {q.subject}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full">
                          {q.chapter}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            • {q.topic}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        Q{idx + 1}. {q.question}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleBookmark(q)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          bookmarkedIds.includes(q.id)
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title="Bookmark"
                      >
                        {bookmarkedIds.includes(q.id) ? (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingMcq(q);
                              setFormSubject(q.subject);
                              setFormChapter(q.chapter);
                              setFormQuestion(q.question);
                              setFormOptA(q.optionA);
                              setFormOptB(q.optionB);
                              setFormOptC(q.optionC);
                              setFormOptD(q.optionD);
                              setFormCorrect(q.correctAnswer);
                              setFormExplanation(q.explanation);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Edit MCQ"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMcq(q.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                            title="Delete MCQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Compact Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-700">
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-black text-slate-900 mr-1.5">A.</span> {q.optionA}
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-black text-slate-900 mr-1.5">B.</span> {q.optionB}
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-black text-slate-900 mr-1.5">C.</span> {q.optionC}
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                      <span className="font-black text-slate-900 mr-1.5">D.</span> {q.optionD}
                    </div>
                  </div>

                  {/* Correct Option & Explanation Banner */}
                  <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/80">
                    <span className="font-extrabold text-emerald-800">
                      ✓ सही उत्तर: Option {q.correctAnswer}
                    </span>
                    <span className="text-slate-700 ml-1.5 font-medium">
                      — {q.explanation}
                    </span>
                  </div>
                </div>
              ))}

              {displayedQuestions.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    No questions found matching your search or filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveSubject('All');
                      setSelectedChapter('All');
                      setOnlyBookmarks(false);
                    }}
                    className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEACHER ADD/EDIT MCQ MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-blue-900 px-5 py-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-tight">
                {editingMcq ? 'Edit MCQ Question' : 'Add New JAC MCQ Question'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMcq} className="p-5 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                    required
                  >
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.hindiName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chapter / Unit
                  </label>
                  <input
                    type="text"
                    value={formChapter}
                    onChange={(e) => setFormChapter(e.target.value)}
                    placeholder="e.g. Real Numbers"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Text
                </label>
                <textarea
                  rows={2}
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Enter full question text in Hindi/English..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option A
                  </label>
                  <input
                    type="text"
                    value={formOptA}
                    onChange={(e) => setFormOptA(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option B
                  </label>
                  <input
                    type="text"
                    value={formOptB}
                    onChange={(e) => setFormOptB(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option C
                  </label>
                  <input
                    type="text"
                    value={formOptC}
                    onChange={(e) => setFormOptC(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Option D
                  </label>
                  <input
                    type="text"
                    value={formOptD}
                    onChange={(e) => setFormOptD(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correct Answer
                  </label>
                  <select
                    value={formCorrect}
                    onChange={(e) => setFormCorrect(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl cursor-pointer"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class Target
                  </label>
                  <input
                    type="text"
                    value={`Class ${selectedClass}`}
                    disabled
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NCERT / JCERT Explanation
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Provide step-by-step formula or historical reference..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingMcq ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
