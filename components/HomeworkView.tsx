'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Plus,
  Trash2,
  User,
  Users,
  X,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Search,
  Check,
  Upload,
  Camera,
} from 'lucide-react';
import { HomeworkItem, SchoolClass, UserProfile } from '@/lib/types';

interface HomeworkViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function HomeworkView({
  user,
  isAdmin,
  selectedClass,
  onSelectClass,
  onOpenAdminModal,
  language,
}: HomeworkViewProps) {
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Homework Modal State (for Teacher/Admin)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formClass, setFormClass] = useState<SchoolClass>(selectedClass);
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Submissions Modal State (for Teacher/Admin)
  const [activeSubmissionsHw, setActiveSubmissionsHw] = useState<HomeworkItem | null>(null);

  // Student Upload Assignment Modal State
  const [studentUploadHw, setStudentUploadHw] = useState<HomeworkItem | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadAttachment, setUploadAttachment] = useState<{ name: string; url: string } | null>(null);
  const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);

  const studentId = user?.id || 'guest_student';
  const studentName = user?.name || 'Student';

  const fetchHomework = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/homework?class=${selectedClass}`);
      const data = await res.json();
      if (data.success && data.homework) {
        setHomeworkList(data.homework);
      }
    } catch (err) {
      console.error('Error fetching homework:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [selectedClass]);

  const handleToggleCompletion = async (hwId: string) => {
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_complete',
          homeworkId: hwId,
          studentId,
          studentName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHomeworkList((prev) =>
          prev.map((h) => (h.id === hwId ? data.item : h))
        );
      }
    } catch (err) {
      console.error('Error toggling homework completion:', err);
    }
  };

  const handleStudentUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUploadHw) return;

    setIsSubmittingUpload(true);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_complete',
          homeworkId: studentUploadHw.id,
          studentId,
          studentName,
          notes: uploadNotes.trim() || 'Assignment submitted by student.',
          submissionUrl: uploadAttachment?.url,
          submissionName: uploadAttachment?.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHomeworkList((prev) =>
          prev.map((h) => (h.id === studentUploadHw.id ? data.item : h))
        );
        setStudentUploadHw(null);
        setUploadNotes('');
        setUploadAttachment(null);
      }
    } catch (err) {
      console.error('Error submitting homework work:', err);
    } finally {
      setIsSubmittingUpload(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formDueDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          class: formClass,
          subject: formSubject,
          title: formTitle,
          description: formDescription,
          dueDate: formDueDate,
          attachmentUrl: formAttachmentUrl || undefined,
          attachmentName: formAttachmentName || (formAttachmentUrl ? 'Assignment_Resource.pdf' : undefined),
          assignedBy: user?.name ? `${user.name} (Faculty)` : 'Subject Teacher',
        }),
      });

      const data = await res.json();
      if (data.success && data.homework) {
        setHomeworkList((prev) => [data.homework, ...prev]);
        setIsCreateModalOpen(false);
        // Reset form
        setFormTitle('');
        setFormDescription('');
        setFormDueDate('');
        setFormAttachmentUrl('');
        setFormAttachmentName('');
      }
    } catch (err) {
      console.error('Error creating homework:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस असाइनमेंट को हटाना चाहते हैं?' : 'Are you sure you want to delete this assignment?')) {
      return;
    }
    try {
      const res = await fetch(`/api/homework?id=${id}&adminName=${encodeURIComponent(user?.name || 'Admin')}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHomeworkList((prev) => prev.filter((h) => h.id !== id));
      }
    } catch (err) {
      console.error('Error deleting homework:', err);
    }
  };

  const subjects = ['All', 'Mathematics', 'Science (Physics)', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science', 'Sanskrit'];

  const filteredHomework = homeworkList.filter((h) => {
    const matchesSubject = selectedSubject === 'All' || h.subject.toLowerCase().includes(selectedSubject.toLowerCase());
    const isCompleted = (h.completions || []).some((c) => c.studentId === studentId);
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? isCompleted
        : !isCompleted;
    const matchesSearch =
      !searchQuery ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const completedCount = homeworkList.filter((h) =>
    (h.completions || []).some((c) => c.studentId === studentId)
  ).length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-teal-200 backdrop-blur-xs">
              <BookOpen className="w-3.5 h-3.5" />
              {language === 'hi' ? 'गृहकार्य एवं असाइनमेंट' : 'Assignments & Homework'}
            </span>
            {isAdmin ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'नया होमवर्क दें' : '+ Assign Homework'}</span>
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
              {language === 'hi' ? `कक्षा ${selectedClass} दैनिक गृहकार्य` : `Class ${selectedClass} Daily Homework`}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-1">
              {language === 'hi'
                ? 'विषयवार कार्य पूरा करें, नोट्स देखें और पूरा होने पर मार्क करें।'
                : 'Track subject tasks, view reference study links, and mark completion.'}
            </p>
          </div>

          {/* Student Progress Pill */}
          <div className="flex items-center gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>
                {completedCount} / {homeworkList.length}{' '}
                {language === 'hi' ? 'कार्य पूर्ण' : 'Completed'}
              </span>
            </div>
            {homeworkList.length > 0 && (
              <div className="flex-1 max-w-xs bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round((completedCount / homeworkList.length) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Class Selector & Search & Filters */}
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

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'सभी' : 'All'}
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-100 text-amber-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'लंबित' : 'Pending'}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-100 text-emerald-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'hi' ? 'पूर्ण' : 'Done'}
            </button>
          </div>
        </div>

        {/* Search & Subject Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'असाइनमेंट या विषय खोजें...' : 'Search assignment or topic...'}
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

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? (language === 'hi' ? 'सभी विषय (All Subjects)' : 'All Subjects') : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Cards List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 mx-auto border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">
            {language === 'hi' ? 'असाइनमेंट लोड हो रहे हैं...' : 'Loading homework assignments...'}
          </p>
        </div>
      ) : filteredHomework.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi' ? 'कोई गृहकार्य नहीं मिला' : 'No Homework Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'वर्तमान चयन के लिए कोई लंबित कार्य नहीं है या सभी कार्य पूर्ण हैं।'
              : 'There are no active homework assignments for this selection or all have been completed.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया होमवर्क बनाएं' : 'Create First Homework'}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHomework.map((hw) => {
            const isCompleted = (hw.completions || []).some((c) => c.studentId === studentId);
            const completionCount = (hw.completions || []).length;
            const isOverdue = new Date(hw.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={hw.id}
                className={`bg-white rounded-2xl border transition-all p-4.5 flex flex-col justify-between relative shadow-xs ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : isOverdue
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top tags */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {hw.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Class {hw.class}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3 h-3" />
                          {language === 'hi' ? 'पूर्ण' : 'Completed'}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveSubmissionsHw(hw)}
                          className="p-1 text-slate-400 hover:text-blue-700 rounded-lg hover:bg-slate-100"
                          title="View Student Submissions"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHomework(hw.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title="Delete Homework"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {hw.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                      {hw.description}
                    </p>
                  </div>

                  {/* Attachment if present */}
                  {hw.attachmentUrl && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">
                          {hw.attachmentName || 'Study Material / Question Sheet'}
                        </span>
                      </div>
                      <a
                        href={hw.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold shrink-0"
                      >
                        <Download className="w-3 h-3" />
                        <span>{language === 'hi' ? 'देखें' : 'Open'}</span>
                      </a>
                    </div>
                  )}

                  {/* Teacher & Due Date info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{hw.assignedBy}</span>
                    </span>
                    <span className={`flex items-center gap-1 font-semibold ${
                      isOverdue && !isCompleted ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>
                        {language === 'hi' ? 'अंतिम तिथि:' : 'Due:'} {hw.dueDate}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isAdmin ? (
                    <button
                      onClick={() => setActiveSubmissionsHw(hw)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {completionCount} {language === 'hi' ? 'छात्रों ने पूर्ण किया' : 'Submissions'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {completionCount > 0
                        ? `${completionCount} ${language === 'hi' ? 'सहपाठियों ने पूर्ण किया' : 'students done'}`
                        : language === 'hi' ? 'पहले पूर्ण करने वाले बनें' : 'Be the first to complete'}
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleCompletion(hw.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-100 hover:bg-blue-700 hover:text-white text-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isCompleted
                        ? language === 'hi' ? 'पूर्ण हुआ (हटाएं)' : 'Completed (Undo)'
                        : language === 'hi' ? 'पूर्ण चिह्नित करें' : 'Mark as Done'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE HOMEWORK MODAL (Teacher/Admin) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h2 className="text-base font-bold">
                  {language === 'hi' ? 'नया गृहकार्य / असाइनमेंट बनाएं' : 'Assign New Homework'}
                </h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'कक्षा' : 'Class'} *
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value as SchoolClass)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    required
                  >
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'विषय' : 'Subject'} *
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Mathematics"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'असाइनमेंट शीर्षक' : 'Assignment Title'} *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Trigonometry Exercise 8.4 Q1 to Q5"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'निर्देश एवं विवरण' : 'Description / Instructions'} *
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide detailed instructions for students to solve in notebook..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'अंतिम तिथि (Due Date)' : 'Due Date'} *
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'अटैचमेंट / PDF लिंक (वैकल्पिक)' : 'Attachment / PDF Link (Optional)'}
                </label>
                <input
                  type="url"
                  value={formAttachmentUrl}
                  onChange={(e) => setFormAttachmentUrl(e.target.value)}
                  placeholder="https://... (NCERT PDF or Google Drive Link)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : language === 'hi' ? 'प्रकाशित करें' : 'Publish Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SUBMISSIONS MODAL (Teacher/Admin) */}
      {activeSubmissionsHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold truncate max-w-xs">{activeSubmissionsHw.title}</h3>
                <p className="text-[11px] text-slate-400">Class {activeSubmissionsHw.class} • Submissions List</p>
              </div>
              <button
                onClick={() => setActiveSubmissionsHw(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {activeSubmissionsHw.completions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {language === 'hi' ? 'अभी तक किसी छात्र ने पूर्ण नहीं किया है।' : 'No students have marked this completed yet.'}
                </div>
              ) : (
                activeSubmissionsHw.completions.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{c.studentName}</span>
                      <p className="text-[11px] text-slate-500">{c.notes || 'Completed'}</p>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {new Date(c.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
