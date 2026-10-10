'use client';

import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, SchoolClass } from '@/lib/types';
import { apiFetch, saveStoredSession } from '@/lib/apiConfig';
import {
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Building2,
  UserCheck,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  RotateCw,
} from 'lucide-react';

export type AppLoginRole = 'student' | 'teacher' | 'principal' | 'admin';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<AppLoginRole>('student');
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('10');
  const [rollNumber, setRollNumber] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const sampleRollNumbers: Record<SchoolClass, Array<{ roll: string; name: string }>> = {
    '10': [
      { roll: '25', name: 'Kavita Soren' },
      { roll: '1001', name: 'Amit Kumar Singh' },
      { roll: '1002', name: 'Pooja Kumari Oraon' },
      { roll: '1003', name: 'Rahul Soren' },
    ],
    '9': [
      { roll: '25', name: 'Pooja Singh' },
      { roll: '901', name: 'Vicky Kumar' },
      { roll: '902', name: 'Sunita Munda' },
      { roll: '903', name: 'Ajay Oraon' },
    ],
    '11': [
      { roll: '25', name: 'Anup Kujur' },
      { roll: '1101', name: 'Rohan Karmali' },
      { roll: '1102', name: 'Meena Kumari' },
    ],
    '12': [
      { roll: '25', name: 'Sangeeta Tirkey' },
      { roll: '1201', name: 'Manish Verma' },
      { roll: '1202', name: 'Sunita Kumari' },
    ],
  };

  const handleRoleChange = (role: AppLoginRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword('');
    if (role === 'teacher') {
      setLoginId('TCH-101');
      setPassword('teacher123');
    } else if (role === 'principal') {
      setLoginId('PRN-001');
      setPassword('principal123');
    } else if (role === 'admin') {
      setLoginId('ADM-001');
      setPassword('admin12345678');
    } else {
      setLoginId('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedRole === 'student') {
      const cleanRoll = rollNumber.trim();
      if (!cleanRoll) {
        setErrorMessage('Please enter your Roll Number.');
        return;
      }

      setIsLoading(true);

      try {
        const { res, data } = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            role: 'student',
            selectedClass,
            rollNo: cleanRoll,
          }),
        });

        if (res.ok && data?.success && data?.user) {
          setSuccessMessage(`Welcome ${data.user.name}! Logging in...`);
          saveStoredSession(data.user, data.token);
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 300);
        } else {
          setErrorMessage(data?.message || 'Roll Number or Class is incorrect.');
        }
      } catch (err: any) {
        setErrorMessage(
          err?.message || 'Unable to connect to school login server. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Staff Login (Teacher, Principal, Admin)
    const cleanId = loginId.trim();
    const cleanPassword = password.trim();

    if (!cleanId || !cleanPassword) {
      setErrorMessage('Please enter both ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const { res, data } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          role: selectedRole,
          loginId: cleanId,
          password: cleanPassword,
        }),
      });

      if (res.ok && data?.success && data?.user) {
        setSuccessMessage(`Welcome ${data.user.name}! Logging in...`);
        saveStoredSession(data.user, data.token);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 300);
      } else {
        const roleLabel =
          selectedRole === 'teacher'
            ? 'Teacher'
            : selectedRole === 'principal'
            ? 'Principal'
            : 'Admin';
        setErrorMessage(data?.message || `Invalid ${roleLabel} ID or Password.`);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Unable to connect to school login server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/50 to-slate-100 flex flex-col justify-between p-3 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Branding */}
      <div className="w-full max-w-md mx-auto pt-4 sm:pt-6 pb-2 text-center">
        <SchoolLogo size={84} showText={false} className="mx-auto mb-2.5 drop-shadow-sm" />
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

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-7 my-auto space-y-4">
        {/* Role Selector Tabs (ONLY 4 ROLES: Student, Teacher, Principal, Admin) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-1.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-2xl gap-1 text-center">
            {[
              { role: 'student' as const, label: 'Student', icon: GraduationCap },
              { role: 'teacher' as const, label: 'Teacher', icon: UserCheck },
              { role: 'principal' as const, label: 'Principal', icon: Building2 },
              { role: 'admin' as const, label: 'Admin', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.role;
              return (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => handleRoleChange(tab.role)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs ring-1 ring-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Header */}
        <div className="text-center pt-1 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {selectedRole === 'student' && 'Student Login'}
            {selectedRole === 'teacher' && 'Teacher Portal Login'}
            {selectedRole === 'principal' && 'Principal Office Login'}
            {selectedRole === 'admin' && 'School Administrator Login'}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedRole === 'student' && 'Select your class and enter your roll number'}
            {selectedRole === 'teacher' && 'Enter your authorized Faculty ID & Password'}
            {selectedRole === 'principal' && 'Executive school governance access'}
            {selectedRole === 'admin' && 'Full school database & administrative control'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-2 text-xs text-red-700 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <p className="font-semibold">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] font-bold bg-red-100 hover:bg-red-200 text-red-800 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* ==================================================== */}
        {/* STUDENT LOGIN FORM                                   */}
        {/* ==================================================== */}
        {selectedRole === 'student' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* Class Selection: 9, 10, 11, 12 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enrolled Class <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedClass(c);
                      setErrorMessage(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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

            {/* Roll Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Roll Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 25 or 1001"
                  value={rollNumber}
                  onChange={(e) => {
                    setRollNumber(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Quick Demo Roll Number Suggestions */}
            <div className="p-2.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Enrolled Students in Class {selectedClass}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleRollNumbers[selectedClass].map((s) => (
                  <button
                    key={s.roll}
                    type="button"
                    onClick={() => {
                      setRollNumber(s.roll);
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1 text-[11px] bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    Roll {s.roll} <span className="text-slate-500 font-normal">({s.name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ==================================================== */
          /* STAFF LOGIN FORM (Teacher, Principal, Admin)         */
          /* ==================================================== */
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {selectedRole === 'teacher' && 'Teacher ID'}
                {selectedRole === 'principal' && 'Principal ID'}
                {selectedRole === 'admin' && 'Admin ID'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'teacher'
                      ? 'e.g. TCH-101'
                      : selectedRole === 'principal'
                      ? 'e.g. PRN-001'
                      : 'e.g. ADM-001'
                  }
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter authorized password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-hidden"
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

            {/* Quick Demo Credential Badge */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Official Demo Access:</span>
              <span className="font-mono text-[11px] text-blue-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {selectedRole === 'teacher' && 'TCH-101 • teacher123'}
                {selectedRole === 'principal' && 'PRN-001 • principal123'}
                {selectedRole === 'admin' && 'ADM-001 • admin12345678'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Links & Help */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Need Help / सहायता</span>
          </button>

          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official JAC Portal</span>
          </span>
        </div>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">Login Instructions</h3>
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
                <strong>Students:</strong> Select your class (9, 10, 11, or 12) and type your registered Roll Number (e.g. 25, 1001). No password required.
              </p>
              <p>
                <strong>Teachers:</strong> Use your Teacher ID (e.g. TCH-101) and assigned password (<code>teacher123</code>).
              </p>
              <p>
                <strong>Principal:</strong> Use your Principal ID (PRN-001) and password (<code>principal123</code>).
              </p>
              <p>
                <strong>Administrator:</strong> Use Admin ID (ADM-001) and password (<code>admin12345678</code>).
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <p className="font-bold text-blue-900 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  School Office Help Desk:
                </p>
                <p className="text-[11px] text-blue-800">Phone: 06531-272045 / 9431102345</p>
                <p className="text-[11px] text-blue-800">Khalari, Ranchi (Jharkhand)</p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
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
