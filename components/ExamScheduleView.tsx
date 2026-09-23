'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { ExamSchedule, SchoolClass, UserProfile } from '@/lib/types';
import { Calendar, Clock, Plus, Trash2, Edit, AlertCircle, FileText, Lock } from 'lucide-react';

interface ExamScheduleViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function ExamScheduleView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: ExamScheduleViewProps) {
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);

  const [formExamName, setFormExamName] = useState('JAC Board Annual Examination 2026');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formDate, setFormDate] = useState('2026-03-15');
  const [formTime, setFormTime] = useState('09:45 AM - 01:00 PM');
  const [formShift, setFormShift] = useState('1st Sitting');
  const [formRoom, setFormRoom] = useState('Exam Hall A');
  const [formInstructions, setFormInstructions] = useState(
    'Entry strictly with JAC Admit Card and School Uniform. No electronic devices permitted.'
  );

  const fetchExams = async () => {
    try {
      const res = await fetch(`/api/data/exams?class=${selectedClass}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setExams(data.data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedClass]);

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const payload = {
      class: selectedClass,
      examName: formExamName,
      subject: formSubject,
      date: formDate,
      time: formTime,
      shift: formShift,
      room: formRoom,
      instructions: formInstructions,
    };

    try {
      if (editingExam) {
        await fetch('/api/data/exams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingExam.id, ...payload }),
        });
      } else {
        await fetch('/api/data/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setEditingExam(null);
      fetchExams();
    } catch (err) {
      console.error(err);
      alert('Error saving exam schedule.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this exam entry from the schedule?')) return;
    try {
      await fetch(`/api/data/exams?id=${id}`, { method: 'DELETE' });
      fetchExams();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <SchoolLogo size={46} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                Examination Date Sheet
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              JAC Board & Terminal Examination Time Table
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingExam(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Teacher Edit</span>
          </button>
        )}
      </div>

      {/* Exam Cards */}
      <div className="space-y-3">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {exam.examName}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      {exam.shift}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.subject}</h3>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingExam(exam);
                        setFormExamName(exam.examName);
                        setFormSubject(exam.subject);
                        setFormDate(exam.date);
                        setFormTime(exam.time);
                        setFormShift(exam.shift || '1st Sitting');
                        setFormRoom(exam.room || '');
                        setFormInstructions(exam.instructions || '');
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Schedule details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">Date</span>
                    <span className="font-bold text-slate-800">{exam.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">Time</span>
                    <span className="font-bold text-slate-800">{exam.time}</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block leading-tight">Room / Hall</span>
                  <span className="font-bold text-slate-800">{exam.room || 'Assigned Hall'}</span>
                </div>
              </div>

              {/* Instructions */}
              {exam.instructions && (
                <div className="text-[11px] text-slate-600 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instructions:</strong> {exam.instructions}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No exams scheduled currently for Class {selectedClass}.
          </div>
        )}
      </div>

      {/* Admin Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingExam ? 'Edit Exam' : 'Add Examination Schedule'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exam Title
                </label>
                <input
                  type="text"
                  value={formExamName}
                  onChange={(e) => setFormExamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="09:45 AM - 01:00 PM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
                  <input
                    type="text"
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    placeholder="1st Sitting"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Important Instructions
                </label>
                <textarea
                  rows={2}
                  value={formInstructions}
                  onChange={(e) => setFormInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
