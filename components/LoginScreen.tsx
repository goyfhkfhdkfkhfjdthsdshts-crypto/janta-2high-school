'use client';

import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, SchoolClass, UserRole } from '@/lib/types';
import {
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  User,
  KeyRound,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Building2,
  Users,
  RotateCw,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('10');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Student Registration Modal / Mode
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    selectedClass: '10' as SchoolClass,
    section: 'A',
    rollNo: '',
    password: '',
    confirmPassword: '',
    stream: 'General' as 'Science' | 'Commerce' | 'Arts' | 'General',
    phone: '',
    studentId: '',
  });

  // Help Modal
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Role details config
  const roleConfig: Record<
    UserRole,
    { title: string; subtitle: string; idLabel: string; placeholder: string; defaultId: string }
  > = {
    student: {
      title: 'Student Portal',
      subtitle: 'Sign in with your Student ID or Roll Number',
      idLabel: 'Student ID or Roll Number',
      placeholder: 'e.g. 1001 or std-10-1',
      defaultId: '1001',
    },
    teacher: {
      title: 'Teacher Portal',
      subtitle: 'Sign in with your assigned Faculty ID',
      idLabel: 'Teacher ID',
      placeholder: 'e.g. TCH-101',
      defaultId: 'TCH-101',
    },
    parent: {
      title: 'Parent Portal',
      subtitle: 'Monitor your ward’s attendance, homework & progress',
      idLabel: 'Parent ID / Ward Roll',
      placeholder: 'e.g. PRT-1001',
      defaultId: 'PRT-1001',
    },
    admin: {
      title: 'Administrator Portal',
      subtitle: 'Access school database and administrative management',
      idLabel: 'Admin ID',
      placeholder: 'e.g. ADM-001 or admin',
      defaultId: 'ADM-001',
    },
    principal: {
      title: 'Principal Desk',
      subtitle: 'Executive oversight, school notices & academic monitoring',
      idLabel: 'Principal ID',
      placeholder: 'e.g. PRN-001',
      defaultId: 'PRN-001',
    },
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoginId('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('Please enter both Login ID and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Network availability pre-check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('Internet connection problem. Please check your connection and try again.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          loginId: loginId.trim(),
          password: password.trim(),
          selectedClass: selectedRole === 'student' ? selectedClass : undefined,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }

      if (res.ok && data?.success && data?.user) {
        setSuccessMessage(`Login successful! Loading ${data.user.name}...`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 300);
      } else if (res.status === 401 || (data && !data.success)) {
        setErrorMessage(data?.message || 'Invalid Login ID or Password.');
      } else if (res.status === 503) {
        setErrorMessage('School database is temporarily unavailable. Please try again.');
      } else if (res.status >= 500) {
        setErrorMessage('School server is temporarily unavailable. Please try again.');
      } else {
        setErrorMessage(data?.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch {
      // Check if client is offline or in a static export deployment (e.g., GitHub Pages)
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setErrorMessage('Internet connection problem. Please check your connection and try again.');
      } else {
        // Fallback for static hosting / offline sync: check locally registered student accounts
        try {
          const registeredRaw = localStorage.getItem('janta_school_registered_students');
          if (registeredRaw) {
            const list: Array<UserProfile & { password?: string }> = JSON.parse(registeredRaw);
            const cleanInput = loginId.trim().toLowerCase();
            const found = list.find(
              (u) =>
                (u.id && u.id.toLowerCase() === cleanInput) ||
                (u.studentId && u.studentId.toLowerCase() === cleanInput) ||
                (u.loginId && u.loginId.toLowerCase() === cleanInput) ||
                (u.rollNo && u.rollNo.toLowerCase() === cleanInput)
            );
            if (found && (!found.password || found.password === password.trim())) {
              setSuccessMessage(`Login successful! Loading ${found.name}...`);
              setTimeout(() => {
                onLoginSuccess(found);
              }, 300);
              return;
            }
          }
        } catch {
          // Ignore parse errors
        }
        setErrorMessage('School server is temporarily unavailable. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.name.trim()) {
      setErrorMessage('Student Full Name is required.');
      return;
    }
    if (!registerData.rollNo.trim()) {
      setErrorMessage('Roll Number is required.');
      return;
    }
    if (!registerData.password) {
      setErrorMessage('Password is required.');
      return;
    }
    if (registerData.password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Network availability pre-check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setErrorMessage('Internet connection problem. Please check your connection and try again.');
      setIsLoading(false);
      return;
    }

    const cleanRoll = registerData.rollNo.trim();
    const cleanSection = (registerData.section || 'A').trim().toUpperCase();
    const generatedId =
      registerData.studentId.trim() ||
      `std-${registerData.selectedClass}-${cleanRoll.replace(/[^a-zA-Z0-9]/g, '')}`;

    const payload = {
      name: registerData.name.trim(),
      fullName: registerData.name.trim(),
      selectedClass: registerData.selectedClass,
      class: registerData.selectedClass,
      section: cleanSection,
      rollNo: cleanRoll,
      rollNumber: cleanRoll,
      studentId: generatedId,
      studentAccountId: generatedId,
      password: registerData.password,
      stream: registerData.stream,
      phone: registerData.phone.trim(),
      mobileNumber: registerData.phone.trim(),
    };

    try {
      // Connect to the real backend registration endpoint
      let res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // If /api/auth/register returned 404, fallback to /api/auth/profile
      if (res.status === 404) {
        res = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (res.ok && data?.success && data?.user) {
        setSuccessMessage('Account created successfully! Loading your student profile...');

        // Mirror to local student registry for offline resilience
        try {
          const registeredRaw = localStorage.getItem('janta_school_registered_students');
          const list: Array<UserProfile & { password?: string }> = registeredRaw
            ? JSON.parse(registeredRaw)
            : [];
          const idx = list.findIndex((u) => u.id === data.user.id || u.studentId === data.user.studentId);
          const studentEntry = { ...data.user, password: registerData.password };
          if (idx >= 0) {
            list[idx] = studentEntry;
          } else {
            list.push(studentEntry);
          }
          localStorage.setItem('janta_school_registered_students', JSON.stringify(list));
        } catch {
          // ignore localStorage error
        }

        // Authenticate session and redirect to Home/Dashboard
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 350);
        return;
      }

      // Specific Backend / Database Error Mapping (Requirement 2 & 4)
      if (res.status === 409 || data?.errorType === 'duplicate_id' || data?.errorType === 'duplicate_roll') {
        setErrorMessage(data?.message || 'This Student ID is already registered.');
      } else if (res.status === 503 || data?.errorType === 'database_error') {
        setErrorMessage('School database is temporarily unavailable. Please try again.');
      } else if (res.status === 400 || data?.errorType === 'validation' || data?.errorType === 'password_format') {
        setErrorMessage(data?.message || 'Please check the entered information.');
      } else if (data?.message) {
        setErrorMessage(data.message);
      } else if (res.status >= 500) {
        setErrorMessage('School server is temporarily unavailable. Please try again.');
      } else {
        setErrorMessage('Unable to register student account. Please check the entered information.');
      }
    } catch {
      // Network failure or static environment without Node server
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setErrorMessage('Internet connection problem. Please check your connection and try again.');
      } else {
        // Fallback for static hosting / GitHub Pages: save to persistent browser store
        const isStaticHost =
          typeof window !== 'undefined' &&
          (window.location.hostname.endsWith('github.io') ||
            window.location.protocol === 'file:' ||
            process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true');

        if (isStaticHost) {
          try {
            const registeredRaw = localStorage.getItem('janta_school_registered_students');
            const list: Array<UserProfile & { password?: string }> = registeredRaw
              ? JSON.parse(registeredRaw)
              : [];

            // Duplicate checks
            const duplicate = list.find(
              (u) =>
                (u.id && u.id.toLowerCase() === generatedId.toLowerCase()) ||
                (u.studentId && u.studentId.toLowerCase() === generatedId.toLowerCase())
            );
            if (duplicate) {
              setErrorMessage('This Student ID is already registered.');
              return;
            }

            const dupRoll = list.find(
              (u) =>
                u.selectedClass === registerData.selectedClass &&
                (u.section || 'A').toUpperCase() === cleanSection &&
                u.rollNo &&
                u.rollNo.trim().toLowerCase() === cleanRoll.toLowerCase()
            );
            if (dupRoll) {
              setErrorMessage(`A student with Roll No. ${cleanRoll} is already registered in Class ${registerData.selectedClass} Section ${cleanSection}.`);
              return;
            }

            const newLocalUser: UserProfile = {
              id: generatedId,
              studentAccountId: generatedId,
              studentId: generatedId,
              loginId: generatedId,
              name: registerData.name.trim(),
              email: `${generatedId.toLowerCase()}@student.janta.edu`,
              role: 'student',
              selectedClass: registerData.selectedClass,
              section: cleanSection,
              rollNo: cleanRoll,
              stream: registerData.stream,
              phone: registerData.phone.trim(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            list.push({ ...newLocalUser, password: registerData.password });
            localStorage.setItem('janta_school_registered_students', JSON.stringify(list));

            setSuccessMessage('Account created successfully! Loading your student profile...');
            setTimeout(() => {
              onLoginSuccess(newLocalUser);
            }, 350);
            return;
          } catch {
            setErrorMessage('School database is temporarily unavailable. Please try again.');
          }
        } else {
          setErrorMessage('School server is temporarily unavailable. Please try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-100 flex flex-col justify-between p-3 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Branding */}
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-6 pb-2 text-center">
        <SchoolLogo size={88} showText={false} className="mx-auto mb-2.5 drop-shadow-sm" />
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">
          Janta +2 High School
        </h1>
        <p className="text-xs sm:text-sm font-bold text-blue-800 tracking-wider uppercase mt-0.5">
          Khalari, Ranchi • Jharkhand
        </p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 border border-amber-200/80 rounded-full">
          <span className="text-[11px] font-semibold text-amber-800">
            शिक्षा • अनुशासन • सफलता
          </span>
        </div>
      </div>

      {/* Main Login / Registration Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-7 my-auto space-y-4">
        {/* VIEW 1: New Student Registration Form */}
        {isRegisterMode ? (
          <form onSubmit={handleRegisterStudent} className="space-y-3.5">
            <div className="text-center space-y-0.5 pb-2 border-b border-slate-100">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Permanent Student Registration
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Create Student Account
              </h2>
              <p className="text-xs text-slate-500">
                Register permanent JAC school credentials. Data persists permanently across sessions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="e.g. Rahul Soren"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerData.selectedClass}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      selectedClass: e.target.value as SchoolClass,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                >
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11 (+2)</option>
                  <option value="12">Class 12 (+2)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerData.section}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, section: e.target.value.toUpperCase() })
                  }
                  placeholder="A"
                  maxLength={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase text-center focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={registerData.rollNo}
                  onChange={(e) => setRegisterData({ ...registerData, rollNo: e.target.value })}
                  placeholder="e.g. 1015"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  placeholder="10 digits"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Set Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Min 4 chars"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2 text-xs text-red-700">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="font-semibold text-xs leading-snug">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleRegisterStudent(e)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-[11px] font-bold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create &amp; Save Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage(null);
                }}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* VIEW 2: Standard School Role Login */
          <>
            <div className="text-center space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {roleConfig[selectedRole].title}
              </h2>
              <p className="text-xs text-slate-500">
                {roleConfig[selectedRole].subtitle}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-5 p-1 bg-slate-100 rounded-2xl gap-0.5 text-center">
              {(
                [
                  { role: 'student', label: 'Student', icon: GraduationCap },
                  { role: 'teacher', label: 'Teacher', icon: UserCheck },
                  { role: 'parent', label: 'Parent', icon: Users },
                  { role: 'principal', label: 'Principal', icon: Building2 },
                  { role: 'admin', label: 'Admin', icon: ShieldCheck },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedRole === tab.role;
                return (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => handleRoleChange(tab.role)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Student Class Selector (if Student Role) */}
            {selectedRole === 'student' && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center">
                  Select Enrolled Class
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedClass(c)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedClass === c
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Class {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-2 text-xs text-red-700">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="font-semibold text-xs leading-snug">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e)}
                  disabled={isLoading}
                  className="px-2.5 py-1 text-[11px] font-bold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {roleConfig[selectedRole].idLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={roleConfig[selectedRole].placeholder}
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to {roleConfig[selectedRole].title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials & Registration Links */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-center">
              {selectedRole === 'student' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-blue-700 hover:underline font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>New Student? Create Permanent School Account →</span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-slate-500 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-blue-600" />
                  <span>Forgot Credentials / Help</span>
                </button>

                <span className="text-[10px] text-slate-400">
                  {selectedRole === 'student'
                    ? 'Default pass: Roll No.'
                    : selectedRole === 'teacher'
                    ? 'ID: TCH-101'
                    : selectedRole === 'principal'
                    ? 'ID: PRN-001'
                    : selectedRole === 'admin'
                    ? 'ID: ADM-001'
                    : 'ID: PRT-1001'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Security Info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Secure Cryptographic Auth
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            JAC Board
          </span>
        </div>
      </div>

      {/* Help & Support Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">School Login Help</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                <strong>Student Accounts:</strong> Enter your Class and Roll Number (e.g. Roll 1001) or permanent Student ID (e.g. std-10-1). Initial password is your Roll Number or <code>student123</code>.
              </p>
              <p>
                <strong>Staff &amp; Principal Accounts:</strong> Use your official school-assigned ID (e.g. TCH-101, PRN-001, ADM-001).
              </p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <p className="font-bold text-blue-900 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  School Office Help Desk:
                </p>
                <p className="text-[11px] text-blue-800">Phone: 06531-272045 / 9431102345</p>
                <p className="text-[11px] text-blue-800">Hours: Monday to Saturday, 9:00 AM – 4:00 PM</p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close Help
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-2 sm:py-3">
        <p className="font-semibold text-slate-500">
          Janta +2 High School, Khalari (Ranchi)
        </p>
        <p className="text-[11px] mt-0.5">
          Government Recognized • Jharkhand Academic Council
        </p>
      </div>
    </div>
  );
}
