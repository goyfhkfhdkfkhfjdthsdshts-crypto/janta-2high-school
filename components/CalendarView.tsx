'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  X,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Tag,
  PartyPopper,
} from 'lucide-react';
import { CalendarEvent, CalendarEventCategory, SchoolClass, UserProfile } from '@/lib/types';

interface CalendarViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

export function CalendarView({
  user,
  isAdmin,
  selectedClass,
  onOpenAdminModal,
  language,
}: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026

  // Admin Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCategory, setFormCategory] = useState<CalendarEventCategory>('holiday');
  const [formIsHoliday, setFormIsHoliday] = useState(true);
  const [formTargetClass, setFormTargetClass] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/calendar?category=${selectedCategory}&class=${selectedClass}`);
      const data = await res.json();
      if (data.success && data.events) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedClass]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formStartDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          startDate: formStartDate,
          endDate: formEndDate || formStartDate,
          category: formCategory,
          isHoliday: formIsHoliday,
          targetClass: formTargetClass,
          createdBy: user?.name || 'School Admin',
        }),
      });

      const data = await res.json();
      if (data.success && data.event) {
        setEvents((prev) => [...prev, data.event].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
        setIsModalOpen(false);
        setFormTitle('');
        setFormDescription('');
        setFormStartDate('');
        setFormEndDate('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप इस इवेंट को हटाना चाहते हैं?' : 'Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const res = await fetch(`/api/calendar?id=${id}&adminName=${encodeURIComponent(user?.name || 'Admin')}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { id: 'all', label: language === 'hi' ? 'सभी' : 'All Events' },
    { id: 'holiday', label: language === 'hi' ? 'अवकाश (Holidays)' : 'Holidays' },
    { id: 'exam', label: language === 'hi' ? 'परीक्षा (Exams)' : 'Exams' },
    { id: 'event', label: language === 'hi' ? 'कार्यक्रम (Events)' : 'Events' },
    { id: 'activity', label: language === 'hi' ? 'गतिविधियां (Activities)' : 'Activities' },
  ];

  const getCategoryBadge = (cat: CalendarEventCategory) => {
    switch (cat) {
      case 'holiday':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: PartyPopper,
          label: language === 'hi' ? 'अवकाश' : 'Holiday',
        };
      case 'exam':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Award,
          label: language === 'hi' ? 'परीक्षा' : 'Exam',
        };
      case 'activity':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Sparkles,
          label: language === 'hi' ? 'गतिविधि' : 'Activity',
        };
      case 'event':
      default:
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: CalendarIcon,
          label: language === 'hi' ? 'कार्यक्रम' : 'Event',
        };
    }
  };

  const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthName = currentDate.toLocaleString(language === 'hi' ? 'hi-IN' : 'default', {
    month: 'long',
    year: 'numeric',
  });

  const monthEvents = events.filter((e) => e.startDate.startsWith(currentYearMonth));

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-orange-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-amber-200 backdrop-blur-xs">
              <CalendarIcon className="w-3.5 h-3.5" />
              {language === 'hi' ? 'वार्षिक शैक्षणिक कैलेंडर' : 'Annual Academic Calendar'}
            </span>
            {isAdmin ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'hi' ? 'इवेंट जोड़ें' : '+ Add Event'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="text-[11px] text-amber-200 hover:text-white underline font-medium"
              >
                {language === 'hi' ? 'प्रबंधन मोड' : 'Admin Mode'}
              </button>
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi' ? 'जनता +2 उच्च विद्यालय कैलंडर' : 'School Official Calendar'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-xl mt-1">
              {language === 'hi'
                ? 'झारखंड सरकार व जैक बोर्ड अनुसार अवकाश, परीक्षा और सांस्कृतिक कार्यक्रमों की सूची।'
                : 'Official Jharkhand Academic Council & state government holidays, examination schedules, and events.'}
            </p>
          </div>
        </div>
      </div>

      {/* Month Navigator & Filter Chips */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-black text-slate-900 capitalize">
              {monthName}
            </h2>
            <p className="text-xs text-slate-500">
              {monthEvents.length} {language === 'hi' ? 'कार्यक्रम इस माह' : 'events in this month'}
            </p>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 mx-auto border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">
            {language === 'hi' ? 'कैलेंडर लोड हो रहा है...' : 'Loading calendar events...'}
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-3">
          <CalendarIcon className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi' ? 'कोई इवेंट नहीं मिला' : 'No Events Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi'
              ? 'इस श्रेणी या महीने के लिए कोई कार्यक्रम निर्धारित नहीं है।'
              : 'There are no events or holidays recorded for this selection.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => {
            const badge = getCategoryBadge(evt.category);
            const BadgeIcon = badge.icon;
            const startD = new Date(evt.startDate);
            const isMultiDay = evt.endDate && evt.endDate !== evt.startDate;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-start gap-3.5"
              >
                {/* Date Block */}
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0 text-amber-900">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    {startD.toLocaleString(language === 'hi' ? 'hi-IN' : 'default', { month: 'short' })}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {startD.getDate()}
                  </span>
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        {badge.label}
                      </span>
                      {evt.targetClass && evt.targetClass !== 'All' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Class {evt.targetClass}
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evt.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {evt.startDate}
                      {isMultiDay ? ` ${language === 'hi' ? 'से' : 'to'} ${evt.endDate}` : ''}
                    </span>
                    <span>•</span>
                    <span>{evt.createdBy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EVENT MODAL (Admin) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-amber-800 to-orange-950 p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-amber-300" />
                <h2 className="text-base font-bold">
                  {language === 'hi' ? 'नया कैलेंडर इवेंट जोड़ें' : 'Add Calendar Event'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-amber-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'इवेंट शीर्षक' : 'Event Title'} *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Diwali Vacation / Pre-Board Exams"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'प्रारंभ तिथि' : 'Start Date'} *
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'समाप्ति तिथि' : 'End Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as CalendarEventCategory;
                      setFormCategory(cat);
                      setFormIsHoliday(cat === 'holiday');
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="holiday">Holiday / अवकाश</option>
                    <option value="exam">Exam / परीक्षा</option>
                    <option value="event">Event / कार्यक्रम</option>
                    <option value="activity">Class Activity / गतिविधि</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'hi' ? 'लक्षित कक्षा' : 'Target Class'}
                  </label>
                  <select
                    value={formTargetClass}
                    onChange={(e) => setFormTargetClass(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="All">All Classes (सभी)</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'hi' ? 'विवरण' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Additional details, circular order number..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : language === 'hi' ? 'इवेंट जोड़ें' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
