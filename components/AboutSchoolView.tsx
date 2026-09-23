'use client';

import React, { useState, useEffect } from 'react';
import {
  SchoolLogo
} from './SchoolLogo';
import {
  AboutSchoolData,
  SchoolHighlightItem,
  SchoolFacilityItem,
  SchoolPhotoItem,
  UserProfile,
  FacultyMember,
} from '@/lib/types';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Globe,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Info,
  Laptop,
  Leaf,
  Lock,
  MapPin,
  Maximize2,
  MessageSquare,
  Navigation,
  PhoneCall,
  Plus,
  Radio,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Users,
  Video,
  X,
  Zap,
} from 'lucide-react';

interface AboutSchoolViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  onBack: () => void;
  onNavigateToSection: (section: string) => void;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

type TabType =
  | 'overview'
  | 'academics'
  | 'facilities'
  | 'activities'
  | 'gallery'
  | 'faq'
  | 'contact';

export function AboutSchoolView({
  user,
  isAdmin,
  onBack,
  onNavigateToSection,
  onOpenAdminModal,
  language,
}: AboutSchoolViewProps) {
  const [data, setData] = useState<AboutSchoolData | null>(null);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Gallery category filter & modal zoom
  const [galleryCategory, setGalleryCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<SchoolPhotoItem | null>(null);

  // Admin Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSection, setEditSection] = useState<'intro' | 'principal' | 'facility' | 'photo' | 'timing' | null>(null);
  const [editingFacility, setEditingFacility] = useState<Partial<SchoolFacilityItem>>({
    title: '',
    description: '',
    verifiedStatus: 'Verified by Staff',
    capacityOrDetails: '',
    isPublished: true,
  });
  const [newPhoto, setNewPhoto] = useState<Partial<SchoolPhotoItem>>({
    title: '',
    category: 'Campus',
    imageUrl: '',
    caption: '',
    isFeatured: false,
    isPublished: true,
  });

  const fetchAboutData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/about');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching about school data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFacultyData = async () => {
    try {
      const res = await fetch('/api/data/faculty');
      const json = await res.json();
      if (json.data) {
        setFaculty(json.data);
      }
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  useEffect(() => {
    fetchAboutData();
    fetchFacultyData();
  }, []);

  // Toggle Highlight (Admin only)
  const handleToggleHighlight = async (highlightId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      onOpenAdminModal();
      return;
    }
    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_highlight',
          payload: { highlightId, isFeatured: !currentStatus },
          performedBy: user?.name || 'Administrator',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error toggling highlight:', err);
    }
  };

  // Add Gallery Photo (Admin only)
  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title || !newPhoto.imageUrl) return;

    setIsSaving(true);
    try {
      const photoPayload: SchoolPhotoItem = {
        id: `p-${Date.now()}`,
        title: newPhoto.title || 'School Photo',
        category: (newPhoto.category as any) || 'Campus',
        imageUrl: newPhoto.imageUrl || '',
        caption: newPhoto.caption || '',
        date: new Date().toISOString().split('T')[0],
        isFeatured: Boolean(newPhoto.isFeatured),
        isPublished: true,
      };

      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_photo',
          payload: { photo: photoPayload },
          performedBy: user?.name || 'Administrator',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setIsEditModalOpen(false);
        setNewPhoto({ title: '', category: 'Campus', imageUrl: '', caption: '', isFeatured: false });
      }
    } catch (err) {
      console.error('Error adding photo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Gallery Photo (Admin only)
  const handleDeletePhoto = async (photoId: string) => {
    if (!isAdmin) return;
    if (!confirm(language === 'hi' ? 'क्या आप इस फोटो को हटाना चाहते हैं?' : 'Delete this photo from school gallery?')) return;

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_photo',
          payload: { photoId },
          performedBy: user?.name || 'Administrator',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">
          {language === 'hi' ? 'विद्यालय विवरण लोड हो रहा है...' : 'Loading verified school records...'}
        </p>
      </div>
    );
  }

  // Filtered highlights (Featured ones displayed prominently)
  const featuredHighlights = data.highlights.filter((h) => h.isFeatured);
  const otherHighlights = data.highlights.filter((h) => !h.isFeatured);

  // Filtered photos
  const filteredPhotos = (data.photos || []).filter(
    (p) => galleryCategory === 'All' || p.category === galleryCategory
  );

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto">
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between gap-2 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-blue-700" />
          <span>{language === 'hi' ? 'मुख्य पृष्ठ (Back to Home)' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
            JAC Affiliated Code: {data.schoolCode}
          </span>
          {isAdmin ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              Admin Verified
            </span>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Branding Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-blue-900">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-xs ring-4 ring-white/10 shrink-0">
            <SchoolLogo size={76} showText={false} />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                Govt. Recognized +2 High School
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-blue-200">
                Est. {data.establishedYear}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {data.schoolName}
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-amber-300 max-w-xl">
              {data.tagline}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-blue-200 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                Khalari, Ranchi, Jharkhand
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Classes 9, 10, 11 &amp; 12
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                U-DISE: {data.udiseCode}
              </span>
            </div>
          </div>
        </div>

        {/* School Motto */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">ध्येय वाक्य (Motto):</span>
            <span className="italic text-amber-200 font-bold">&ldquo;{data.motto}&rdquo;</span>
          </div>

          <span className="text-[11px] text-slate-400">
            Affiliated to Jharkhand Academic Council (JAC), Ranchi
          </span>
        </div>
      </div>

      {/* 28. SCHOOL HIGHLIGHTS (Admin Selectable & Prominently Displayed) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 rounded-3xl p-5 border border-amber-300/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500 text-slate-950 font-black">
              <Star className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>{language === 'hi' ? 'विद्यालय के मुख्य आकर्षण' : 'School Highlights'}</span>
                <span className="text-xs font-semibold text-amber-700">(Verified Highlights)</span>
              </h2>
              <p className="text-[11px] text-slate-600">
                {language === 'hi'
                  ? 'प्रशासन द्वारा सत्यापित एवं प्रमुखता से प्रदर्शित उपलब्धियां'
                  : 'Important school features displayed prominently by administration'}
              </p>
            </div>
          </div>

          {isAdmin && (
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">
              Admin: Click ⭐ to Pin / Unpin
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {featuredHighlights.map((hl) => (
            <div
              key={hl.id}
              className="bg-white rounded-2xl p-3.5 border border-amber-200 shadow-xs flex items-start justify-between gap-2.5 relative group hover:border-amber-400 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900">
                    {hl.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Featured
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{hl.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">{hl.description}</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleToggleHighlight(hl.id, hl.isFeatured)}
                  className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors shrink-0"
                  title="Toggle highlight off"
                >
                  <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                </button>
              )}
            </div>
          ))}

          {otherHighlights.map((hl) => (
            <div
              key={hl.id}
              className="bg-white/80 rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-start justify-between gap-2.5"
            >
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                  {hl.category}
                </span>
                <h3 className="text-xs font-semibold text-slate-800">{hl.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{hl.description}</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleToggleHighlight(hl.id, hl.isFeatured)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition-colors shrink-0"
                  title="Pin to top highlights"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview' as TabType, label: language === 'hi' ? 'परिचय एवं संदेश' : 'Introduction & Principal' },
          { id: 'academics' as TabType, label: language === 'hi' ? 'कक्षाएं व शिक्षक' : 'Classes & Faculty' },
          { id: 'facilities' as TabType, label: language === 'hi' ? 'सुविधाएं व समय' : 'Facilities & Timings' },
          { id: 'activities' as TabType, label: language === 'hi' ? 'गतिविधियां व खेल' : 'Student Activities' },
          { id: 'gallery' as TabType, label: language === 'hi' ? 'फोटो गैलरी' : 'Photo Gallery' },
          { id: 'faq' as TabType, label: language === 'hi' ? 'नियम व FAQ' : 'Rules & FAQ' },
          { id: 'contact' as TabType, label: language === 'hi' ? 'संपर्क व स्थान' : 'Contact & Map' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW (School Introduction, Principal Message & App Usage) */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* 1. School Introduction */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-700" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'विद्यालय परिचय (School Introduction)' : 'About Janta +2 High School'}
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                JAC Code: {data.schoolCode}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              <p>{data.introductionHindi}</p>
              <p className="text-slate-600 border-l-2 border-blue-600 pl-3 italic">
                {data.introductionEnglish}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Established</span>
                <span className="text-lg font-black text-blue-900">{data.establishedYear}</span>
                <span className="text-[10px] text-slate-500 block">48+ Glorious Years</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Affiliation</span>
                <span className="text-lg font-black text-blue-900">JAC</span>
                <span className="text-[10px] text-slate-500 block">Council Ranchi</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Classes</span>
                <span className="text-lg font-black text-blue-900">9 to 12</span>
                <span className="text-[10px] text-slate-500 block">Secondary &amp; +2</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">U-DISE Code</span>
                <span className="text-sm font-black text-blue-900 break-all">{data.udiseCode}</span>
                <span className="text-[10px] text-slate-500 block">Govt. Verified</span>
              </div>
            </div>
          </div>

          {/* 5. Principal / Head Teacher Message */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-700" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'प्रधानाध्यापक का संदेश (Principal’s Message)' : 'Message from the Principal'}
                </h2>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <div className="w-24 h-28 rounded-2xl overflow-hidden ring-2 ring-blue-700/20 shadow-md shrink-0 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.principalMessage.photoUrl}
                  alt={data.principalMessage.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {data.principalMessage.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-700">
                    {data.principalMessage.designation}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {data.principalMessage.qualification}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  &ldquo;{data.principalMessage.messageHindi}&rdquo;
                </p>

                <p className="text-xs text-slate-500 leading-relaxed italic border-t border-slate-100 pt-2">
                  &ldquo;{data.principalMessage.messageEnglish}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* 31. How to Use the Smart School App */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                {language === 'hi' ? 'स्मार्ट स्कूल ऐप का उपयोग कैसे करें? (App Guide)' : 'How to Use the Smart School App'}
              </h2>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              {language === 'hi'
                ? 'यह ऐप जनता +2 उच्च विद्यालय खलारी के सभी छात्रों, अभिभावकों एवं शिक्षकों के लिए पूर्णतः निःशुल्क और सुलभ है:'
                : 'Official digital classroom and school records portal for students, parents, and educators:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">1. उपस्थिति (Online Attendance)</span>
                <p className="text-blue-100 text-[11px]">माइक दबाकर आवाज द्वारा अथवा रोल नंबर दर्ज करके दैनिक उपस्थिति दर्ज करें।</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">2. पाठ्यपुस्तकें (NCERT Books)</span>
                <p className="text-blue-100 text-[11px]">कक्षा 9 से 12 तक की सभी NCERT/JCERT पुस्तकें हिंदी व अंग्रेजी में पढ़ें।</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">3. AI Class & Doubts (24/7)</span>
                <p className="text-blue-100 text-[11px]">गणित, विज्ञान अथवा किसी भी विषय का सवाल फोटो खींचकर या लिखकर पूछें।</p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-bold text-amber-300">4. JAC MCQ & Live Classroom</span>
                <p className="text-blue-100 text-[11px]">बोर्ड पैटर्न पर आधारित वस्तुनिष्ठ प्रश्नों का अभ्यास करें और लाइव कक्षाएं देखें।</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => onNavigateToSection('help')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>विस्तृत सहायता केंद्र (Help &amp; Support) →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMICS & FACULTY (Classes & Subjects, Faculty, Academic Info) */}
      {activeTab === 'academics' && (
        <div className="space-y-4">
          {/* 7. Classes & Subjects */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'hi' ? 'कक्षाएं एवं संकायवार विषय (Classes & Streams)' : 'Classes & Subject Streams'}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              JAC (Jharkhand Academic Council) पाठ्यक्रम के तहत कक्षा 9वीं से 12वीं तक उपलब्ध विषय:
            </p>

            <div className="space-y-3 pt-1">
              {/* Secondary (Class 9 & 10) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900 uppercase">
                    Secondary Section • Classes 9 &amp; 10 (माध्यमिक स्तर)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    JAC 10th Board
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  <strong>अनिवार्य विषय (Compulsory):</strong> गणित (Mathematics), विज्ञान (Science - Physics, Chemistry, Biology), सामाजिक विज्ञान (Social Science - History, Civics, Geography, Economics), हिन्दी (Hindi Core), अंग्रेजी (English Language).
                </p>
                <p className="text-[11px] text-slate-600">
                  <strong>अतिरिक्त / व्यावसायिक विषय:</strong> संस्कृत (Sanskrit), इंफॉर्मेशन टेक्नोलॉजी (Information Technology - IT), हेल्थकेयर (Healthcare).
                </p>
              </div>

              {/* +2 Science Stream */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950 uppercase">
                    Higher Secondary (+2) • Science Stream (विज्ञान संकाय)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  भौतिक विज्ञान (Physics), रसायन विज्ञान (Chemistry), गणित (Mathematics), जीव विज्ञान (Biology), कंप्यूटर साइंस (Computer Science), अंग्रेजी कोर (English Core).
                </p>
              </div>

              {/* +2 Commerce Stream */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase">
                    Higher Secondary (+2) • Commerce Stream (वाणिज्य संकाय)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  लेखाशास्त्र (Accountancy), व्यावसायिक अध्ययन (Business Studies), अर्थशास्त्र (Economics), उद्यमिता (Entrepreneurship), अंग्रेजी कोर (English Core).
                </p>
              </div>

              {/* +2 Arts Stream */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950 uppercase">
                    Higher Secondary (+2) • Arts / Humanities Stream (कला संकाय)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                    Class 11 &amp; 12
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">
                  इतिहास (History), राजनीति विज्ञान (Political Science), भूगोल (Geography), अर्थशास्त्र (Economics), हिन्दी कोर (Hindi), संस्कृत (Sanskrit).
                </p>
              </div>
            </div>
          </div>

          {/* 6. Teachers & Faculty List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-700" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'शिक्षक एवं संकाय सदस्य (Faculty & Teachers)' : 'School Faculty & Teachers'}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {faculty.length} {language === 'hi' ? 'सत्यापित शिक्षक' : 'Educators'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Only verified government &amp; council-appointed educators actively teaching at Khalari:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {faculty.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{f.name}</h3>
                      <span className="text-[11px] font-bold text-blue-700 block">{f.designation}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700 shrink-0">
                      {typeof f.classesTaught === 'string' ? f.classesTaught : f.classesTaught.join(', ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium">
                    <strong>Subject:</strong> {f.subject}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    <strong>Qualification:</strong> {f.qualification}
                    {f.experience && ` • Exp: ${f.experience}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Academic Information & Evaluation */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Academic &amp; Examination Pattern (परीक्षा एवं मूल्यांकन प्रणाली)
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">JAC Examination Pattern:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{data.academicInfo.examinationPattern}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">Grading &amp; Division System:</span>
                <p className="text-slate-600 mt-0.5">{data.academicInfo.gradingSystem}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACILITIES & TIMINGS */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          {/* 8. School Facilities */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-700" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'विद्यालय की भौतिक सुविधाएं (Campus Facilities)' : 'Verified School Facilities'}
                </h2>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                Staff Verified Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {data.facilities.map((fac) => (
                <div
                  key={fac.id}
                  className="p-4 bg-slate-50 hover:bg-teal-50/30 rounded-2xl border border-slate-200 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac.title}</span>
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {fac.description}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold border-t border-slate-200/60">
                    <span>{fac.capacityOrDetails}</span>
                    <span className="text-emerald-700">{fac.verifiedStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. School Timings */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-700" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'विद्यालय समय-सारिणी (School Timings)' : 'Daily School Timings'}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Monday to Saturday
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {data.timings.map((t, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{t.activity}</span>
                    <span className="text-[11px] text-slate-500">{t.notes}</span>
                    <span className="text-[10px] text-blue-700 font-medium block">{t.days}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 text-xs">
                      {t.startTime} – {t.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 25. Health & Safety */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-black text-slate-900">
                {language === 'hi' ? 'स्वास्थ्य एवं सुरक्षा प्रबंध (Health & Safety Standards)' : 'Health, Safety & Campus Security'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {data.healthAndSafety.map((hs, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{hs.title}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {hs.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{hs.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT ACTIVITIES & SPORTS */}
      {activeTab === 'activities' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'hi' ? 'छात्र गतिविधियां एवं सह-पाठ्यक्रम' : 'Co-Curricular & Student Activities'}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Co-curricular programs fostering discipline, physical fitness, and civic responsibility:
            </p>

            <div className="space-y-3 pt-1">
              {data.studentActivities.map((act, i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{act.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                      {act.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* National Festivals & Cultural Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700">
                <Flame className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase">17. Independence Day (15 August)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                National tricolor flag hoisting by the Principal, parade by Scouts &amp; Guides, patriotic speeches, patriotic chorus, and traditional sweets distribution to all 800+ students.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700">
                <Shield className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase">18. Republic Day (26 January)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Preamble reading in Hindi &amp; English, cultural tableaux on Indian democracy, felicitation of academic and sports achievers, and staff address on fundamental duties.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <Leaf className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase">23. Environment &amp; Eco Club</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Active Eco Club maintaining a campus herbal garden, rainwater harvesting pit, clean drinking water testing, and annual Van Mahotsav tree plantation drives in Khalari.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700">
                <Laptop className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase">24. Computer &amp; IT Literacy</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Comprehensive hands-on digital training in Microsoft Office, internet search, typing in Hindi/English, and preparation for digital JAC board model test papers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PHOTO GALLERY (27. School Photo Gallery) */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'विद्यालय फोटो गैलरी (Photo Gallery)' : 'School Campus & Event Gallery'}
                </h2>
                <p className="text-xs text-slate-500">
                  Real campus photographs verified by school administration
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    setEditSection('photo');
                    setIsEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'hi' ? '+ फोटो जोड़ें' : '+ Add Photo'}</span>
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Campus', 'Labs & Library', 'Sports', 'Cultural'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    galleryCategory === cat
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs flex flex-col"
                >
                  <div className="relative aspect-4/3 overflow-hidden cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <span className="text-[11px] text-white font-semibold flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        Click to view
                      </span>
                    </div>

                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-xs">
                      {photo.category}
                    </span>
                  </div>

                  <div className="p-3 bg-white flex-1 flex flex-col justify-between space-y-1">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{photo.title}</h3>
                      {photo.caption && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 font-medium">{photo.caption}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{photo.date || 'Verified'}</span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RULES & FAQ (12. School Rules & 30. FAQs) */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {/* 12. Rules & Discipline */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'hi' ? 'विद्यालय अनुशासन एवं नियम (Rules & Discipline)' : 'Code of Conduct & Discipline'}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              Mandatory rules for all enrolled students at Janta +2 High School:
            </p>

            <div className="space-y-2.5 pt-1">
              {data.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{rule.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-200 text-slate-700">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 30. FAQs */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions (FAQ)'}
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {data.faqs.map((faq) => (
                <div key={faq.id} className="py-3 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Q: {faq.question}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed pl-2 border-l-2 border-blue-500 font-medium">
                    A: {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CONTACT & MAP (4. School Location/Map & 29. School Contact Info) */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          {/* 4. Location & Map */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {language === 'hi' ? 'विद्यालय का पता व मानचित्र (Location & Map)' : 'School Location & Navigation'}
                </h2>
              </div>
              <a
                href={data.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Full Postal Address:</span>
                  <span className="text-slate-600">{data.location.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                <Compass className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Landmarks &amp; Coordinates:</span>
                  <span className="text-slate-600">{data.location.landmark}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                    GPS: {data.location.mapCoordinates} • PIN: {data.location.pinCode}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-slate-600 text-[11px] leading-relaxed">
                <strong>How to reach:</strong> {data.location.howToReach}
              </div>
            </div>

            {/* Simulated Live Map Preview Card */}
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200"
                alt="Map View"
                className="w-full h-full object-cover opacity-60 filter grayscale"
              />
              <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                <div className="p-3 bg-red-600 rounded-full shadow-lg animate-bounce">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black">Janta +2 High School, Khalari</h3>
                <p className="text-xs text-blue-100 max-w-sm">
                  Khalari Railway Station (1.5 km) • Block Office Campus
                </p>
                <a
                  href={data.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 px-4 py-2 bg-white text-blue-900 text-xs font-extrabold rounded-xl shadow-md hover:bg-slate-100 transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-700" />
                  <span>Start Navigation / मार्ग देखें</span>
                </a>
              </div>
            </div>
          </div>

          {/* 29. School Contact Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {language === 'hi' ? 'आधिकारिक संपर्क सूत्र (Official Contact Info)' : 'Official Contact Channels'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Only verified government school office contact information:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Office Hours:</span>
                <span className="font-bold text-slate-900">{data.contactInfo.schoolOfficeHours}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Principal Office:</span>
                <span className="font-bold text-slate-900">{data.contactInfo.principalOffice}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Official Email:</span>
                <a href={`mailto:${data.contactInfo.email}`} className="font-bold text-blue-700 hover:underline">
                  {data.contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Quick Return to Home Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onBack}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं (Back to Home)' : 'Return to Home Dashboard'}</span>
        </button>
      </div>

      {/* Modal: Photo Zoom / Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3 p-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedPhoto.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedPhoto.caption && (
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedPhoto.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal: Admin Add Photo */}
      {isEditModalOpen && editSection === 'photo' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-700" />
                <span>Add School Photo to Gallery</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Sports Day 2026"
                  value={newPhoto.title || ''}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={newPhoto.category || 'Campus'}
                  onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Campus">Campus</option>
                  <option value="Labs & Library">Labs &amp; Library</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Events">Events</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newPhoto.imageUrl || ''}
                  onChange={(e) => setNewPhoto({ ...newPhoto, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief context of the photo..."
                  value={newPhoto.caption || ''}
                  onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  {isSaving ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
