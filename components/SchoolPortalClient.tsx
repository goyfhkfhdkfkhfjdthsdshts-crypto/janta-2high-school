'use client';

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SchoolClass,
  LiveClassSession,
  Notice,
  FacultyMember,
  AboutSchoolData,
  SchoolContactInfo,
} from '@/lib/types';
import { Header } from '@/components/Header';
import { BottomNav, NavTab } from '@/components/BottomNav';
import { LoginScreen } from '@/components/LoginScreen';
import { HomeView } from '@/components/HomeView';
import { LiveClassView } from '@/components/LiveClassView';
import { AiClassView } from '@/components/AiClassView';
import { McqPracticeView } from '@/components/McqPracticeView';
import { StudyBooksView } from '@/components/StudyBooksView';
import { TimetableView } from '@/components/TimetableView';
import { NoticeBoardView } from '@/components/NoticeBoardView';
import { ExamScheduleView } from '@/components/ExamScheduleView';
import { ResultsView } from '@/components/ResultsView';
import { FacultyView } from '@/components/FacultyView';
import { ProfileView } from '@/components/ProfileView';
import { OnlineAttendanceView } from '@/components/OnlineAttendanceView';
import { HelpSupportView } from '@/components/HelpSupportView';
import { AboutSchoolView } from '@/components/AboutSchoolView';
import { HomeworkView } from '@/components/HomeworkView';
import { CalendarView } from '@/components/CalendarView';
import { BookmarksView } from '@/components/BookmarksView';
import { MyProgressView } from '@/components/MyProgressView';
import { SettingsView } from '@/components/SettingsView';
import { AdminAuditView } from '@/components/AdminAuditView';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { NotificationsModal } from '@/components/NotificationsModal';
import { OfflineBanner } from '@/components/OfflineBanner';
import { AdminPasswordModal } from '@/components/AdminPasswordModal';
import { ChatView } from '@/components/ChatView';
import { WrittenQaView } from '@/components/WrittenQaView';
import { ArrowLeft } from 'lucide-react';

interface SchoolPortalClientProps {
  initialNotices?: Notice[];
  initialLiveSessions?: LiveClassSession[];
  initialFaculty?: FacultyMember[];
  initialAboutSchool?: AboutSchoolData;
  initialContact?: SchoolContactInfo;
}

export function SchoolPortalClient({
  initialNotices,
  initialLiveSessions,
  initialFaculty,
  initialAboutSchool,
}: SchoolPortalClientProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('10');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [language, setLanguage] = useState<'hi' | 'en'>('hi');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [hasActiveLive, setHasActiveLive] = useState(() =>
    initialLiveSessions ? initialLiveSessions.some((s) => s.status === 'live') : false
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const refreshNotificationCount = async (classNum: string, studentId?: string) => {
    try {
      const sid = studentId || 'guest_student';
      const res = await fetch(
        `/api/notifications?class=${classNum}&studentId=${encodeURIComponent(sid)}`
      );
      const data = await res.json();
      if (data.success && typeof data.unreadCount === 'number') {
        setUnreadNotificationsCount(data.unreadCount);
      }
    } catch {}
  };

  // Restore stored session and check active live sessions
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('janta_school_user');
      const storedAdmin = localStorage.getItem('janta_school_admin');
      const storedClass = localStorage.getItem('janta_school_class') as SchoolClass;
      const storedLang = localStorage.getItem('janta_school_lang') as 'hi' | 'en';

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Verify with persistent database to get latest verified profile
        const idToFetch = parsed.studentId || parsed.id || parsed.loginId || parsed.email;
        if (idToFetch) {
          fetch(`/api/auth/profile?id=${encodeURIComponent(idToFetch)}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem('janta_school_user', JSON.stringify(data.user));
              }
            })
            .catch(() => {});
        }
      } else {
        // Attempt cookie-based persistent session restoration
        fetch('/api/auth/profile')
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.user) {
              setUser(data.user);
              setSelectedClass(data.user.selectedClass);
              localStorage.setItem('janta_school_user', JSON.stringify(data.user));
              localStorage.setItem('janta_school_class', data.user.selectedClass);
            }
          })
          .catch(() => {});
      }
      if (storedAdmin === 'true') {
        setIsAdmin(true);
      }
      if (storedClass && ['9', '10', '11', '12'].includes(storedClass)) {
        setSelectedClass(storedClass);
      }
      if (storedLang && ['hi', 'en'].includes(storedLang)) {
        setLanguage(storedLang);
      }
    } catch (e) {
      console.error('Error loading stored session:', e);
    } finally {
      setIsInitializing(false);
    }

    // Check if any live session is running
    const checkLive = async () => {
      try {
        const res = await fetch('/api/live/sessions');
        const data = await res.json();
        if (data.sessions) {
          const isLive = data.sessions.some((s: LiveClassSession) => s.status === 'live');
          setHasActiveLive(isLive);
        }
      } catch {}
    };

    const studentId = user?.id || 'guest_student';

    checkLive();
    refreshNotificationCount(selectedClass, studentId);
    const interval = setInterval(() => {
      checkLive();
      refreshNotificationCount(selectedClass, studentId);
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedClass, user?.id]);

  // Save changes to localStorage
  const handleSelectClass = (c: SchoolClass) => {
    setSelectedClass(c);
    localStorage.setItem('janta_school_class', c);
    if (user) {
      const updated = { ...user, selectedClass: c };
      setUser(updated);
      localStorage.setItem('janta_school_user', JSON.stringify(updated));
    }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setSelectedClass(loggedInUser.selectedClass);
    localStorage.setItem('janta_school_user', JSON.stringify(loggedInUser));
    localStorage.setItem('janta_school_class', loggedInUser.selectedClass);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('janta_school_user');
    localStorage.removeItem('janta_school_admin');
    setActiveTab('home');
    setActiveSection('home');
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('janta_school_admin', 'true');
    setIsAdminModalOpen(false);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('janta_school_admin');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setActiveSection(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSection = (section: string) => {
    setActiveSection(section);
    if (['home', 'study', 'live', 'mcq', 'chat', 'profile'].includes(section)) {
      setActiveTab(section as NavTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLanguage = () => {
    const next = language === 'hi' ? 'en' : 'hi';
    setLanguage(next);
    localStorage.setItem('janta_school_lang', next);
  };

  // If user is not logged in, render the secure school authentication login & registration screen
  if (!isInitializing && !user) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const isSubSection = ![
    'home',
    'study',
    'live',
    'mcq',
    'chat',
    'profile',
  ].includes(activeSection);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Header */}
      <Header
        user={user}
        isAdmin={isAdmin}
        selectedClass={selectedClass}
        onSelectClass={handleSelectClass}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onGoHome={() => handleOpenSection('home')}
        onOpenProfile={() => handleOpenSection('profile')}
        onOpenAttendance={() => handleOpenSection('attendance')}
        onOpenHelp={() => handleOpenSection('help')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Offline Connectivity Status Banner */}
      <OfflineBanner language={language} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {/* Sub-section Back to Home button */}
        {isSubSection && (
          <div className="mb-3">
            <button
              onClick={() => handleOpenSection('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-700" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        )}

        {/* Dynamic Section Router */}
        {activeSection === 'home' && (
          <HomeView
            user={user}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onNavigateTab={handleTabChange}
            onOpenSection={handleOpenSection}
            language={language}
            initialNotices={initialNotices}
            initialLiveSessions={initialLiveSessions}
          />
        )}

        {activeSection === 'study' && (
          <StudyBooksView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'live' && (
          <LiveClassView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'ai' && (
          <AiClassView
            user={user}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />
        )}

        {activeSection === 'mcq' && (
          <McqPracticeView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'chat' && (
          <ChatView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'written' && (
          <WrittenQaView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'homework' && (
          <HomeworkView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'calendar' && (
          <CalendarView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'progress' && (
          <MyProgressView
            user={user}
            selectedClass={selectedClass}
            onNavigateToSection={handleOpenSection}
            language={language}
          />
        )}

        {activeSection === 'saved' && (
          <BookmarksView
            onNavigateToSection={handleOpenSection}
            language={language}
          />
        )}

        {activeSection === 'settings' && (
          <SettingsView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              localStorage.setItem('janta_school_lang', lang);
            }}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onNavigateToSection={handleOpenSection}
            onLogout={handleLogout}
          />
        )}

        {activeSection === 'audit' && (
          <AdminAuditView
            user={user}
            isAdmin={isAdmin}
            onBack={() => handleOpenSection('settings')}
            language={language}
          />
        )}

        {activeSection === 'timetable' && (
          <TimetableView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'notice' && (
          <NoticeBoardView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
            initialNotices={initialNotices}
          />
        )}

        {activeSection === 'exam' && (
          <ExamScheduleView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'results' && (
          <ResultsView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'faculty' && (
          <FacultyView
            user={user}
            isAdmin={isAdmin}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
            initialFaculty={initialFaculty}
          />
        )}

        {activeSection === 'attendance' && (
          <OnlineAttendanceView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'profile' && (
          <ProfileView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            onLogoutAdmin={handleAdminLogout}
            onLogout={handleLogout}
            language={language}
            onOpenHelp={() => handleOpenSection('help')}
            onNavigateToSection={handleOpenSection}
          />
        )}

        {activeSection === 'help' && (
          <HelpSupportView
            user={user}
            isAdmin={isAdmin}
            selectedClass={selectedClass}
            onSelectClass={handleSelectClass}
            onOpenSection={handleOpenSection}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
          />
        )}

        {activeSection === 'about' && (
          <AboutSchoolView
            user={user}
            isAdmin={isAdmin}
            onBack={() => handleOpenSection('home')}
            onNavigateToSection={handleOpenSection}
            onOpenAdminModal={() => setIsAdminModalOpen(true)}
            language={language}
            initialData={initialAboutSchool}
            initialFaculty={initialFaculty}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hasActiveLiveSession={hasActiveLive}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToSection={handleOpenSection}
        selectedClass={selectedClass}
        language={language}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          refreshNotificationCount(selectedClass, user?.id);
        }}
        studentId={user?.id}
        selectedClass={selectedClass}
        onNavigateToSection={handleOpenSection}
        language={language}
      />

      {/* Admin Security Password Modal */}
      <AdminPasswordModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminSuccess}
        isAdmin={isAdmin}
        onLogoutAdmin={handleAdminLogout}
      />
    </div>
  );
}
