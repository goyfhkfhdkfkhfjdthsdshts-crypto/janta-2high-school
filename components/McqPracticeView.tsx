'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SchoolLogo } from './SchoolLogo';
import { MCQQuestion, SchoolClass, UserProfile } from '@/lib/types';
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

export function McqPracticeView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: McqPracticeViewProps) {
  const [allQuestions, setAllQuestions] = useState<MCQQuestion[]>([]);
  const [activeSubject, setActiveSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [practiceMode, setPracticeMode] = useState<'subject' | 'chapter' | 'mixed' | 'random'>('mixed');
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(10);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

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

  // Fetch MCQs
  const fetchMcqs = async () => {
    try {
      const res = await fetch(`/api/data/mcq?class=${selectedClass}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setAllQuestions(data.data);
      }
    } catch (err) {
      console.error('Error fetching MCQs:', err);
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

      // Fetch from persistent database for this specific student
      if (studentAccountId && studentAccountId !== 'default_student') {
        fetch(`/api/student/activity?studentId=${encodeURIComponent(studentAccountId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data) {
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

  // Extract unique subjects & chapters
  const availableSubjects = Array.from(new Set(allQuestions.map((q) => q.subject)));
  const availableChapters = Array.from(
    new Set(
      allQuestions
        .filter((q) => activeSubject === 'All' || q.subject.toLowerCase() === activeSubject.toLowerCase())
        .map((q) => q.chapter)
        .filter(Boolean)
    )
  );

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

        // Sync with persistent database
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

        // Sync with persistent database
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

  // Start Practice Quiz
  const handleStartQuiz = () => {
    let pool = [...allQuestions];
    if (activeSubject !== 'All') {
      pool = pool.filter((q) => q.subject.toLowerCase() === activeSubject.toLowerCase());
    }
    if (selectedChapter !== 'All') {
      pool = pool.filter((q) => q.chapter.toLowerCase() === selectedChapter.toLowerCase());
    }

    if (practiceMode === 'random') {
      pool.sort(() => Math.random() - 0.5);
    }

    const selected = pool.slice(0, targetQuestionCount);
    if (selected.length === 0) {
      alert('No MCQs available matching this filter. Please choose another subject/chapter or generate practice MCQs.');
      return;
    }

    setQuizQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizCompleted(false);
    setQuizActive(true);
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

    // Save attempt to student history for progress tracking
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

      // Save to real persistent database
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
        // Save each generated MCQ to DB so it persists
        for (const q of data.questions) {
          await fetch('/api/data/mcq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
          });
        }
        fetchMcqs();
        alert('5 new AI practice MCQs added! Remember: These are practice questions for exam preparation.');
      } else {
        alert('Unable to generate practice MCQs right now. Please retry.');
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
      explanation: formExplanation || 'No detailed explanation provided.',
    };

    try {
      if (editingMcq) {
        await fetch('/api/data/mcq', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingMcq.id, ...payload }),
        });
      } else {
        await fetch('/api/data/mcq', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      await fetch(`/api/data/mcq?id=${id}`, { method: 'DELETE' });
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
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SchoolLogo size={46} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                JAC MCQ Practice Test
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Jharkhand Academic Council Aligned Objective Practice
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* AI Practice Generator */}
          <button
            onClick={handleGenerateAiMcqs}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Generate AI Practice MCQs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{isGeneratingAi ? 'Generating...' : 'AI Practice MCQs'}</span>
          </button>

          {/* Teacher Add MCQ */}
          {isAdmin ? (
            <button
              onClick={() => {
                setEditingMcq(null);
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add MCQ</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold"
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
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
              {/* Progress and Question Counter */}
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <span className="font-bold text-blue-900">
                  Question {currentIndex + 1} of {quizQuestions.length}
                </span>
                <span className="bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-full text-[11px]">
                  {currentQ.subject} • {currentQ.chapter}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="py-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
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

                  let buttonStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200';
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
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${buttonStyle}`}
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
                      <span className="text-xs sm:text-sm font-medium flex-1 pt-0.5">
                        {optText}
                      </span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
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
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {currentAnswer === currentQ.correctAnswer ? (
                      <span className="text-emerald-700">✓ Correct Answer!</span>
                    ) : (
                      <span className="text-red-700">
                        ✗ Wrong Answer. Correct Option: {currentQ.correctAnswer}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 font-medium">
                    <span className="font-bold">Explanation:</span> {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuizActive(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Exit Practice
                  </button>

                  <button
                    onClick={() => handleToggleBookmark(currentQ)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                      bookmarkedIds.includes(currentQ.id)
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                    title="Bookmark this question"
                  >
                    {bookmarkedIds.includes(currentQ.id) ? (
                      <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{bookmarkedIds.includes(currentQ.id) ? 'Saved' : 'Bookmark'}</span>
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
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-md">
                <Trophy className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">Practice Completed!</h3>
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
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Test</span>
                </button>
                <button
                  onClick={() => setQuizActive(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Back to Question Bank
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ SETUP & QUESTION BANK DASHBOARD */
        <div className="space-y-4">
          {/* Quiz Configuration Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-lg space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Practice Mode Selection
              </span>
              <h3 className="text-lg font-black tracking-tight">Configure Your Practice Session</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Choose mode, subject, and number of questions to begin instant self-assessment.
              </p>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mixed', label: 'Mixed Mode' },
                { id: 'subject', label: 'Subject-wise' },
                { id: 'chapter', label: 'Chapter-wise' },
                { id: 'random', label: 'Random 10' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPracticeMode(m.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
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
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-hidden"
                >
                  <option value="All" className="text-slate-900">All Subjects ({allQuestions.length})</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s} className="text-slate-900">{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-blue-200 mb-1">
                  Select Chapter:
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold text-white focus:outline-hidden"
                >
                  <option value="All" className="text-slate-900">All Chapters ({availableChapters.length})</option>
                  {availableChapters.map((ch) => (
                    <option key={ch} value={ch} className="text-slate-900">{ch}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Count: 10 / 20 / 30 / 50 */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-200 mb-1.5">
                Select Question Count:
              </label>
              <div className="flex items-center gap-2">
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTargetQuestionCount(num)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      targetQuestionCount === num
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>
            </div>

            {/* Start Practice CTA */}
            <div className="pt-2">
              <button
                onClick={handleStartQuiz}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <span>Start Practice Quiz Now ({selectedChapter !== 'All' ? selectedChapter : activeSubject})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Test Attempt History Card (if exists) */}
          {testHistory.length > 0 && (
            <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Recent Test Attempts & Accuracy</span>
                </span>
                <span className="text-[11px] text-slate-500">{testHistory.length} recorded</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {testHistory.slice(0, 4).map((th) => (
                  <div key={th.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{th.title}</p>
                      <p className="text-[11px] text-slate-500">{th.date} • {th.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black ${th.percentage >= 60 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {th.percentage}%
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold">{th.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveSubject('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSubject === 'All'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Subjects ({allQuestions.length})
            </button>
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeSubject === sub
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Question Bank List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider">
                Question Bank (Class {selectedClass})
              </span>
              <span>{allQuestions.length} Questions Available</span>
            </div>

            {allQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full inline-block">
                      {q.subject} • {q.chapter}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      Q{idx + 1}. {q.question}
                    </h4>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
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
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                        title="Edit MCQ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMcq(q.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100"
                        title="Delete MCQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Compact Options Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-600">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">A:</span> {q.optionA}
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">B:</span> {q.optionB}
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">C:</span> {q.optionC}
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-700">D:</span> {q.optionD}
                  </div>
                </div>

                <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 font-medium">
                  <span className="font-bold">Correct: Option {q.correctAnswer}</span> — {q.explanation}
                </div>
              </div>
            ))}
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
                className="text-blue-200 hover:text-white"
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
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correct Option
                  </label>
                  <select
                    value={formCorrect}
                    onChange={(e) => setFormCorrect(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Explanation
                  </label>
                  <input
                    type="text"
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    placeholder="Why this answer is correct"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-800"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
