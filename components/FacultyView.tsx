'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Faculty, SchoolClass, UserProfile } from '@/lib/types';
import { Users, Mail, Phone, Award, Plus, Trash2, Edit, GraduationCap, Lock } from 'lucide-react';

interface FacultyViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function FacultyView({
  user,
  isAdmin,
  onOpenAdminModal,
  language,
}: FacultyViewProps) {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('PGT (Post Graduate Teacher)');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formClasses, setFormClasses] = useState('9, 10, 11, 12');
  const [formQualification, setFormQualification] = useState('M.Sc. (Maths), B.Ed.');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/data/faculty');
      const data = await res.json();
      if (res.ok && data.data) {
        setFacultyList(data.data);
      }
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const payload = {
      name: formName,
      designation: formDesignation,
      subject: formSubject,
      classesTaught: formClasses.split(',').map((c) => c.trim()),
      qualification: formQualification,
      email: formEmail || undefined,
      phone: formPhone || undefined,
    };

    try {
      if (editingFaculty) {
        await fetch('/api/data/faculty', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFaculty.id, ...payload }),
        });
      } else {
        await fetch('/api/data/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (err) {
      console.error(err);
      alert('Error saving faculty member.');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this faculty record?')) return;
    try {
      await fetch(`/api/data/faculty?id=${id}`, { method: 'DELETE' });
      fetchFaculty();
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
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
              Faculty & Staff Directory
            </h2>
            <p className="text-xs text-slate-500">
              Teachers, Administrators & Department Heads
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setEditingFaculty(null);
              setFormName('');
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
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

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {facultyList.map((fac) => (
          <div
            key={fac.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {fac.name
                      .replace('Mr. ', '')
                      .replace('Dr. ', '')
                      .replace('Mrs. ', '')
                      .charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                    <p className="text-[11px] text-blue-700 font-semibold">{fac.designation}</p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingFaculty(fac);
                        setFormName(fac.name);
                        setFormDesignation(fac.designation);
                        setFormSubject(fac.subject);
                        setFormClasses(Array.isArray(fac.classesTaught) ? fac.classesTaught.join(', ') : fac.classesTaught || '');
                        setFormQualification(fac.qualification);
                        setFormEmail(fac.email || '');
                        setFormPhone(fac.phone || '');
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaculty(fac.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p>
                  <strong>Subject:</strong> {fac.subject}
                </p>
                <p>
                  <strong>Qualification:</strong> {fac.qualification}
                </p>
                <p>
                  <strong>Classes Taught:</strong> Class {Array.isArray(fac.classesTaught) ? fac.classesTaught.join(', ') : fac.classesTaught}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              {fac.email && (
                <span className="flex items-center gap-1 truncate max-w-[180px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {fac.email}
                </span>
              )}
              {fac.phone && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {fac.phone}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveFaculty} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Mr. R. K. Sharma"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classes Taught (comma separated)
                </label>
                <input
                  type="text"
                  value={formClasses}
                  onChange={(e) => setFormClasses(e.target.value)}
                  placeholder="9, 10, 11, 12"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Educational Qualification
                </label>
                <input
                  type="text"
                  value={formQualification}
                  onChange={(e) => setFormQualification(e.target.value)}
                  placeholder="e.g. M.Sc. (Physics), B.Ed."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
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
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
