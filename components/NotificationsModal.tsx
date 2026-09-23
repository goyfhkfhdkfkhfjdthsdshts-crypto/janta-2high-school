'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  Video,
  Award,
  BookOpen,
  ClipboardList,
  UserCheck,
  CheckCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '@/lib/types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  selectedClass?: string;
  onNavigateToSection: (section: string) => void;
  language: 'hi' | 'en';
}

export function NotificationsModal({
  isOpen,
  onClose,
  studentId,
  selectedClass,
  onNavigateToSection,
  language,
}: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<(NotificationItem & { isRead: boolean })[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const url = `/api/notifications?${selectedClass ? `class=${selectedClass}&` : ''}${
        studentId ? `studentId=${encodeURIComponent(studentId)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, selectedClass, studentId]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          notificationId: id,
          studentId: studentId || 'guest_student',
        }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_all_read',
          studentId: studentId || 'guest_student',
        }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (notif: NotificationItem & { isRead: boolean }) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.linkSection) {
      onClose();
      onNavigateToSection(notif.linkSection);
    }
  };

  if (!isOpen) return null;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'live':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'exam':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'result':
        return <Award className="w-4 h-4 text-purple-600" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'homework':
        return <ClipboardList className="w-4 h-4 text-emerald-600" />;
      case 'attendance':
        return <UserCheck className="w-4 h-4 text-teal-600" />;
      case 'notice':
      default:
        return <Bell className="w-4 h-4 text-indigo-600" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'urgent') return n.urgent;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-2xl bg-white/10 text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {language === 'hi' ? 'सूचनाएं एवं अलर्ट' : 'Notifications & Alerts'}
              </h2>
              <p className="text-xs text-blue-200">
                {language === 'hi'
                  ? `कक्षा ${selectedClass || 'सभी'} के लिए अपडेट`
                  : `Updates for Class ${selectedClass || 'All'}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Mark All Read */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'hi' ? 'सभी' : 'All'} ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'hi' ? 'अपठित' : 'Unread'} ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filter === 'urgent'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'hi' ? 'ज़रूरी' : 'Urgent'}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'सब पढ़ लिया' : 'Mark all read'}</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-medium">
                {language === 'hi' ? 'सूचनाएं लोड हो रही हैं...' : 'Loading notifications...'}
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {language === 'hi' ? 'सब कुछ अद्यतन है!' : 'You are all caught up!'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {language === 'hi'
                  ? 'कोई नई सूचना या लंबित अलर्ट नहीं है।'
                  : 'There are no new alerts or pending notices right now.'}
              </p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.isRead
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    : 'bg-blue-50/70 border-blue-200 hover:bg-blue-50 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      notif.isRead ? 'bg-slate-100' : 'bg-white shadow-xs'
                    }`}
                  >
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {notif.title}
                        </span>
                        {notif.urgent && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {language === 'hi' ? 'ज़रूरी' : 'Urgent'}
                          </span>
                        )}
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      {notif.linkSection && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
                          <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-[10px] font-semibold text-slate-400 hover:text-blue-700 ml-auto"
                        >
                          {language === 'hi' ? 'पढ़ा हुआ चिह्नित करें' : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
