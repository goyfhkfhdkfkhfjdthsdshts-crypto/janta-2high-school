'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  FileSpreadsheet,
  Trash2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { AdminAuditLog, ReportedSafetyItem, UserProfile } from '@/lib/types';

interface AdminAuditViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  onBack: () => void;
  language: 'hi' | 'en';
}

export function AdminAuditView({ user, isAdmin, onBack, language }: AdminAuditViewProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [reports, setReports] = useState<ReportedSafetyItem[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'safety'>('audit');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchAuditData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, safetyRes] = await Promise.all([
        fetch('/api/admin/audit'),
        fetch('/api/safety'),
      ]);

      const logsData = await logsRes.json();
      const safetyData = await safetyRes.json();

      if (logsData.success && logsData.logs) {
        setLogs(logsData.logs);
      }
      if (safetyData.success && safetyData.reports) {
        setReports(safetyData.reports);
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const jsonStr = JSON.stringify(data.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `janta_high_school_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting database backup:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateReport = async (reportId: string, status: 'action_taken' | 'dismissed' | 'reviewed') => {
    try {
      const res = await fetch('/api/safety', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status,
          actionNote: `Marked ${status} by admin on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error('Error updating report status:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-4 max-w-md mx-auto my-12">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {language === 'hi' ? 'प्रबंधन अनुमति आवश्यक है' : 'Admin Access Required'}
        </h2>
        <p className="text-xs text-slate-500">
          {language === 'hi'
            ? 'ऑडिट लॉग और बैकअप केवल अधिकृत विद्यालय प्रशासकों एवं शिक्षकों के लिए हैं।'
            : 'Audit logs and database exports are restricted to authorized school administrators.'}
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
        >
          {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
        </button>
      </div>
    );
  }

  const filteredLogs = logs.filter(
    (l) =>
      !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'hi' ? 'वापस' : 'Back to Settings'}</span>
            </button>
            <button
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95 disabled:bg-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting
                  ? language === 'hi' ? 'डाउनलोड हो रहा है...' : 'Downloading...'
                  : language === 'hi' ? 'पूरा डेटा बैकअप लें (JSON)' : 'Export Backup (JSON)'}
              </span>
            </button>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi' ? 'प्रबंधन ऑडिट लॉग एवं सुरक्षा केंद्र' : 'Admin Audit Logs & Safety Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              {language === 'hi'
                ? 'सभी नोटिस, रिजल्ट, उपस्थिति और प्रश्नों में किए गए बदलावों का विस्तृत इतिहास।'
                : 'Accountability trail of all changes made to notices, marksheets, attendance, and study materials.'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'ऑडिट इतिहास' : 'Audit Logs'} ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'safety'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सुरक्षा रिपोर्ट' : 'Safety Reports'} ({reports.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'ऑडिट लॉग खोजें (नाम, क्रिया, विवरण)...' : 'Search audit records (actor, action, details)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          {/* Logs List */}
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-7 h-7 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading audit logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs">
              No audit records matching search.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {log.targetType}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.performedBy}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">
                      {log.details}
                    </p>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-bold text-slate-800">No inappropriate messages reported.</p>
              <p className="text-slate-500">Student community chat and classroom questions are clean.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rep.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : rep.status === 'action_taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.status.toUpperCase()}
                    </span>
                    <span className="text-slate-500">
                      Reported by: <strong className="text-slate-800">{rep.reportedBy}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rep.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-100 space-y-1">
                  <span className="text-[10px] font-bold text-red-600 block">
                    FLAGGED CONTENT (Author: {rep.senderName})
                  </span>
                  <p className="text-slate-800 font-medium italic">
                    &ldquo;{rep.messageContent}&rdquo;
                  </p>
                  <p className="text-[11px] text-red-700">
                    <strong>Reason given:</strong> {rep.reason}
                  </p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1 justify-end">
                    <button
                      onClick={() => handleUpdateReport(rep.id, 'dismissed')}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Dismiss (खारिज करें)
                    </button>
                    <button
                      onClick={() => handleUpdateReport(rep.id, 'action_taken')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Resolve & Action Taken
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
