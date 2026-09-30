'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  WrittenQuestion,
  WrittenSubmission,
  SchoolClass,
  UserProfile,
} from '@/lib/types';
import { SchoolLogo } from './SchoolLogo';
import {
  FileText,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
  Award,
  AlertCircle,
  Eye,
  Send,
  Camera,
  Image as ImageIcon,
  X,
  Search,
  Check,
  User,
  GraduationCap,
} from 'lucide-react';

interface WrittenQaViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function WrittenQaView({
  user,
  isAdmin,
  selectedClass,
  onSelectClass,
  onOpenAdminModal,
  language,
}: WrittenQaViewProps) {
  const [questions, setQuestions] = useState<WrittenQuestion[]>([]);
  const [submissions, setSubmissions] = useState<WrittenSubmission[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Student Open Question Modal
  const [activeQuestion, setActiveQuestion] = useState<WrittenQuestion | null>(null);
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  // Teacher/Admin Add Question Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formSubject, setFormSubject] = useState('Science (Physics)');
  const [formChapter, setFormChapter] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formMarks, setFormMarks] = useState<number>(5);
  const [formWordLimit, setFormWordLimit] = useState('150 - 200 words');
  const [formModelAnswer, setFormModelAnswer] = useState('');
  const [formMarkingScheme, setFormMarkingScheme] = useState('');

  // Teacher Review & Grade Modal
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<WrittenSubmission | null>(null);
  const [assignedMarks, setAssignedMarks] = useState<number>(5);
  const [teacherRemarks, setTeacherRemarks] = useState('');

  const currentUserId = user?.id || 'guest_student';
  const currentUserName = user?.name || 'Student';

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/data/written?class=${selectedClass}`);
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error('Error fetching written questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  // Fetch Student Submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      const queryParam = isAdmin
        ? `?type=submissions&class=${selectedClass}`
        : `?type=submissions&studentId=${encodeURIComponent(currentUserId)}&class=${selectedClass}`;
      const res = await fetch(`/api/data/written${queryParam}`);
      const data = await res.json();
      if (data.success && data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  }, [selectedClass, isAdmin, currentUserId]);

  useEffect(() => {
    fetchQuestions();
    fetchSubmissions();
  }, [fetchQuestions, fetchSubmissions]);

  // Open question to answer
  const handleOpenQuestion = (q: WrittenQuestion) => {
    setActiveQuestion(q);
    const existing = submissions.find((s) => s.questionId === q.id && s.studentId === currentUserId);
    if (existing) {
      setStudentAnswerText(existing.studentAnswer);
      setAttachedImage(existing.attachmentUrl || null);
      setShowModelAnswer(true); // already submitted, reveal model answer
    } else {
      setStudentAnswerText('');
      setAttachedImage(null);
      setShowModelAnswer(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion || !studentAnswerText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/data/written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_answer',
          questionId: activeQuestion.id,
          studentId: currentUserId,
          studentName: currentUserName,
          class: selectedClass,
          subject: activeQuestion.subject,
          studentAnswer: studentAnswerText.trim(),
          attachmentUrl: attachedImage || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        setShowModelAnswer(true);
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Error submitting written answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save new Written Question (Teacher/Admin)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    try {
      const res = await fetch('/api/data/written', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_question',
          class: selectedClass,
          subject: formSubject,
          chapter: formChapter || 'Important Board Topics',
          question: formQuestion,
          marks: formMarks,
          wordLimit: formWordLimit,
          modelAnswer: formModelAnswer,
          markingScheme: formMarkingScheme,
        }),
      });

      const data = await res.json();
      if (data.success && data.question) {
        setQuestions((prev) => [data.question, ...prev]);
        setIsAddModalOpen(false);
        setFormQuestion('');
        setFormModelAnswer('');
        setFormMarkingScheme('');
        setFormChapter('');
      }
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  // Grade student submission (Teacher/Admin)
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const res = await fetch('/api/data/written', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradingSubmission.id,
          marks: Number(assignedMarks),
          remarks: teacherRemarks,
          teacherName: user?.name ? `${user.name} (Faculty)` : 'Subject Teacher',
        }),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === gradingSubmission.id ? data.submission : s))
        );
        setIsGradeModalOpen(false);
        setGradingSubmission(null);
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Delete this written question?')) return;
    try {
      const res = await fetch(`/api/data/written?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const subjects = ['All', 'Science (Physics)', 'Science (Chemistry)', 'Science (Biology)', 'Mathematics', 'Social Science', 'Hindi', 'English', 'Sanskrit'];

  const filteredQuestions = questions.filter((q) => {
    const matchSubject = selectedSubject === 'All' || q.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchSearch =
      !searchQuery ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-teal-200 backdrop-blur-xs">
              <Edit3 className="w-3.5 h-3.5" />
              {language === 'hi' ? 'लिखित उत्तर अभ्यास (Descriptive)' : 'Written Q&A Practice'}
            </span>

            {isAdmin ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? '+ नया प्रश्न जोड़ें' : '+ Add Question'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="text-[11px] text-teal-200 hover:text-white underline font-medium"
              >
                {language === 'hi' ? 'शिक्षक मोड' : 'Teacher Access'}
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi' ? `कक्षा ${selectedClass} JAC बोर्ड लिखित प्रश्न` : `Class ${selectedClass} JAC Written Q&A`}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-1">
              {language === 'hi'
                ? 'विस्तृत उत्तर लिखें, सबमिट करें और आधिकारिक मॉडल उत्तर व अंकन योजना (Marking Scheme) से मिलान करें।'
                : 'Compose descriptive answers, submit for checking, and review official JAC Board model answers.'}
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-xl font-semibold">
              {questions.length} {language === 'hi' ? 'उपलब्ध प्रश्न' : 'Questions Available'}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-semibold">
              {submissions.filter((s) => s.studentId === currentUserId).length}{' '}
              {language === 'hi' ? 'हल किए गए' : 'Attempted by you'}
            </span>
          </div>
        </div>
      </div>

      {/* Class Selector, Search & Subject Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Class Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">
              {language === 'hi' ? 'कक्षा:' : 'Class:'}
            </span>
            {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
              <button
                key={c}
                onClick={() => onSelectClass(c)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedClass === c
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}th
              </button>
            ))}
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? (language === 'hi' ? 'सभी विषय (All Subjects)' : 'All Subjects') : s}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'प्रश्न या पाठ खोजें...' : 'Search written question by chapter or keywords...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 mx-auto border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">{language === 'hi' ? 'प्रश्न लोड हो रहे हैं...' : 'Loading questions...'}</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi' ? 'कोई लिखित प्रश्न नहीं मिला' : 'No Written Questions Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'वर्तमान चयन के लिए कोई प्रश्न उपलब्ध नहीं है। कृपया दूसरा विषय चुनें।'
              : 'No questions matching this filter. Select another subject or class.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const userSub = submissions.find(
              (s) => s.questionId === q.id && s.studentId === currentUserId
            );
            const isAttempted = !!userSub;
            const isGraded = typeof userSub?.marksObtained === 'number';

            return (
              <div
                key={q.id}
                onClick={() => handleOpenQuestion(q)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 sm:p-5 shadow-xs transition-all cursor-pointer group space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {q.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {q.chapter}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {q.marks} Marks
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors pt-1">
                      {q.question}
                    </h3>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteQuestion(q.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 shrink-0"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">
                    Word limit: {q.wordLimit || '150 words'}
                  </span>

                  <div className="flex items-center gap-2">
                    {isGraded ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        Checked: {userSub?.marksObtained} / {q.marks} Marks
                      </span>
                    ) : isAttempted ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        Submitted • Awaiting Teacher Review
                      </span>
                    ) : (
                      <span className="text-blue-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Write Answer</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENT WRITE / VIEW MODAL */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                    {activeQuestion.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    {activeQuestion.marks} Marks
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                  {activeQuestion.question}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuestion(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Answer writing textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <label>Your Written Answer / आपका विस्तृत उत्तर:</label>
                  <span className="text-slate-400">
                    {studentAnswerText.trim() ? studentAnswerText.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={studentAnswerText}
                  onChange={(e) => setStudentAnswerText(e.target.value)}
                  placeholder="अपनी कॉपी या समझ के अनुसार बिंदुवार उत्तर लिखें... (जैसे: 1. नियम, 2. सूत्र, 3. शर्तें)"
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white text-slate-900 font-sans leading-relaxed"
                />
              </div>

              {/* Photo of handwritten answer attachment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Attach Copy Photo / हस्तलिखित कॉपी की फोटो जोड़ें:
                  </span>
                  {attachedImage && (
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="text-xs text-red-600 font-semibold hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {attachedImage ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-300 max-h-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachedImage}
                      alt="Solution copy"
                      className="w-full h-auto object-contain max-h-56"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-blue-700">Upload Answer Photo</span>
                    <span className="text-[11px] text-slate-400">JPG, PNG or photo taken from camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setAttachedImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Official Model Answer & Marking Scheme (Revealed after submission) */}
              {showModelAnswer && (
                <div className="space-y-3 pt-2 animate-in fade-in">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Official JAC Model Answer / आदर्श उत्तर:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 whitespace-pre-line leading-relaxed font-sans font-medium">
                      {activeQuestion.modelAnswer}
                    </p>
                  </div>

                  {activeQuestion.markingScheme && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs">
                      <span className="font-bold text-amber-900 block">
                        JAC Board Marking Scheme / अंकन योजना:
                      </span>
                      <p className="text-amber-950 font-medium leading-relaxed">
                        {activeQuestion.markingScheme}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!studentAnswerText.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Answer & Check'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER ADD QUESTION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Add Written Question (Class {selectedClass})
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                >
                  {subjects.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 10: Light Reflection & Refraction"
                  value={formChapter}
                  onChange={(e) => setFormChapter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  rows={3}
                  placeholder="Type the full descriptive question..."
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Word Limit</label>
                  <input
                    type="text"
                    placeholder="150 - 200 words"
                    value={formWordLimit}
                    onChange={(e) => setFormWordLimit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Model Answer</label>
                <textarea
                  rows={4}
                  placeholder="Provide the step-by-step model answer..."
                  value={formModelAnswer}
                  onChange={(e) => setFormModelAnswer(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marking Scheme (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 2 marks for law, 2 marks for formula, 1 mark for unit"
                  value={formMarkingScheme}
                  onChange={(e) => setFormMarkingScheme(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
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
