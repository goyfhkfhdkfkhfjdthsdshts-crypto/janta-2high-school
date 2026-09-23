'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Notice, SchoolClass, UserProfile } from '@/lib/types';
import { Bell, Calendar, Plus, Trash2, Edit, AlertTriangle, Pin, Lock } from 'lucide-react';

interface NoticeBoardViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function NoticeBoardView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: NoticeBoardViewProps) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [formTargetClass, setFormTargetClass] = useState<string>('All');

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/data/notices');
      const data = await res.json();
      if (res.ok && data.data) {
        setNotices(data.data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const payload = {
      title: formTitle,
      content: formContent,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      priority: formPriority,
      targetClass: formTargetClass,
      author: user?.name || 'Principal Office',
    };

    try {
      if (editingNotice) {
        await fetch('/api/data/notices', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNotice.id, ...payload }),
        });
      } else {
        await fetch('/api/data/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setEditingNotice(null);
      setFormTitle('');
      setFormContent('');
      fetchNotices();
    } catch (err) {
      console.error(err);
      alert('Error saving notice.');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this notice from the board?')) return;
    try {
      await fetch(`/api/data/notices?id=${id}`, { method: 'DELETE' });
      fetchNotices();
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
                Official Notice Board
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">
                School Circulars
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Janta +2 High School Khalari Announcements & Orders
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingNotice(null);
              setFormTitle('');
              setFormContent('');
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Teacher Mode</span>
          </button>
        )}
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((n) => {
          const isUrgent = n.priority === 'urgent';
          const isImportant = n.priority === 'important' || n.important;
          const displayContent = n.content || n.description;

          return (
            <div
              key={n.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-3 ${
                isUrgent
                  ? 'border-red-300 ring-1 ring-red-200'
                  : isImportant
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isUrgent
                          ? 'bg-red-600 text-white'
                          : isImportant
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n.priority || (n.important ? 'important' : 'normal')}
                    </span>

                    {n.targetClass && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        Class: {n.targetClass}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {n.date}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {n.title}
                  </h3>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNotice(n);
                        setFormTitle(n.title);
                        setFormContent(n.content || n.description);
                        setFormPriority(n.priority || (n.important ? 'important' : 'normal'));
                        setFormTargetClass(n.targetClass || 'All');
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                {displayContent}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Issued by: {n.author || 'Principal, Janta +2 High School'}</span>
                <span className="text-blue-700 font-semibold">Khalari, Ranchi</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingNotice ? 'Edit Notice' : 'Publish New Notice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. JAC Practical Exam Registration Schedule"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Tag
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Class
                  </label>
                  <select
                    value={formTargetClass}
                    onChange={(e) => setFormTargetClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="All">All Classes (9 - 12)</option>
                    <option value="9">Class 9 Only</option>
                    <option value="10">Class 10 Only</option>
                    <option value="11">Class 11 Only</option>
                    <option value="12">Class 12 Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Details & Instructions
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Enter complete notice text..."
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
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
