'use client';

import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Result, SchoolClass, UserProfile } from '@/lib/types';
import { Award, Search, Plus, Trash2, CheckCircle2, XCircle, FileText, Lock } from 'lucide-react';

interface ResultsViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function ResultsView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: ResultsViewProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [rollCodeQuery, setRollCodeQuery] = useState('');
  const [rollNoQuery, setRollNoQuery] = useState('');
  const [searchedResult, setSearchedResult] = useState<Result | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Admin Add Result Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRollCode, setFormRollCode] = useState('23045');
  const [formRollNo, setFormRollNo] = useState('');
  const [formExamName, setFormExamName] = useState('JAC Board Annual Exam 2026');
  const [formMarks, setFormMarks] = useState([
    { subject: 'Hindi', marks: 82, fullMarks: 100 },
    { subject: 'English', marks: 78, fullMarks: 100 },
    { subject: 'Mathematics', marks: 91, fullMarks: 100 },
    { subject: 'Science', marks: 88, fullMarks: 100 },
    { subject: 'Social Science', marks: 85, fullMarks: 100 },
  ]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/data/results?class=${selectedClass}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setResults(data.data);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  useEffect(() => {
    fetchResults();
    setSearchedResult(null);
    setSearchAttempted(false);
  }, [selectedClass]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);

    const match = results.find((r) => {
      const matchRollCode = !rollCodeQuery.trim() || r.rollCode.trim() === rollCodeQuery.trim();
      const currentRoll = (r.rollNumber || r.rollNo || '').trim();
      const matchRollNo = currentRoll === rollNoQuery.trim();
      return matchRollCode && matchRollNo;
    });

    setSearchedResult(match || null);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }

    const totalMarks = formMarks.reduce((sum, m) => sum + Number(m.marks), 0);
    const maxMarks = formMarks.reduce((sum, m) => sum + Number(m.fullMarks), 0);
    const percentage = Math.round((totalMarks / maxMarks) * 100);
    const status = percentage >= 33 ? 'PASS' : 'FAIL';
    const division =
      percentage >= 60 ? '1st Division' : percentage >= 45 ? '2nd Division' : '3rd Division';

    const payload = {
      studentName: formName,
      rollCode: formRollCode,
      rollNumber: formRollNo,
      class: selectedClass,
      examName: formExamName,
      subjects: formMarks,
      totalMarks,
      maxMarks,
      percentage,
      division,
      status,
      publishedDate: new Date().toLocaleDateString('en-IN'),
    };

    try {
      await fetch('/api/data/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsModalOpen(false);
      setFormName('');
      setFormRollNo('');
      fetchResults();
    } catch (err) {
      console.error(err);
      alert('Error saving student result.');
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this result record?')) return;
    try {
      await fetch(`/api/data/results?id=${id}`, { method: 'DELETE' });
      fetchResults();
      if (searchedResult?.id === id) setSearchedResult(null);
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
                Published Results Portal
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Class {selectedClass}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              JAC Board Marks Statement & Marksheets
            </p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Result</span>
          </button>
        ) : (
          <button
            onClick={onOpenAdminModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Publish</span>
          </button>
        )}
      </div>

      {/* SEARCH FORM: Roll Code & Roll Number */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-700" />
          <span>Search Student Result by Roll Code & Number</span>
        </h3>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Roll Code (e.g. 23045)
            </label>
            <input
              type="text"
              placeholder="Roll Code"
              value={rollCodeQuery}
              onChange={(e) => setRollCodeQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Roll Number (e.g. 0012)
            </label>
            <input
              type="text"
              placeholder="Roll Number"
              value={rollNoQuery}
              onChange={(e) => setRollNoQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-bold"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Get Result</span>
            </button>
          </div>
        </form>
      </div>

      {/* RESULT DISPLAY CARD */}
      {searchedResult ? (
        <div className="bg-white rounded-3xl p-6 border-2 border-blue-400 shadow-xl space-y-5 animate-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <SchoolLogo size={42} showText={false} />
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  {searchedResult.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  Roll Code: <span className="font-bold text-slate-900">{searchedResult.rollCode}</span> • Roll No:{' '}
                  <span className="font-bold text-slate-900">{searchedResult.rollNumber || searchedResult.rollNo}</span> • Class{' '}
                  <span className="font-bold text-blue-700">{searchedResult.class}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  searchedResult.status === 'PASS' || searchedResult.division !== 'Failed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {searchedResult.status || 'PASS'} • {searchedResult.division}
              </span>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Subject</th>
                  <th className="p-3 text-center">Marks Obtained</th>
                  <th className="p-3 text-center">Full Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(searchedResult.subjects ||
                  searchedResult.subjectScores?.map((s) => ({
                    subject: s.subject,
                    marks: s.marks,
                    fullMarks: s.maxMarks,
                  })) ||
                  []
                ).map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{sub.subject}</td>
                    <td className="p-3 text-center font-bold text-blue-700">{sub.marks}</td>
                    <td className="p-3 text-center text-slate-500">{sub.fullMarks}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td className="p-3 text-slate-900">Total Marks / Percentage</td>
                  <td className="p-3 text-center text-emerald-700 font-black">
                    {searchedResult.obtainedMarks || searchedResult.totalMarks} / {searchedResult.maxMarks || 500}
                  </td>
                  <td className="p-3 text-center text-emerald-700 font-black">
                    {searchedResult.percentage}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Official Marks Statement • Issued by Janta +2 High School, Khalari (Ranchi)
          </div>
        </div>
      ) : searchAttempted ? (
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-600 text-xs">
          No result record found matching Roll Code: <strong>{rollCodeQuery}</strong> and Roll No: <strong>{rollNoQuery}</strong>. Please check your admit card details.
        </div>
      ) : null}

      {/* Class Merit / Published List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Published Results List (Class {selectedClass})
        </h4>

        {results.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-blue-200 transition-colors"
          >
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-slate-900">{res.studentName}</h5>
              <p className="text-[11px] text-slate-500">
                Roll: {res.rollCode}-{res.rollNumber || res.rollNo} • Total: {res.obtainedMarks || res.totalMarks}/{res.maxMarks || 500} ({res.percentage}%) •{' '}
                <span className="font-semibold text-emerald-700">{res.division}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchedResult(res);
                  setSearchAttempted(true);
                  setRollCodeQuery(res.rollCode);
                  setRollNoQuery(res.rollNumber || res.rollNo || '');
                }}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold"
              >
                View Marks
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleDeleteResult(res.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Publish Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                Publish Student Result
              </h3>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Code
                  </label>
                  <input
                    type="text"
                    value={formRollCode}
                    onChange={(e) => setFormRollCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formRollNo}
                    onChange={(e) => setFormRollNo(e.target.value)}
                    placeholder="0015"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Subject Marks Entry
                </label>
                {formMarks.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 w-28 truncate">
                      {sub.subject}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={sub.marks}
                      onChange={(e) => {
                        const updated = [...formMarks];
                        updated[idx].marks = Number(e.target.value);
                        setFormMarks(updated);
                      }}
                      className="w-20 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                    />
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                ))}
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
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
