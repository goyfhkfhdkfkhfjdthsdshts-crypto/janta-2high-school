'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  SchoolClass,
  AttendanceRecord,
  StudentAttendanceSummary,
} from '@/lib/types';
import {
  Mic,
  MicOff,
  CheckCircle2,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Search,
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Shield,
  Edit3,
  Volume2,
  Check,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  Info,
  WifiOff,
  Lock,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';

interface OnlineAttendanceViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass: (c: SchoolClass) => void;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function OnlineAttendanceView({
  user,
  isAdmin,
  selectedClass,
  onSelectClass,
  onOpenAdminModal,
  language,
}: OnlineAttendanceViewProps) {
  // Navigation tabs within Attendance section
  const [activeTab, setActiveTab] = useState<'mark' | 'history' | 'teacher_admin'>('mark');

  // Input methods & voice recognition state
  const [entryMethod, setEntryMethod] = useState<'voice' | 'manual'>('voice');
  const [typedName, setTypedName] = useState(user?.name || '');
  const [detectedName, setDetectedName] = useState(user?.name || '');
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Submission & validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<AttendanceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Student summary & history
  const [studentSummary, setStudentSummary] = useState<StudentAttendanceSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Teacher / Admin Dashboard state
  const [adminDate, setAdminDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [adminClass, setAdminClass] = useState<SchoolClass>(selectedClass);
  const [classSummary, setClassSummary] = useState<any | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [isLoadingClassSummary, setIsLoadingClassSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'daily' | 'monthly'>('daily');
  const [dailyViewFilter, setDailyViewFilter] = useState<'all' | 'present' | 'absent'>('all');

  // Admin correction modal state
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [correctionStatus, setCorrectionStatus] = useState<'Present' | 'Absent'>('Present');
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Real date & time formatted for display
  const todayDateObj = new Date();
  const formattedTodayDate = todayDateObj.toLocaleDateString(
    language === 'hi' ? 'hi-IN' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
  const todayISODate = todayDateObj.toISOString().split('T')[0];

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update default names when user profile loads
  useEffect(() => {
    if (user?.name) {
      setTypedName((prev) => (prev ? prev : user.name));
      setDetectedName((prev) => (prev ? prev : user.name));
    }
  }, [user?.name]);

  // Load student attendance summary
  const loadStudentSummary = useCallback(async () => {
    if (!user) return;
    setIsLoadingSummary(true);
    try {
      const res = await fetch(
        `/api/attendance?mode=student&studentId=${encodeURIComponent(user.id)}&studentEmail=${encodeURIComponent(user.email)}&class=${selectedClass}&date=${todayISODate}`
      );
      const data = await res.json();
      if (data.success && data.summary) {
        setStudentSummary(data.summary);
        if (data.summary.todayRecord) {
          setSubmissionSuccess(data.summary.todayRecord);
        }
      }
    } catch (err) {
      console.error('Error loading attendance summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [user, selectedClass, todayISODate]);

  useEffect(() => {
    loadStudentSummary();
  }, [loadStudentSummary]);

  // Load Class summary for Teacher/Admin Dashboard
  const loadClassSummary = useCallback(async () => {
    setIsLoadingClassSummary(true);
    try {
      const res = await fetch(
        `/api/attendance?mode=class&class=${adminClass}&date=${adminDate}`
      );
      const data = await res.json();
      if (data.success && data.summary) {
        setClassSummary(data.summary);
      }

      // Also fetch monthly report
      const repRes = await fetch(
        `/api/attendance?mode=report&class=${adminClass}&month=${adminDate.slice(0, 7)}`
      );
      const repData = await repRes.json();
      if (repData.success && repData.report) {
        setMonthlyReport(repData.report);
      }
    } catch (err) {
      console.error('Error loading class attendance summary:', err);
    } finally {
      setIsLoadingClassSummary(false);
    }
  }, [adminClass, adminDate]);

  useEffect(() => {
    if (activeTab === 'teacher_admin') {
      loadClassSummary();
    }
  }, [activeTab, loadClassSummary]);

  // Initialize Web Speech Recognition
  const startVoiceRecognition = () => {
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन समर्थित नहीं है। कृपया नाम टाइप करें।'
          : 'Voice recognition is not supported in this browser. Please type your name.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        transcript = transcript.trim();
        if (transcript) {
          // Clean up transcript
          const cleaned = transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          setDetectedName(cleaned);
          setTypedName(cleaned);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            language === 'hi'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया माइक्रोफ़ोन की अनुमति दें या नाम टाइप करें।'
              : 'Microphone permission denied. Please allow microphone access or type your name.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError(
            language === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें।'
              : 'No speech detected. Please speak clearly.'
          );
        } else {
          setSpeechError(
            language === 'hi'
              ? 'आवाज़ पहचानने में समस्या आई। कृपया पुनः प्रयास करें या नाम टाइप करें।'
              : 'Voice recognition issue. Please retry or type your name.'
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError(
        language === 'hi'
          ? 'माइक्रोफ़ोन शुरू नहीं हो सका। कृपया नाम टाइप करें।'
          : 'Could not access microphone. Please type your name.'
      );
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Active today record: from current submission or from database summary
  const activeTodayRecord =
    submissionSuccess ||
    (studentSummary?.todayRecord && studentSummary.todayRecord.status === 'Present'
      ? studentSummary.todayRecord
      : null);

  const isAlreadyMarkedToday = Boolean(activeTodayRecord);

  // Submit and Mark Attendance
  const handleMarkAttendance = async () => {
    if (isOffline) {
      setErrorMessage(
        language === 'hi'
          ? 'डिवाइस ऑफ़लाइन है। उपस्थिति दर्ज करने के लिए इंटरनेट कनेक्शन आवश्यक है।'
          : 'Device is offline. An active internet connection is required to mark attendance.'
      );
      return;
    }

    if (!user) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया उपस्थिति दर्ज करने से पहले अपने गूगल खाते से लॉगिन करें।'
          : 'Please log in with your Google account before marking attendance.'
      );
      return;
    }

    // STRICT GUARD: One attendance per authenticated student account per day
    if (isAlreadyMarkedToday && activeTodayRecord) {
      setErrorMessage('आज आपकी Attendance पहले ही लग चुकी है।');
      return;
    }

    const finalName = detectedName.trim() || typedName.trim() || user.name;
    if (!finalName) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया विद्यार्थी का नाम दर्ज करें या बोलें।'
          : 'Please speak or enter the student name.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      const clientTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // The student's Google account ID is the authoritative identity used for attendance
      const payload = {
        studentId: user.id,
        studentEmail: user.email,
        studentName: user.name, // Authenticated verified student name
        spokenOrEnteredName: finalName,
        class: selectedClass,
        rollNo: user.rollNo || '',
        date: todayISODate,
        time: clientTime,
        method: entryMethod,
      };

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.code === 'ALREADY_MARKED') {
          // Already marked for today: Set record and display the exact required message
          if (data.record) {
            setSubmissionSuccess(data.record);
          }
          setErrorMessage('आज आपकी Attendance पहले ही लग चुकी है।');
        } else {
          setErrorMessage(data.message || 'Failed to mark attendance. Please retry.');
        }
        return;
      }

      // Success!
      setSubmissionSuccess(data.record);
      setErrorMessage(null);
      loadStudentSummary();
    } catch (err) {
      console.error('Attendance submission error:', err);
      setErrorMessage(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया इंटरनेट जांचें और पुनः प्रयास करें।'
          : 'Failed to communicate with server. Please check internet connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin: Mark Absent Student Present directly
  const handleAdminMarkPresent = async (student: any) => {
    try {
      const now = new Date();
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          studentEmail: student.email,
          studentName: student.name,
          spokenOrEnteredName: student.name,
          class: adminClass,
          rollNo: student.rollNo,
          date: adminDate,
          time: now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          method: 'admin_override',
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadClassSummary();
      } else {
        alert(data.message || 'Could not mark attendance');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin: Save correction
  const handleSaveCorrection = async () => {
    if (!editingRecord) return;
    setIsSavingCorrection(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRecord.id,
          status: correctionStatus,
          remarks: correctionRemarks,
          adminName: user?.name || 'Administrator',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingRecord(null);
        loadClassSummary();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCorrection(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (!classSummary) return;

    const rows = [
      ['JANTA +2 HIGH SCHOOL - KHALARI, RANCHI'],
      [`OFFICIAL ATTENDANCE REPORT - CLASS ${adminClass}`],
      [`Date: ${adminDate}`],
      [''],
      ['Roll No', 'Student Name', 'Status', 'Time Checked In', 'Method', 'Verified By', 'Remarks'],
    ];

    classSummary.presentStudents.forEach((r: AttendanceRecord) => {
      rows.push([
        r.rollNo || '-',
        `"${r.studentName}"`,
        'Present',
        r.time,
        r.method || 'manual',
        r.verifiedBy || 'google_auth',
        `"${r.remarks || ''}"`,
      ]);
    });

    classSummary.absentStudents.forEach((s: any) => {
      rows.push([
        s.rollNo || '-',
        `"${s.name}"`,
        'Absent',
        '-',
        '-',
        '-',
        `"${s.remarks || 'Not marked'}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `janta_school_attendance_class${adminClass}_${adminDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter daily students for Teacher dashboard
  const presentList = classSummary?.presentStudents || [];
  const absentList = classSummary?.absentStudents || [];

  const filteredPresent = presentList.filter((s: AttendanceRecord) =>
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo && s.rollNo.includes(searchQuery))
  );

  const filteredAbsent = absentList.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.rollNo && s.rollNo.includes(searchQuery))
  );

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-900 rounded-2xl p-3 sm:p-4 flex items-center gap-3 animate-in fade-in">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            <p className="font-bold">
              {language === 'hi' ? 'इंटरनेट कनेक्शन नहीं है (Offline)' : 'Device is Offline'}
            </p>
            <p className="text-amber-800 text-[11px] sm:text-xs">
              {language === 'hi'
                ? 'उपस्थिति केवल सक्रिय सर्वर कनेक्शन के साथ ही दर्ज होगी। कृपया इंटरनेट चालू करें।'
                : 'Attendance can only be recorded with an active internet connection.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Top Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-blue-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/50 border border-blue-500/30 text-blue-200 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'hi'
                  ? 'डिजिटल उपस्थिति प्रणाली • 2026'
                  : 'Official Online Attendance • 2026'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'hi' ? 'ऑनलाइन उपस्थिति (Online Attendance)' : 'ONLINE ATTENDANCE'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              Janta +2 High School – Khalari, Ranchi • JAC Board
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 bg-blue-950/60 p-1.5 rounded-2xl border border-blue-800/80 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('mark')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'mark'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              {language === 'hi' ? 'उपस्थिति दर्ज करें' : 'Mark Attendance'}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900/50'
              }`}
            >
              {language === 'hi' ? 'मेरा रिकॉर्ड' : 'My History'}
            </button>

            <button
              onClick={() => {
                if (!isAdmin) {
                  onOpenAdminModal();
                } else {
                  setActiveTab('teacher_admin');
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'teacher_admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-300 hover:text-white hover:bg-amber-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'शिक्षक / एडमिन' : 'Teacher/Admin'}</span>
            </button>
          </div>
        </div>

        {/* Real Today Info Strip */}
        <div className="mt-5 pt-4 border-t border-blue-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-semibold">Today&apos;s Date</p>
              <p className="font-bold text-white truncate">{formattedTodayDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-semibold">Registered Student</p>
              <p className="font-bold text-white truncate">{user?.name || 'Guest'}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-blue-800/40 px-3 py-1.5 rounded-xl border border-blue-700/50">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isAlreadyMarkedToday ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <div>
              <p className="text-[10px] text-blue-300 uppercase font-semibold">
                {isAlreadyMarkedToday ? 'Class (Locked for Today)' : 'Class Assigned'}
              </p>
              <p className="font-extrabold text-white flex items-center gap-1">
                <span>
                  Class {isAlreadyMarkedToday && activeTodayRecord ? activeTodayRecord.class : selectedClass}
                </span>
                {isAlreadyMarkedToday && <Lock className="w-3 h-3 text-amber-300" />}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MARK ATTENDANCE (STUDENT WORKFLOW) */}
      {/* ======================================================== */}
      {activeTab === 'mark' && (
        <div className="space-y-4">
          {/* If already marked today, show the official "आज आपकी Attendance पहले ही लग चुकी है।" Card */}
          {isAlreadyMarkedToday && activeTodayRecord && (
            <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-500 shadow-md animate-in fade-in space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>1 Record Per Day Enforced</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                      <Lock className="w-3 h-3 text-blue-600" />
                      <span>Google ID Identity Locked</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <span>आज आपकी Attendance पहले ही लग चुकी है।</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your attendance for today ({activeTodayRecord.date}) is permanently recorded in the school database for your Google account.
                  </p>
                </div>
              </div>

              {/* 5 REQUIRED FIELDS DISPLAY */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {/* 1. Student Name */}
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Student Name
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5 truncate">
                    {activeTodayRecord.studentName}
                  </p>
                </div>

                {/* 2. Class */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Class
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                    Class {activeTodayRecord.class}
                  </p>
                </div>

                {/* 3. Attendance Date */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Attendance Date
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                    {activeTodayRecord.date}
                  </p>
                </div>

                {/* 4. Attendance Time */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Attendance Time
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                    {activeTodayRecord.time}
                  </p>
                </div>

                {/* 5. Status: Present */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status
                  </span>
                  <p className="mt-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-600 text-white shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Present</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Security & Verification Metadata */}
              <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="font-medium">
                    Google Identity: <span className="font-mono text-slate-900 font-bold">{user?.email || activeTodayRecord.studentEmail}</span>
                  </span>
                </div>
                <div className="text-[11px] text-blue-800">
                  Record ID: <span className="font-mono font-bold">{activeTodayRecord.id}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="text-slate-500 text-[11px]">
                  🔒 Unique Constraint Enforced: Student Account ID + Attendance Date. Only 1 attendance allowed per day.
                </span>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>View Monthly Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Attendance Form (Disabled if already marked today, Interactive if not yet marked) */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>
                    {language === 'hi' ? 'दैनिक उपस्थिति दर्ज करें' : "Mark Today's Attendance"}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isAlreadyMarkedToday
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span>Class {isAlreadyMarkedToday && activeTodayRecord ? activeTodayRecord.class : selectedClass}</span>
                    {isAlreadyMarkedToday && <Lock className="w-3 h-3 text-amber-700" />}
                  </span>
                </h2>

                {isAlreadyMarkedToday && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Locked for Today</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {isAlreadyMarkedToday
                  ? 'आपकी आज की उपस्थिति पहले ही दर्ज की जा चुकी है। नए नाम या वर्ग के साथ दूसरा रिकॉर्ड अनुमति नहीं है।'
                  : language === 'hi'
                  ? 'कृपया बोलकर या टाइप करके अपना नाम दर्ज करें और पुष्टि करें।'
                  : 'Speak or enter your name, verify the detected text, then confirm to mark presence.'}
              </p>
            </div>

            {/* Error / Notice Display */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-black text-sm text-amber-900">{errorMessage}</p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      एक छात्र खाते के लिए प्रतिदिन केवल एक ही उपस्थिति मान्य है। (Only 1 attendance per student account per day).
                    </p>
                  </div>
                </div>

                {/* Always show the 5 fields if activeTodayRecord exists */}
                {activeTodayRecord && (
                  <div className="bg-white/90 p-3 rounded-xl border border-amber-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Student Name</span>
                      <span className="font-extrabold text-slate-900 truncate block">{activeTodayRecord.studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Class</span>
                      <span className="font-extrabold text-slate-900">Class {activeTodayRecord.class}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Attendance Date</span>
                      <span className="font-extrabold text-slate-900">{activeTodayRecord.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Attendance Time</span>
                      <span className="font-extrabold text-slate-900">{activeTodayRecord.time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[9px]">Status</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">Present</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Anti-Proxy / Identity Security Protection Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">
                  प्रमाणीकृत गूगल खाता सुरक्षा (Google Account Identity Security)
                </p>
                <p className="text-[11px] text-slate-500">
                  उपस्थिति आपके पंजीकृत गूगल खाते (<span className="font-semibold text-slate-800">{user?.email || 'Logged in account'}</span>) से जुड़ी है। किसी अन्य छात्र के नाम से या किसी अन्य वर्ग में उपस्थिति दर्ज करना प्रतिबंधित है।
                </p>
              </div>
            </div>

            {/* Method Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl max-w-sm">
              <button
                disabled={isAlreadyMarkedToday}
                onClick={() => {
                  if (isAlreadyMarkedToday) return;
                  setEntryMethod('voice');
                  setSpeechError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isAlreadyMarkedToday
                    ? 'opacity-60 cursor-not-allowed text-slate-400'
                    : entryMethod === 'voice'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-blue-700" />
                <span>नाम बोलकर (Voice)</span>
                {isAlreadyMarkedToday && <Lock className="w-3 h-3 text-slate-400" />}
              </button>

              <button
                disabled={isAlreadyMarkedToday}
                onClick={() => {
                  if (isAlreadyMarkedToday) return;
                  setEntryMethod('manual');
                  stopVoiceRecognition();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isAlreadyMarkedToday
                    ? 'opacity-60 cursor-not-allowed text-slate-400'
                    : entryMethod === 'manual'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-700" />
                <span>टाइप करके (Manual)</span>
                {isAlreadyMarkedToday && <Lock className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            {/* METHOD 1: VOICE ATTENDANCE */}
            {entryMethod === 'voice' && (
              <div
                className={`rounded-3xl p-5 sm:p-6 border text-center space-y-4 ${
                  isAlreadyMarkedToday
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-gradient-to-b from-blue-50/70 to-indigo-50/40 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-blue-700" />
                    <span>वॉइस उपस्थिति पहचान (Voice Attendance)</span>
                  </span>

                  {/* Language selector for speech */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-blue-200 text-[11px] font-semibold text-slate-700">
                    <span>भाषा:</span>
                    <button
                      disabled={isAlreadyMarkedToday}
                      onClick={() => setSpeechLang('hi-IN')}
                      className={`px-1.5 py-0.5 rounded-md ${
                        speechLang === 'hi-IN' ? 'bg-blue-700 text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      हिंदी
                    </button>
                    <button
                      disabled={isAlreadyMarkedToday}
                      onClick={() => setSpeechLang('en-IN')}
                      className={`px-1.5 py-0.5 rounded-md ${
                        speechLang === 'en-IN' ? 'bg-blue-700 text-white' : 'hover:bg-slate-100'
                      }`}
                    >
                      EN / Hinglish
                    </button>
                  </div>
                </div>

                {/* Pulsing Mic Button (Disabled if already marked today) */}
                <div className="py-2 flex flex-col items-center justify-center">
                  <button
                    disabled={isAlreadyMarkedToday}
                    onClick={
                      isAlreadyMarkedToday
                        ? () => setErrorMessage('आज आपकी Attendance पहले ही लग चुकी है।')
                        : isListening
                        ? stopVoiceRecognition
                        : startVoiceRecognition
                    }
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all ${
                      isAlreadyMarkedToday
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : isListening
                        ? 'bg-red-600 text-white shadow-xl scale-105 ring-8 ring-red-200 animate-pulse'
                        : 'bg-blue-700 hover:bg-blue-800 text-white shadow-lg hover:scale-105 active:scale-95'
                    }`}
                    title={
                      isAlreadyMarkedToday
                        ? 'आज आपकी Attendance पहले ही लग चुकी है'
                        : isListening
                        ? 'Stop listening'
                        : 'Start speaking name'
                    }
                  >
                    {isAlreadyMarkedToday ? (
                      <Lock className="w-8 h-8 text-slate-500" />
                    ) : isListening ? (
                      <MicOff className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce" />
                    ) : (
                      <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                    )}
                  </button>

                  <p className="mt-3 text-xs sm:text-sm font-bold text-slate-800">
                    {isAlreadyMarkedToday ? (
                      <span className="text-slate-500 flex items-center gap-1 justify-center">
                        <Lock className="w-3.5 h-3.5" />
                        <span>उपस्थिति आज दर्ज हो चुकी है (Voice Attendance Locked)</span>
                      </span>
                    ) : isListening ? (
                      <span className="text-red-600 animate-pulse">
                        🔴 सुन रहा हूँ... कृपया अपना नाम बोलें (Listening...)
                      </span>
                    ) : (
                      <span>[ 🎤 नाम बोलकर Attendance ]</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAlreadyMarkedToday
                      ? 'आज के लिए उपस्थिति पहले ही सुरक्षित की जा चुकी है।'
                      : 'Supports Hindi, English, and Hinglish speech recognition.'}
                  </p>
                </div>

                {speechError && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                    {speechError}
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: MANUAL ENTRY */}
            {entryMethod === 'manual' && (
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    विद्यार्थी का नाम दर्ज करें (Enter Student Name):
                  </label>
                  {isAlreadyMarkedToday && (
                    <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Locked to Registered Account</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  disabled={isAlreadyMarkedToday}
                  readOnly={isAlreadyMarkedToday}
                  value={
                    isAlreadyMarkedToday && activeTodayRecord
                      ? activeTodayRecord.studentName
                      : typedName
                  }
                  onChange={(e) => {
                    if (isAlreadyMarkedToday) return;
                    setTypedName(e.target.value);
                    setDetectedName(e.target.value);
                  }}
                  placeholder="Type student name (e.g. Amit Kumar Singh)"
                  className={`w-full px-4 py-3 rounded-2xl border text-slate-900 font-bold text-sm transition-all ${
                    isAlreadyMarkedToday
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-white border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent'
                  }`}
                />
                <p className="text-[11px] text-slate-500">
                  {isAlreadyMarkedToday
                    ? '🔒 You cannot submit another name. Attendance is already recorded.'
                    : `Logged in account: ${user?.email}`}
                </p>
              </div>
            )}

            {/* DETECTED NAME DISPLAY BOX */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                  <span>Detected Name (पहचाना गया नाम):</span>
                </span>
                <span className="text-[10px] text-blue-700 font-semibold">
                  {isAlreadyMarkedToday ? '🔒 Verified & Recorded' : 'Must verify before confirming'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-300 shadow-xs flex items-center justify-between gap-3">
                <input
                  type="text"
                  disabled={isAlreadyMarkedToday}
                  readOnly={isAlreadyMarkedToday}
                  value={
                    isAlreadyMarkedToday && activeTodayRecord
                      ? activeTodayRecord.studentName
                      : detectedName
                  }
                  onChange={(e) => {
                    if (isAlreadyMarkedToday) return;
                    setDetectedName(e.target.value);
                  }}
                  className={`w-full font-black text-base sm:text-lg bg-transparent focus:outline-hidden ${
                    isAlreadyMarkedToday
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-900'
                  }`}
                  placeholder="Student Name will appear here"
                />
                <span className="shrink-0 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md flex items-center gap-1">
                  <span>Class {isAlreadyMarkedToday && activeTodayRecord ? activeTodayRecord.class : selectedClass}</span>
                  {isAlreadyMarkedToday && <Lock className="w-2.5 h-2.5 text-emerald-700" />}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                {isAlreadyMarkedToday
                  ? '🔒 Attendance is already marked and locked for this student account on today&apos;s date.'
                  : '* Verify your name above. Click &apos;Confirm & Mark Attendance&apos; below. Attendance is never marked automatically.'}
              </p>
            </div>

            {/* ACTION BUTTON (Disabled if already marked today, Active if not yet marked) */}
            {isAlreadyMarkedToday ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={true}
                  onClick={() => {
                    setErrorMessage('आज आपकी Attendance पहले ही लग चुकी है।');
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-slate-200 border-2 border-slate-300 text-slate-500 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-not-allowed shadow-none select-none"
                >
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span>[ 🔒 Mark Attendance (Disabled - आज आपकी Attendance पहले ही लग चुकी है) ]</span>
                </button>
                <p className="text-center text-[11px] font-semibold text-slate-500">
                  “आज आपकी Attendance पहले ही लग चुकी है।” (Strict single-attendance security enforced)
                </p>
              </div>
            ) : (
              <button
                onClick={handleMarkAttendance}
                disabled={isSubmitting || isOffline}
                className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                  isSubmitting || isOffline
                    ? 'bg-slate-400 cursor-not-allowed opacity-75'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-600/30'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>उपस्थिति दर्ज हो रही है (Verifying & Marking)...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[3px]" />
                    <span>[ ✓ Confirm &amp; Mark Attendance ]</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Attendance Stats Card for Student */}
          {studentSummary && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Today&apos;s Status</p>
                <p
                  className={`text-sm sm:text-base font-black mt-1 ${
                    studentSummary.todayStatus === 'Present'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {studentSummary.todayStatus === 'Present' ? '✓ Present' : '⏳ Pending'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total School Days</p>
                <p className="text-sm sm:text-base font-black text-slate-800 mt-1">
                  {studentSummary.totalSchoolDays} Days
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Present Count</p>
                <p className="text-sm sm:text-base font-black text-blue-700 mt-1">
                  {studentSummary.presentDays} Days
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-[10px] uppercase font-bold text-blue-600">Monthly Percentage</p>
                <p className="text-sm sm:text-base font-black text-blue-900 mt-1">
                  {studentSummary.attendancePercentage}%
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STUDENT ATTENDANCE HISTORY */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {language === 'hi' ? 'मेरी उपस्थिति का इतिहास' : 'Student Attendance History'}
              </h2>
              <p className="text-xs text-slate-500">
                Verified records for {user?.name || 'Student'} • Class {selectedClass}
              </p>
            </div>
            <button
              onClick={loadStudentSummary}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingSummary ? 'animate-spin text-blue-700' : ''}`}
              />
            </button>
          </div>

          {/* Monthly percentage progress bar */}
          {studentSummary && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Monthly Attendance Rate</span>
                <span className="text-blue-700 font-extrabold text-sm">
                  {studentSummary.attendancePercentage}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${studentSummary.attendancePercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-right">
                {studentSummary.presentDays} of {studentSummary.totalSchoolDays} working days present
              </p>
            </div>
          )}

          {/* List of past attendance records */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Past Attendance Records
            </h3>

            {studentSummary?.history && studentSummary.history.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {studentSummary.history.map((rec) => (
                  <div key={rec.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm">{rec.date}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{rec.time}</span>
                          <span>•</span>
                          <span className="capitalize">{rec.method} Check-in</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No past attendance records found for this account.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TEACHER & ADMIN DASHBOARD */}
      {/* ======================================================== */}
      {activeTab === 'teacher_admin' && (
        <div className="space-y-4">
          {/* Controls Bar: Class selector, Date picker, Subtabs */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span>
                    {language === 'hi'
                      ? 'शिक्षक एवं एडमिन उपस्थिति प्रबंधन'
                      : 'Teacher & Admin Attendance Dashboard'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Full class attendance rosters, daily auditing &amp; monthly reports
                </p>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              {/* Class Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Select Class:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setAdminClass(c)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        adminClass === c
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Select */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Attendance Date:
                </label>
                <input
                  type="date"
                  value={adminDate}
                  onChange={(e) => setAdminDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Sub-tab view: Daily or Monthly */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  View Mode:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setAdminSubTab('daily')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      adminSubTab === 'daily'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Daily Roster
                  </button>
                  <button
                    onClick={() => setAdminSubTab('monthly')}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      adminSubTab === 'monthly'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Monthly Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metric KPI cards */}
          {classSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</p>
                <p className="text-xl font-black text-slate-800 mt-1">
                  {classSummary.totalEnrolled}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-xs">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Present Today</p>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  {classSummary.presentCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-red-200 bg-red-50/30 shadow-xs">
                <p className="text-[10px] font-bold text-red-600 uppercase">Absent Today</p>
                <p className="text-xl font-black text-red-700 mt-1">
                  {classSummary.absentCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-blue-200 bg-blue-50/30 shadow-xs">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Attendance Rate</p>
                <p className="text-xl font-black text-blue-900 mt-1">
                  {classSummary.percentage}%
                </p>
              </div>
            </div>
          )}

          {/* DAILY ROSTER VIEW */}
          {adminSubTab === 'daily' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student by name or roll..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setDailyViewFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      dailyViewFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    All ({classSummary?.totalEnrolled || 0})
                  </button>
                  <button
                    onClick={() => setDailyViewFilter('present')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      dailyViewFilter === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700'
                    }`}
                  >
                    Present ({classSummary?.presentCount || 0})
                  </button>
                  <button
                    onClick={() => setDailyViewFilter('absent')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      dailyViewFilter === 'absent'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-red-700'
                    }`}
                  >
                    Absent ({classSummary?.absentCount || 0})
                  </button>
                </div>
              </div>

              {/* PRESENT STUDENTS LIST */}
              {(dailyViewFilter === 'all' || dailyViewFilter === 'present') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Present Students ({filteredPresent.length})</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">Verified Presence</span>
                  </div>

                  {filteredPresent.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {filteredPresent.map((rec: AttendanceRecord) => (
                        <div
                          key={rec.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {rec.rollNo || '•'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-snug">
                                {rec.studentName}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Time: <span className="font-medium text-slate-700">{rec.time}</span> •{' '}
                                <span className="capitalize">{rec.method}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Present
                            </span>
                            {/* Admin edit button */}
                            <button
                              onClick={() => {
                                setEditingRecord(rec);
                                setCorrectionStatus(rec.status);
                                setCorrectionRemarks(rec.remarks || '');
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                              title="Correct Record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 italic">
                      No present students found matching query.
                    </p>
                  )}
                </div>
              )}

              {/* ABSENT STUDENTS LIST */}
              {(dailyViewFilter === 'all' || dailyViewFilter === 'absent') && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-red-800 bg-red-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <UserX className="w-4 h-4 text-red-600" />
                      <span>Absent Students ({filteredAbsent.length})</span>
                    </span>
                    <span className="text-[11px] text-red-700">Not Marked</span>
                  </div>

                  {filteredAbsent.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {filteredAbsent.map((student: any) => (
                        <div
                          key={student.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {student.rollNo || '•'}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-snug">
                                {student.name}
                              </p>
                              <p className="text-[11px] text-slate-400">{student.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800">
                              Absent
                            </span>
                            {/* Quick Teacher Action: Mark Present */}
                            <button
                              onClick={() => handleAdminMarkPresent(student)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[10px] transition-colors"
                              title="Mark Present with Teacher Override"
                            >
                              + Mark Present
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 italic">
                      No absent students for this class today.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MONTHLY REPORT VIEW */}
          {adminSubTab === 'monthly' && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Monthly Class Attendance Summary (Class {adminClass})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive attendance percentage per enrolled student
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Month: {adminDate.slice(0, 7)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Roll</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3 text-center">Present Days</th>
                      <th className="py-2.5 px-3 text-center">Total Days</th>
                      <th className="py-2.5 px-3 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyReport.map((item) => (
                      <tr key={item.studentId} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                          {item.rollNo}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{item.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                          {item.presentDays}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{item.totalDays}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                              item.percentage >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.percentage >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN CORRECTION MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-700" />
              <span>Correct Attendance Record</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-extrabold text-slate-800">{editingRecord.studentName}</p>
              <p className="text-slate-500">
                Class {editingRecord.class} • Date: {editingRecord.date} • Recorded:{' '}
                {editingRecord.time}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCorrectionStatus('Present')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      correctionStatus === 'Present'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Present (उपस्थित)
                  </button>
                  <button
                    onClick={() => setCorrectionStatus('Absent')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      correctionStatus === 'Absent'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Absent (अनुपस्थित)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Correction Remark / Reason:
                </label>
                <input
                  type="text"
                  value={correctionRemarks}
                  onChange={(e) => setCorrectionRemarks(e.target.value)}
                  placeholder="e.g. Authorized by Principal / Medical leave"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                disabled={isSavingCorrection}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                {isSavingCorrection ? 'Saving...' : 'Save Correction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
