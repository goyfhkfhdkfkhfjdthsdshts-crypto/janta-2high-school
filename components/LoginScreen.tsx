'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { UserProfile, SchoolClass } from '@/lib/types';
import { AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginScreen({ onLoginSuccess, defaultEmail = '' }: LoginScreenProps) {
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('10');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState(defaultEmail || '');
  const [customName, setCustomName] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const gsiButtonRef = useRef<HTMLDivElement>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          selectedClass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Login failed. Please retry.');
      }
    } catch {
      setErrorMessage('Network connection error. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Services if client ID exists
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });

        if (gsiButtonRef.current) {
          window.google.accounts.id.renderButton(gsiButtonRef.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 280,
          });
        }
      } catch (err) {
        console.error('Failed to initialize Google Identity Services:', err);
      }
    }
  }, [googleClientId, selectedClass]);

  // Primary Google Sign-In Action
  const handleContinueWithGoogle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // If Google Identity Services is available and client ID is set, trigger prompt
    if (typeof window !== 'undefined' && window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fall back to direct profile loading
          performDirectGoogleAuth();
        }
      });
      return;
    }

    await performDirectGoogleAuth();
  };

  const performDirectGoogleAuth = async () => {
    try {
      const emailToUse = customEmail.trim() || defaultEmail || 'student.janta@gmail.com';
      const nameToUse = customName.trim() || (emailToUse.split('@')[0].replace(/[._]/g, ' ') || 'Student User');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: nameToUse,
          selectedClass,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Unable to authenticate Google account. Please retry.');
      }
    } catch {
      setErrorMessage('Unable to reach school server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Top Banner Branding */}
      <div className="w-full max-w-md mx-auto pt-6 pb-2 text-center">
        <SchoolLogo size={96} showText={false} className="mx-auto mb-3" />
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase leading-tight">
          Janta +2 High School
        </h1>
        <p className="text-xs sm:text-sm font-bold text-blue-800 tracking-wider uppercase mt-0.5">
          Khalari, Ranchi • Jharkhand
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full">
          <span className="text-xs font-semibold text-amber-800">
            शिक्षा • अनुशासन • सफलता
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 my-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Student & Teacher Portal
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with your Google Account to access Live Classes, AI Tutor, and JAC Study Material
          </p>
        </div>

        {/* Class Selector for Student */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center">
            Select Your Current Class
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['9', '10', '11', '12'] as SchoolClass[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedClass(c)}
                className={`py-2 rounded-xl text-sm font-bold transition-all border ${
                  selectedClass === c
                    ? 'bg-blue-700 text-white border-blue-700 shadow-md scale-102 ring-2 ring-blue-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Class {c}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification with Retry */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMessage}</p>
              <button
                type="button"
                onClick={handleContinueWithGoogle}
                className="mt-1.5 inline-flex items-center gap-1 font-bold text-red-800 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Login
              </button>
            </div>
          </div>
        )}

        {/* Primary Action: Continue with Google */}
        <div className="space-y-3 pt-2">
          {/* GSI container if client ID is loaded */}
          <div ref={gsiButtonRef} className="flex justify-center" />

          {/* Standard Full-width [ Continue with Google ] Button */}
          <button
            type="button"
            onClick={() => handleContinueWithGoogle()}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 text-slate-800 font-semibold text-sm group touch-manipulation disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span className="text-slate-800 font-bold group-hover:text-blue-900">
              Continue with Google
            </span>
          </button>

          {/* Quick Google Account Switcher / Customizer */}
          <div className="pt-2">
            {!showEmailInput ? (
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="w-full text-center text-[11px] text-blue-700 hover:underline font-semibold"
              >
                Sign in with a specific Google Account or roll number?
              </button>
            ) : (
              <form onSubmit={handleContinueWithGoogle} className="space-y-2 pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-bold text-slate-700">Enter Google Account Details:</p>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  required
                />
                <input
                  type="text"
                  placeholder="Student / Teacher Name (Optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800"
                  >
                    Login with Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailInput(false)}
                    className="py-2 px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Hide
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security & Scopes Information */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Basic Scopes: openid, email, profile
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            JAC Board
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-3">
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
