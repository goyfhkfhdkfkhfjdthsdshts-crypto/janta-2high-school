'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Timetable, SchoolClass, UserProfile } from '@/lib/types';
import { Clock, Calendar, Plus, Trash2, Edit, Check, Lock } from 'lucide-react';

interface TimetableViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function TimetableView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: TimetableViewProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const [activeDay, setActiveDay] = useState<(typeof days)[number]>('Monday');
  const [periods, setPeriods] = useState<Timetable[]>([]);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Timetable | null>(null);

  const [formPeriod, setFormPeriod] = useState(1);
  const [formTime, setFormTime] = useState('09:30 AM - 10:15 AM');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formTeacher, setFormTeacher] = useState('Mr. R. K. Sharma');
  const [formRoom, setFormRoom] = useState('Room 12');

  const fetchTimetable = async () => {
    try {
      const res = await fetch(`/api/data/timetable?class=${selectedClass}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setPeriods(data.data);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const periodsForDay = periods
    .filter((p) => p.day.toLowerCase() === activeDay.toLowerCase())
    .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));

  const handleSavePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const payload = {
      class: selectedClass,
      day: activeDay,
      periodNumber: formPeriod,
      time: formTime,
      subject: formSubject,
      teacher: formTeacher,
      room: formRoom,
    };

    try {
      if (editingPeriod) {
        await fetch('/api/data/timetable', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPeriod.id, ...payload }),
        });
      } else {
        await fetch('/api/data/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setEditingPeriod(null);
      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert('Error saving timetable period.');
    }
  };

  const handleDeletePeriod = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this period from timetable?')) return;
    try {
      await fetch(`/api/data/timetable?id=${id}`, { method: 'DELETE' });
      fetchTimetable();
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
                Official School Timetable
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Weekly Routine • Class Timings & Faculty Allocation
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingPeriod(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Period</span>
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

      {/* Day Selector Tabs: Mon - Sat */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`flex-1 min-w-[76px] py-2 px-3 rounded-2xl text-xs font-bold transition-all border ${
              activeDay === day
                ? 'bg-blue-700 text-white border-blue-700 shadow-md scale-102'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {day}
            {day === 'Saturday' && (
              <span className="block text-[9px] font-medium opacity-85 leading-tight">
                Spl Routine
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Routine Notice for Saturday */}
      {activeDay === 'Saturday' && (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>Saturday Special Schedule:</strong> Includes Maths, S.S.T, English, and vocational subjects (Sanskrit / Information Technology / Healthcare from 01:00 PM – 02:00 PM).
          </span>
        </div>
      )}

      {/* Periods List */}
      <div className="space-y-2.5">
        {periodsForDay.length > 0 ? (
          periodsForDay.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-blue-200 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-sm flex flex-col items-center justify-center shrink-0 border border-blue-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
                    Per
                  </span>
                  <span>{p.periodNumber || 1}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.subject}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-blue-600" />
                      {p.time || `${p.startTime || ''} - ${p.endTime || ''}`}
                    </span>
                    <span>•</span>
                    <span>Teacher: {p.teacher || p.teacherName || 'Assigned Teacher'}</span>
                    {p.room && (
                      <>
                        <span>•</span>
                        <span className="text-amber-800 font-medium">{p.room}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingPeriod(p);
                      setFormPeriod(p.periodNumber || 1);
                      setFormTime(p.time || `${p.startTime || ''} - ${p.endTime || ''}`);
                      setFormSubject(p.subject);
                      setFormTeacher(p.teacher || p.teacherName || '');
                      setFormRoom(p.room || '');
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePeriod(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No periods scheduled for {activeDay} in Class {selectedClass}.
          </div>
        )}
      </div>

      {/* Admin Add/Edit Period Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingPeriod ? 'Edit Period' : 'Add Period to Timetable'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSavePeriod} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Period #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room No.
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    placeholder="Room 12"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  placeholder="e.g. 01:00 PM - 02:00 PM"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. Sanskrit / IT / Healthcare"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Name
                </label>
                <input
                  type="text"
                  value={formTeacher}
                  onChange={(e) => setFormTeacher(e.target.value)}
                  placeholder="e.g. Mr. P. Pandey"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
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
                  Save Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
