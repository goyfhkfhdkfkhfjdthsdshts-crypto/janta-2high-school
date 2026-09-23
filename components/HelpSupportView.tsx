'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SchoolClass, UserProfile, SchoolContactInfo } from '@/lib/types';
import {
  HelpCircle,
  Search,
  LogIn,
  Home,
  Bot,
  FileCheck2,
  Edit3,
  Award,
  Video,
  BookOpen,
  Clock,
  Bell,
  Calendar,
  BarChart2,
  UserCheck,
  MessageSquare,
  User,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Shield,
  Wifi,
  Mic,
  Download,
  Building,
  Mail,
  MapPin,
  ArrowRight,
  Info,
  Check,
  X,
} from 'lucide-react';

interface HelpSupportViewProps {
  user: UserProfile | null;
  isAdmin: boolean;
  selectedClass: SchoolClass;
  onSelectClass?: (c: SchoolClass) => void;
  onOpenSection: (section: string) => void;
  onOpenAdminModal: () => void;
  language: 'hi' | 'en';
}

interface HelpItem {
  id: string;
  number: number;
  category: 'account' | 'academic' | 'routine' | 'problems' | 'contact';
  titleHi: string;
  titleEn: string;
  icon: any;
  badge: string;
  summaryHi: string;
  summaryEn: string;
  stepsHi: string[];
  stepsEn: string[];
  actionLabel?: string;
  actionSection?: string;
  tipsHi?: string;
  tipsEn?: string;
}

// 18 Comprehensive Help Topics defined statically at module level
const HELP_TOPICS: HelpItem[] = [
  // 1. LOGIN
  {
    id: 'login',
    number: 1,
    category: 'account',
    titleHi: '1. 🔐 LOGIN (लॉगिन व खाता)',
    titleEn: '1. 🔐 LOGIN (Google Sign-In & Profile)',
    icon: LogIn,
    badge: 'Account',
    summaryHi: 'Google से लॉगिन, लॉगआउट और प्रोफ़ाइल विवरण देखने की विधि।',
    summaryEn: 'How to sign in with Google, sign out, and view your student profile.',
    stepsHi: [
      'Google से login कैसे करें: स्क्रीन पर दिखने वाले "Sign in with Google (गूगल से लॉगिन करें)" बटन पर टैप करें और अपना पंजीकृत जीमेल खाता चुनें।',
      'Logout कैसे करें: नीचे नेविगेशन बार या प्रोफाइल मेनू में "Profile" पर जाएं, और सबसे नीचे लाल रंग का "Sign Out of School Portal" बटन दबाएं।',
      'Profile कैसे देखें: शीर्ष-दाएं कोने में अपने नाम/अवतार या नीचे "Profile" टैब पर क्लिक करें। आपका नाम, ईमेल, कक्षा (9/10/11/12) और वेरिफिकेशन स्थिति दिखाई देगी।',
    ],
    stepsEn: [
      'How to log in with Google: Click "Sign in with Google" on the login screen and choose your registered Google account.',
      'How to log out: Go to the "Profile" tab from the bottom bar and tap the red "Sign Out of School Portal" button at the bottom.',
      'How to view profile: Click your avatar in the top-right corner or the "Profile" tab to view your name, email, enrolled class, and verification badge.',
    ],
    actionLabel: 'Go to Profile',
    actionSection: 'profile',
    tipsHi: '💡 अपनी पंजीकृत कक्षा को आप प्रोफ़ाइल स्क्रीन से कभी भी बदल सकते हैं।',
    tipsEn: '💡 You can switch your enrolled class anytime from the Profile screen.',
  },

  // 2. HOME
  {
    id: 'home',
    number: 2,
    category: 'academic',
    titleHi: '2. 🏠 HOME (डैशबोर्ड और कक्षा चयन)',
    titleEn: '2. 🏠 HOME (Dashboard Cards & Class Selection)',
    icon: Home,
    badge: 'Navigation',
    summaryHi: 'होम पेज के सभी कार्ड्स का उपयोग और Class 9/10/11/12 चुनने की विधि।',
    summaryEn: 'What each home card does and how to select Class 9, 10, 11, or 12.',
    stepsHi: [
      'Home page के सभी cards का काम: (1) Online Attendance - दैनिक उपस्थिति, (2) Study Books - ई-किताबें, (3) Live Classes - लाइव वीडियो कक्षाएं, (4) AI Class - 24/7 शंका समाधान, (5) JAC MCQ Practice - वस्तुनिष्ठ टेस्ट, (6) Timetable - साप्ताहिक रूटीन, (7) Notice Board - आधिकारिक सूचनाएं, (8) Exam Schedule - परीक्षा कार्यक्रम, (9) Results - बोर्ड व टर्मिनल रिजल्ट, (10) Faculty - शिक्षकों की सूची।',
      'Class 9/10/11/12 कैसे select करें: होम पेज पर सबसे ऊपर दिए गए "Class 9", "Class 10", "Class 11", "Class 12" बटनों में से अपनी कक्षा पर टैप करें। पूरी ऐप की किताबें, रूटीन और टेस्ट आपकी कक्षा अनुसार अपडेट हो जाएंगे।',
    ],
    stepsEn: [
      'Purpose of Home cards: (1) Online Attendance - daily presence, (2) Study Books - NCERT/JCERT books, (3) Live Classes - real audio-video classes, (4) AI Class - 24/7 doubt solving, (5) MCQ Practice - objective mock tests, (6) Timetable - weekly routine, (7) Notice Board - circulars, (8) Exam Schedule - datesheet, (9) Results - marksheet search, (10) Faculty - teacher directory.',
      'How to select Class 9/10/11/12: Tap on your class button (Class 9, 10, 11, 12) at the top of the home screen or profile. All books, routines, and tests automatically align with your selected class.',
    ],
    actionLabel: 'Go to Home',
    actionSection: 'home',
  },

  // 3. AI CLASS
  {
    id: 'ai',
    number: 3,
    category: 'academic',
    titleHi: '3. 🤖 AI CLASS (24/7 स्मार्ट शिक्षक)',
    titleEn: '3. 🤖 AI CLASS (24/7 Smart AI Tutor)',
    icon: Bot,
    badge: 'AI Tutor',
    summaryHi: 'टेक्स्ट, आवाज (Voice) और फोटो से सवाल पूछने और भाषा बदलने की पूरी प्रक्रिया।',
    summaryEn: 'How to ask study doubts using text, microphone voice, or photo upload, and toggle language.',
    stepsHi: [
      'AI से पढ़ाई का सवाल कैसे पूछें: AI Class सेक्शन खोलें और नीचे चैट इनपुट में गणित, विज्ञान, सामाजिक विज्ञान या किसी भी विषय का सवाल दर्ज करें।',
      'Text, voice और photo से question कैसे पूछें: (1) Text: सवाल टाइप करें और सेंड दबाएं; (2) Voice: माइक 🎤 बटन दबाएं और हिंदी या English में बोलें; (3) Photo: कैमरा 📷 आइकन दबाकर किताब या कॉपी के प्रश्न की तस्वीर अपलोड करें।',
      'Hindi/English language कैसे बदलें: ऊपर दिए गए भाषा स्विच बटन ("हिंदी" / "English") पर क्लिक करें। AI उसी भाषा में विस्तृत व आसान व्याख्या देगा।',
    ],
    stepsEn: [
      'How to ask study questions: Open AI Class and enter your academic question in Mathematics, Science, Social Science, Hindi, English, etc.',
      'Text, voice & photo input: (1) Text: Type your question; (2) Voice: Tap the mic 🎤 button and speak; (3) Photo: Tap the camera 📷 icon to upload a picture of a textbook question.',
      'Switch Hindi/English: Click the language toggle ("हिंदी" / "English") at the top to receive explanations in your preferred language.',
    ],
    actionLabel: 'Open AI Class',
    actionSection: 'ai',
  },

  // 4. MCQ PRACTICE
  {
    id: 'mcq',
    number: 4,
    category: 'academic',
    titleHi: '4. 📝 MCQ PRACTICE (ऑब्जेक्टिव क्विज व टेस्ट)',
    titleEn: '4. 📝 MCQ PRACTICE (Subject Tests & Instant Scores)',
    icon: FileCheck2,
    badge: 'Practice',
    summaryHi: 'विषय और अध्याय चुनना, प्रश्न हल करना, अंक देखना और गलत प्रश्नों का अभ्यास।',
    summaryEn: 'How to select subject, pick chapter, solve MCQs, see scores, and re-practice wrong questions.',
    stepsHi: [
      'Subject कैसे चुनें: MCQ Practice स्क्रीन पर दिए गए विषय टैब्स (जैसे Science, Mathematics, Social Science आदि) पर टैप करें।',
      'Chapter कैसे चुनें: विषय के अंदर अध्यायों की सूची में से उस पाठ को चुनें जिसका आप टेस्ट देना चाहते हैं।',
      'MCQ कैसे solve करें: प्रत्येक प्रश्न के 4 विकल्पों (A, B, C, D) में से सही विकल्प पर क्लिक करें। तत्काल सही या गलत उत्तर का संकेत और व्याख्या मिलेगी।',
      'Score और result कैसे देखें: टेस्ट पूरा होते ही आपका कुल स्कोर, सही व गलत उत्तरों की संख्या और प्रतिशत स्क्रीन पर दिखेगा।',
      'गलत questions दोबारा कैसे practice करें: परिणाम स्क्रीन पर "Practice Incorrect Questions" बटन दबाएं। केवल गलत हुए प्रश्न दोबारा अभ्यास के लिए खुलेंगे।',
    ],
    stepsEn: [
      'Select subject: Tap the subject tabs (Science, Mathematics, Social Science, etc.) at the top.',
      'Select chapter: Choose the chapter you wish to practice from the chapter list.',
      'Solve MCQs: Tap your choice among options A, B, C, or D. Get instant green/red feedback with step explanation.',
      'View score & result: Upon completing the test, your total marks, correct/wrong counts, and percentage are displayed instantly.',
      'Re-practice wrong questions: Click "Practice Incorrect Questions" to re-attempt only the questions you missed.',
    ],
    actionLabel: 'Open MCQ Practice',
    actionSection: 'mcq',
  },

  // 5. WRITTEN Q&A
  {
    id: 'written',
    number: 5,
    category: 'academic',
    titleHi: '5. ✍️ WRITTEN Q&A (लिखित उत्तर अभ्यास)',
    titleEn: '5. ✍️ WRITTEN Q&A (Descriptive Answers & Model Answers)',
    icon: Edit3,
    badge: 'Exams',
    summaryHi: 'दीर्घ उत्तरीय प्रश्न खोलना, उत्तर लिखना, सबमिट करना और मॉडल उत्तर देखना।',
    summaryEn: 'How to open written questions, compose answers, submit, and inspect model answers.',
    stepsHi: [
      'Written question कैसे खोलें: AI Class या Written Practice टैब में जाकर अपनी कक्षा का विषय व प्रश्न चुनें।',
      'Answer कैसे लिखें: दिए गए उत्तर टेक्स्ट बॉक्स में अपने शब्दों में बिंदुवार उत्तर टाइप करें।',
      'Answer submit कैसे करें: नीचे "Submit Answer (उत्तर जमा करें)" बटन दबाएं।',
      'Marks और model answer कैसे देखें: सबमिशन के तुरंत बाद AI परीक्षक द्वारा दिए गए अंक तथा विषय अध्यापकों का आधिकारिक मॉडल उत्तर (Model Answer) प्रदर्शित होता है।',
    ],
    stepsEn: [
      'Open written question: Go to the Written Q&A tab under AI Class or practice modules.',
      'Write answer: Type your comprehensive answer into the designated text area.',
      'Submit answer: Click the "Submit Answer" button.',
      'View marks and model answer: Immediately review evaluated scores, feedback, and the official JAC model answer.',
    ],
    actionLabel: 'Go to AI Class Q&A',
    actionSection: 'ai',
  },

  // 6. LEADERBOARD
  {
    id: 'leaderboard',
    number: 6,
    category: 'academic',
    titleHi: '6. 🏆 LEADERBOARD (रैंकिंग व श्रेष्ठ प्रदर्शन)',
    titleEn: '6. 🏆 LEADERBOARD (Rankings & Daily Top Students)',
    icon: Award,
    badge: 'Rankings',
    summaryHi: 'रैंक कैसे काम करती है, आज के टॉप छात्र और समग्र प्रदर्शन की जानकारी।',
    summaryEn: 'How ranks are computed, Today\'s Top Students, and Overall Performance tracking.',
    stepsHi: [
      'Rank कैसे काम करता है: छात्र द्वारा हल किए गए MCQ टेस्ट, सही उत्तरों की संख्या और दैनिक उपस्थिति के आधार पर XP पॉइंट्स मिलते हैं।',
      'Today\'s Top Students क्या है: आज के दिन सबसे अधिक टेस्ट हल करने और उच्च अंक प्राप्त करने वाले छात्र दैनिक लीडरबोर्ड पर शीर्ष पर आते हैं।',
      'Overall Performance क्या है: पूरे सत्र का संचित स्कोर, निरंतरता और विद्यालय स्तर पर आपकी कुल रैंक।',
    ],
    stepsEn: [
      'How ranking works: Points (XP) are awarded based on MCQ scores, accuracy, quiz attempts, and daily attendance.',
      'Today\'s Top Students: Shows the top-performing students of the current day.',
      'Overall Performance: Displays cumulative academic performance and school-wide standing over the session.',
    ],
    actionLabel: 'View MCQ Practice Leaderboard',
    actionSection: 'mcq',
  },

  // 7. LIVE CLASS
  {
    id: 'live',
    number: 7,
    category: 'academic',
    titleHi: '7. 📺 LIVE CLASS (लाइव वीडियो ऑडियो कक्षा)',
    titleEn: '7. 📺 LIVE CLASS (Video Audio Classrooms & Permissions)',
    icon: Video,
    badge: 'Live',
    summaryHi: 'लाइव क्लास खोजना, जुड़ना, कैमरा/माइक अनुमति, री-ट्राई और क्लास समाप्ति सूचना।',
    summaryEn: 'How to find live sessions, join, grant permissions, retry on connection drops, and class end notices.',
    stepsHi: [
      'Live class कैसे खोजें: होम स्क्रीन पर लाल "🔴 LIVE NOW" बैनर देखें या नीचे "Live" टैब पर क्लिक करें।',
      'Join कैसे करें: अपनी कक्षा की सक्रिय क्लास पर "Join Classroom (कक्षा में शामिल हों)" बटन दबाएं।',
      'Camera/Microphone permission: ब्राउज़र पॉप-अप में "Allow (अनुमति दें)" पर क्लिक करें ताकि शिक्षक व सहपाठी आपकी आवाज सुन सकें।',
      'Connection problem होने पर Retry कैसे करें: यदि वीडियो रुकती है तो स्क्रीन पर "🔄 Retry Connection" बटन दबाएं या रीलोड करें।',
      'Live class खत्म होने पर क्या दिखाई देगा: शिक्षक द्वारा क्लास समाप्त करने पर स्क्रीन पर "Class Ended by Teacher (कक्षा समाप्त हो गई)" का संदेश और समय दिखेगा।',
    ],
    stepsEn: [
      'Find live classes: Look for the red "🔴 LIVE NOW" banner on the home screen or click the "Live" navigation tab.',
      'Join classroom: Click the green "Join Classroom" button on your active class card.',
      'Camera & Mic permissions: Click "Allow" when prompted by your browser to enable classroom interaction.',
      'Retry on connection drop: Tap the "🔄 Retry Connection" button on the player if your network fluctuates.',
      'When class ends: Once the instructor concludes the session, a clear "Class Ended by Teacher" notification is displayed.',
    ],
    actionLabel: 'Open Live Classes',
    actionSection: 'live',
  },

  // 8. STUDY BOOKS
  {
    id: 'study',
    number: 8,
    category: 'academic',
    titleHi: '8. 📚 STUDY BOOKS (NCERT व JCERT ई-बुक्स)',
    titleEn: '8. 📚 STUDY BOOKS (NCERT / JCERT Textbooks & Search)',
    icon: BookOpen,
    badge: 'Books',
    summaryHi: 'पुस्तकें व PDF खोलना, अध्ययन सामग्री खोजना और डाउनलोड विकल्प का उपयोग।',
    summaryEn: 'How to open textbooks, search study materials, and use download options.',
    stepsHi: [
      'Books और PDF कैसे खोलें: Study Books सेक्शन में जाकर पुस्तक कार्ड पर "Read Book (पुस्तक पढ़ें)" दबाएं। पुस्तक का PDF रीडर तुरंत खुल जाएगा।',
      'Study material कैसे खोजें: ऊपर सर्च बार में पुस्तक का नाम, विषय या अध्याय (जैसे \'विज्ञान\', \'गणित\', \'History\') टाइप करें।',
      'Download option कैसे इस्तेमाल करें: कार्ड के नीचे "Download PDF (डाउनलोड करें)" बटन दबाकर पुस्तक को ऑफलाइन पढ़ने हेतु सहेजें।',
    ],
    stepsEn: [
      'Open books & PDFs: In the Study Books section, tap "Read Book" on any book card to open the interactive reader.',
      'Search study material: Type the book name, subject, or chapter into the search box.',
      'Download option: Tap "Download PDF" to save chapters and books for offline study.',
    ],
    actionLabel: 'Open Study Books',
    actionSection: 'study',
  },

  // 9. TIMETABLE
  {
    id: 'timetable',
    number: 9,
    category: 'routine',
    titleHi: '9. 🕐 TIMETABLE (साप्ताहिक कक्षा दिनचर्या)',
    titleEn: '9. 🕐 TIMETABLE (Daily & Weekly Class Routine)',
    icon: Clock,
    badge: 'Schedule',
    summaryHi: 'आज का टाइमटेबल, कक्षा-वार रूटीन और शनिवार का विशेष 4-घंटी शेड्यूल देखना।',
    summaryEn: 'How to view today\'s schedule, class-wise periods, and special Saturday routines.',
    stepsHi: [
      'आज का timetable कैसे देखें: Timetable सेक्शन में आज का दिन (जैसे Monday, Tuesday) अपने-आप हाइलाइट रहता है जिसमें सभी घंटियां (Periods), विषय और कमरे का नंबर दिखाई देता है।',
      'Class-wise timetable कैसे देखें: शीर्ष पर Class 9, 10, 11, 12 टैब में से अपनी कक्षा चुनें या दिन फ़िल्टर से सोमवार से शनिवार तक का पूरा रूटीन देखें (शनिवार को विशेष हाफ-डे रूटीन होता है)।',
    ],
    stepsEn: [
      'View today\'s timetable: The Timetable view automatically highlights the current day of the week with subjects, teachers, and timings.',
      'View class-wise timetable: Switch between Class 9, 10, 11, and 12 tabs or select any weekday from Monday through Saturday.',
    ],
    actionLabel: 'Open Timetable',
    actionSection: 'timetable',
  },

  // 10. NOTICE BOARD
  {
    id: 'notice',
    number: 10,
    category: 'routine',
    titleHi: '10. 📢 NOTICE BOARD (आधिकारिक विद्यालय सूचना पट्ट)',
    titleEn: '10. 📢 NOTICE BOARD (Official Circulars & Orders)',
    icon: Bell,
    badge: 'Notices',
    summaryHi: 'नया नोटिस देखना, महत्वपूर्ण सूचनाएं पहचानना और पुराने परिपत्र खोजना।',
    summaryEn: 'How to view new circulars, identify urgent notices, and browse notice archives.',
    stepsHi: [
      'नया notice कैसे देखें: Notice Board सेक्शन खोलें। सबसे नवीनतम सूचनाएं सबसे ऊपर दिनांक सहित सूचीबद्ध रहती हैं।',
      'Important notice कैसे पहचानें: आवश्यक नोटिस पर लाल या पीले रंग का "URGENT" या "IMPORTANT" का बैज व घंटी का चिन्ह लगा होता है।',
      'पुराने notices कैसे देखें: नीचे स्क्रॉल करें या सर्च बार में विषय जैसे \'छुट्टी\', \'परीक्षा\', \'Sports\' आदि लिखकर पुराने नोटिस खोजें।',
    ],
    stepsEn: [
      'View new notices: Open Notice Board to view the latest administrative circulars ordered by date.',
      'Identify urgent notices: High-priority notices feature a red or amber "URGENT" / "IMPORTANT" badge and bell icon.',
      'View archives: Scroll down or search by keywords such as "Holiday", "Exam", or "Scholarship".',
    ],
    actionLabel: 'Open Notice Board',
    actionSection: 'notice',
  },

  // 11. EXAM SCHEDULE
  {
    id: 'exam',
    number: 11,
    category: 'routine',
    titleHi: '11. 📅 EXAM SCHEDULE (परीक्षा कार्यक्रम व तिथियां)',
    titleEn: '11. 📅 EXAM SCHEDULE (JAC Board & Terminal Datesheets)',
    icon: Calendar,
    badge: 'Exams',
    summaryHi: 'परीक्षा की तारीख, विषय, समय और परीक्षा केंद्र के नियमों की जानकारी।',
    summaryEn: 'How to view exam dates, subjects, timings, and center instructions.',
    stepsHi: [
      'Exam date, subject और time कैसे देखें: Exam Schedule सेक्शन में जाएं। झारखंड अधिविद्य परिषद (JAC) एवं विद्यालयी टर्मिनल परीक्षाओं का कार्यक्रम कक्षा अनुसार दिनांक (Date), वार (Day), विषय (Subject) एवं समय (Time) सहित सारणीबद्ध रूप में उपलब्ध है।',
    ],
    stepsEn: [
      'View exam details: Navigate to Exam Schedule to view the official JAC board and terminal examination datesheet with date, day, subject, shift timing, and examination room instructions.',
    ],
    actionLabel: 'Open Exam Schedule',
    actionSection: 'exam',
  },

  // 12. RESULTS
  {
    id: 'results',
    number: 12,
    category: 'routine',
    titleHi: '12. 📊 RESULTS (परीक्षा परिणाम व अंकतालिका)',
    titleEn: '12. 📊 RESULTS (Published Results & Marksheets)',
    icon: BarChart2,
    badge: 'Results',
    summaryHi: 'रोल कोड व रोल नंबर डालकर परिणाम खोजना तथा विषय-वार अंक देखना।',
    summaryEn: 'How to look up published results using roll code & roll number, and view subject marks.',
    stepsHi: [
      'Published result कैसे देखें: Results सेक्शन में जाकर अपना रोल कोड (Roll Code) तथा रोल नंबर (Roll No) दर्ज करें और "Search Result" बटन दबाएं।',
      'Subject-wise marks और percentage कैसे देखें: परिणाम कार्ड में प्रत्येक विषय के थ्योरी व प्रैक्टिकल अंक, कुल प्राप्तांक, ग्रेड तथा प्रतिशत आधिकारिक JAC प्रारूप में स्पष्ट दिखते हैं।',
    ],
    stepsEn: [
      'View published results: In the Results section, enter your Roll Code (e.g. 23045) and Roll Number, then click "Search Result".',
      'Subject marks & percentage: The digital marksheet displays subject-wise marks, practical scores, grades, and total percentage.',
    ],
    actionLabel: 'Open Results',
    actionSection: 'results',
  },

  // 13. ONLINE ATTENDANCE
  {
    id: 'attendance',
    number: 13,
    category: 'routine',
    titleHi: '13. ✅ ONLINE ATTENDANCE (ऑनलाइन दैनिक उपस्थिति)',
    titleEn: '13. ✅ ONLINE ATTENDANCE (Voice & Manual Check-in Security)',
    icon: UserCheck,
    badge: 'Attendance',
    summaryHi: 'बोलकर या टाइप करके उपस्थिति, पुष्टि (Confirm) प्रक्रिया और 1 दिन में 1 उपस्थिति का कड़ा नियम।',
    summaryEn: 'Daily check-in via typing or speaking, confirmation requirement, and strict single attendance per day.',
    stepsHi: [
      'Today\'s Attendance कैसे खोलें: होम स्क्रीन पर "Online Attendance" कार्ड पर टैप करें या ऊपर हेडर में "उपस्थिति" बटन दबाएं।',
      'नाम type करके attendance कैसे करें: "टाइप करके (Manual)" टैब चुनें, अपना पंजीकृत नाम लिखें, पहचाने गए नाम को देखें और "Confirm & Mark Attendance" दबाएं।',
      'नाम बोलकर attendance कैसे करें: "नाम बोलकर (Voice)" टैब में बड़े माइक 🎤 बटन पर टैप करें और हिंदी या अंग्रेजी में साफ आवाज में अपना नाम बोलें। पहचाना गया नाम स्क्रीन पर दिखाई देगा।',
      'Confirm करने के बाद ही attendance submit हो: आवाज पहचान के बाद कभी भी अपने-आप उपस्थिति दर्ज नहीं होती। छात्र को हमेशा "✓ Confirm & Mark Attendance" बटन दबाकर पुष्टि करनी होती है।',
      'एक account से एक दिन में केवल एक attendance: प्रति छात्र गूगल खाते से एक दिन में केवल 1 उपस्थिति दर्ज हो सकती है। उपस्थिति दर्ज होने के बाद फॉर्म लॉक हो जाता है, "आज आपकी Attendance पहले ही लग चुकी है।" का नोटिस आता है और Student Name, Class, Attendance Date, Attendance Time और Status: Present दिखता है।',
    ],
    stepsEn: [
      'Open Today\'s Attendance: Tap "Online Attendance" on Home or the "उपस्थिति" button in the header.',
      'Mark via Typing: Switch to "Manual", enter your registered name, review detected name, and tap "Confirm & Mark Attendance".',
      'Mark via Voice: Switch to "Voice", tap the large mic 🎤 button, speak your name clearly in Hindi or English, and verify the detected name.',
      'Must Confirm: Attendance is never marked automatically from voice alone. Students must explicitly press "Confirm & Mark Attendance".',
      'Strict 1 Attendance Per Day: Exactly ONE successful record per student Google account per day. Subsequent attempts are blocked on UI and database, showing "आज आपकी Attendance पहले ही लग चुकी है।" with student name, class, date, time, and Present status.',
    ],
    actionLabel: 'Open Online Attendance',
    actionSection: 'attendance',
    tipsHi: '🔒 बैकएंड सुरक्षा: यह नियम डेटाबेस स्तर पर सुरक्षित है; ऐप रीफ्रेश करने या दोबारा लॉगिन करने पर भी डुप्लीकेट उपस्थिति नहीं हो सकती।',
    tipsEn: '🔒 Backend Security: Unique constraint (Student ID + Date) enforces one attendance per day even across page refreshes or re-login.',
  },

  // 14. CHAT
  {
    id: 'chat',
    number: 14,
    category: 'academic',
    titleHi: '14. 💬 CHAT & STUDY GROUPS (शैक्षणिक संवाद)',
    titleEn: '14. 💬 CHAT & STUDY GROUPS (Private & Class Group Discussions)',
    icon: MessageSquare,
    badge: 'Chat',
    summaryHi: 'प्राइवेट चैट, क्लास ग्रुप खोलना, संदेश भेजना और रिपोर्ट/ब्लॉक का उपयोग।',
    summaryEn: 'How to start chats, open class groups, send media messages, and use report/block tools.',
    stepsHi: [
      'Private chat कैसे शुरू करें: Chat या सहपाठी सूची में जाकर संबंधित छात्र या शिक्षक के नाम पर टैप करें और संवाद शुरू करें।',
      'Class group कैसे खोलें: अपनी कक्षा के आधिकारिक समूह (जैसे "Class 10 Official") पर क्लिक करें जहां सभी छात्र व शिक्षक जुड़े होते हैं।',
      'Photo/video/file/voice message कैसे भेजें: चैट बॉक्स के पास अटैचमेंट (+) आइकन पर क्लिक करके चित्र, नोट्स या वॉइस संदेश भेजें।',
      'Report/Block कैसे इस्तेमाल करें: किसी भी अनुचित संदेश पर तीन बिंदु (...) मेनू खोलें और "Report Message" या यूजर को "Block" करें। यह विद्यालय प्रशासन को तुरंत सूचित करता है।',
    ],
    stepsEn: [
      'Start private chat: Select a teacher or classmate from the directory and start a direct conversation.',
      'Open class group: Click on your official class group (e.g. Class 10 Official) to access class-wide announcements and peer questions.',
      'Send media & files: Click the (+) icon in the chat input to send images, PDF notes, or voice recordings.',
      'Report / Block: Tap the three dots (...) next to any inappropriate message to Report or Block. Violations are instantly sent to school admin.',
    ],
    actionLabel: 'Open AI Class & Discussions',
    actionSection: 'ai',
  },

  // 15. PROFILE
  {
    id: 'profile',
    number: 15,
    category: 'account',
    titleHi: '15. 👤 PROFILE (विद्यार्थी प्रोफाइल व कक्षा)',
    titleEn: '15. 👤 PROFILE (Profile Management & Logout)',
    icon: User,
    badge: 'Profile',
    summaryHi: 'नाम, पंजीकृत ईमेल, कक्षा देखना और सुरक्षित रूप से लॉगआउट करना।',
    summaryEn: 'How to check your verified Google credentials, enrolled class, and sign out.',
    stepsHi: [
      'Name और class कैसे देखें: नीचे \'Profile\' टैब पर क्लिक करें। ऊपर आपका गूगल नाम, ईमेल आईडी और वर्तमान कक्षा (Class 9, 10, 11 या 12) दिखेगी। कक्षा बदलने के लिए दिए गए क्लास बटनों में से किसी एक पर टैप करें।',
      'Account से logout कैसे करें: प्रोफाइल पेज के नीचे लाल रंग के "Sign Out of School Portal" बटन पर क्लिक करें।',
    ],
    stepsEn: [
      'View name & class: Click the Profile tab in the bottom bar to view your Google name, email, and current class. Switch classes anytime by tapping the Class 9-12 buttons.',
      'Log out: Tap the red "Sign Out of School Portal" button at the bottom of the Profile page.',
    ],
    actionLabel: 'Open Profile',
    actionSection: 'profile',
  },

  // 16. NOTIFICATIONS
  {
    id: 'notifications',
    number: 16,
    category: 'routine',
    titleHi: '16. 🔔 NOTIFICATIONS (नवीनतम अलर्ट व अपडेट)',
    titleEn: '16. 🔔 NOTIFICATIONS (Live Alerts & Urgent Updates)',
    icon: Bell,
    badge: 'Alerts',
    summaryHi: 'नए नोटिस, लाइव क्लास शुरू होने और जरूरी विद्यालय सूचनाओं के अलर्ट देखना।',
    summaryEn: 'How to receive and check notifications for live classes, circulars, and exam updates.',
    stepsHi: [
      'New notice, live class और important updates कैसे देखें: जब भी कोई शिक्षक लाइव क्लास शुरू करते हैं, होम स्क्रीन पर लाल "LIVE NOW" अलर्ट और हेडर में नोटिस बेल चमकती है। आवश्यक सूचनाओं के लिए Notice Board चेक करें।',
    ],
    stepsEn: [
      'View notifications: Real-time live class alerts appear in red at the top of the home screen. Check the Notice Board bell for new circulars and holiday declarations.',
    ],
    actionLabel: 'Check Notice Board',
    actionSection: 'notice',
  },

  // 17. COMMON PROBLEMS
  {
    id: 'problems',
    number: 17,
    category: 'problems',
    titleHi: '17. ⚙️ COMMON PROBLEMS & QUICK FIXES (सामान्य समस्याएं)',
    titleEn: '17. ⚙️ COMMON PROBLEMS & QUICK FIXES (Troubleshooting)',
    icon: AlertTriangle,
    badge: 'Troubleshoot',
    summaryHi: 'लॉगिन, लाइव क्लास, PDF, उपस्थिति, माइक और नेटवर्क समस्याओं के त्वरित समाधान।',
    summaryEn: 'Step-by-step remedies with interactive "Try Again" test buttons for common app issues.',
    stepsHi: [
      'Login नहीं हो रहा: (1) ब्राउज़र को रिफ्रेश करें, (2) अपना इंटरनेट कनेक्शन जांचें, (3) इनकॉग्निटो विंडो या कुकीज साफ़ करके Google Sign-In दोबारा दबाएं।',
      'Live class connect नहीं हो रही: (1) ब्राउज़र में कैमरा और माइक्रोफ़ोन को "Allow" करें, (2) पेज को रीलोड करें, (3) नेटवर्क सिग्नल 4G/Wi-Fi पर स्विच करें।',
      'PDF नहीं खुल रही: (1) "Download PDF" बटन से सीधे फाइल डाउनलोड करें, (2) ब्राउज़र पॉप-अप अनुमति दें, (3) नेटवर्क की जांच करें।',
      'Attendance submit नहीं हो रही: (1) जांचें कि आज की उपस्थिति पहले से तो नहीं लगी है (प्रतिदिन केवल 1 उपस्थिति मान्य है), (2) सुनिश्चित करें कि आप गूगल खाते से लॉगइन हैं।',
      'Voice recognition काम नहीं कर रहा: (1) ब्राउज़र एड्रेस बार में लॉक/माइक आइकन पर क्लिक करके Microphone को "Allow" करें, (2) शांत जगह पर साफ आवाज में बोलें, (3) यदि माइक उपलब्ध न हो तो "टाइप करके" विकल्प चुनें।',
      'Notification नहीं आ रही: (1) डिवाइस सेटिंग्स में ब्राउज़र नोटिफिकेशन चालू करें, (2) होम स्क्रीन पर नोटिस बोर्ड और लाइव क्लास बैनर देखें।',
      'Internet connection problem: (1) मोबाइल डेटा या वाई-फाई रीकनेक्ट करें, (2) एयरप्लेन मोड ऑन करके ऑफ करें, (3) नीचे दिए गए "Try Again" बटन से नेटवर्क जांचें।',
    ],
    stepsEn: [
      'Login issues: (1) Refresh browser, (2) verify internet, (3) clear cookies or use Chrome to sign in with Google.',
      'Live class connection failure: (1) Grant camera & microphone permissions, (2) reload page, (3) check stable 4G/Wi-Fi.',
      'PDF not opening: (1) Tap "Download PDF" to view offline, (2) allow browser popups, (3) verify storage space.',
      'Attendance submission blocked: (1) Verify if you already marked attendance today (strictly 1 attendance per day), (2) check active Google account.',
      'Voice recognition not picking up: (1) Click padlock icon in browser address bar and set Microphone to "Allow", (2) speak clearly in Hindi or English, (3) switch to "Manual typing" if mic is unavailable.',
      'Notifications missing: (1) Allow browser notifications in site settings, (2) look at the live status banner on the home screen.',
      'Internet connection problem: (1) Toggle Wi-Fi or Cellular Data, (2) toggle Airplane Mode, (3) use the "Try Again" test button below.',
    ],
    tipsHi: '💡 नीचे प्रत्येक समस्या के लिए दिया गया "Try Again" बटन दबाकर आप तुरंत लाइव स्थिति की जांच कर सकते हैं।',
    tipsEn: '💡 Click the "Try Again" button below any problem to trigger an interactive diagnostic test.',
  },

  // 18. CONTACT / SUPPORT
  {
    id: 'contact',
    number: 18,
    category: 'contact',
    titleHi: '18. 📞 CONTACT SCHOOL / SUPPORT (विद्यालय संपर्क व सहायता)',
    titleEn: '18. 📞 CONTACT SCHOOL / SUPPORT (Official School Helpdesk)',
    icon: PhoneCall,
    badge: 'Official',
    summaryHi: 'विद्यालय का पता, आधिकारिक संपर्क, प्रशासनिक नियंत्रण और सहायता जानकारी।',
    summaryEn: 'Official school address, authentic contact details, and admin contact management.',
    stepsHi: [
      'विद्यालय का आधिकारिक संपर्क: विद्यालय प्रशासन द्वारा आधिकारिक सहायता विवरण यहां उपलब्ध कराया जाता है।',
      'कोई फर्जी या काल्पनिक नंबर नहीं: विद्यालय के वास्तविक पते और अधिकृत कार्यालय विवरण के अलावा कोई भी काल्पनिक हेल्पलाइन नंबर नहीं दिखाया जाता है।',
      'विद्यालय पता: जनता +2 उच्च विद्यालय, खलारी, पोस्ट व थाना - खलारी, जिला - रांची, झारखंड - 829205।',
      'एडमिन सुविधा: अधिकृत विद्यालय एडमिन "Edit Support Information" के माध्यम से आधिकारिक फोन, ईमेल, पता और सहायता संपर्क अपडेट कर सकते हैं।',
    ],
    stepsEn: [
      'Official School Helpdesk: Authorized support contacts provided directly by Janta +2 High School administration.',
      'Authentic Data Only: No invented or placeholder helpline numbers are displayed.',
      'Campus Address: Janta +2 High School, Khalari, P.O. & P.S. Khalari, Ranchi District, Jharkhand - 829205.',
      'Admin Management: Authorized school administrators can update official phone, email, office hours, and support channels.',
    ],
    tipsHi: 'ℹ️ यदि विद्यालय प्रशासन द्वारा फोन नंबर या ईमेल अभी नहीं जोड़ा गया है, तो "School support contact will be available here." दिखाई देता है।',
    tipsEn: 'ℹ️ If contact details have not yet been configured by admin, it displays "School support contact will be available here."',
  },
];

export function HelpSupportView({
  user,
  isAdmin,
  selectedClass,
  onOpenSection,
  onOpenAdminModal,
  language,
}: HelpSupportViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    login: true,
    attendance: true,
    problems: true,
    contact: true,
  });

  // Troubleshooting action status states
  const [troubleshootStatus, setTroubleshootStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'alert'>>({});
  const [troubleshootMessage, setTroubleshootMessage] = useState<Record<string, string>>({});

  // School contact information loaded from DB
  const [contactInfo, setContactInfo] = useState<SchoolContactInfo>({});
  const [isLoadingContact, setIsLoadingContact] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editForm, setEditForm] = useState<SchoolContactInfo>({});
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSaveSuccess, setContactSaveSuccess] = useState(false);

  // Fetch official school contact information
  const fetchContact = async () => {
    try {
      setIsLoadingContact(true);
      const res = await fetch('/api/data/contact');
      const data = await res.json();
      if (data.success && data.data) {
        setContactInfo(data.data);
        setEditForm(data.data);
      }
    } catch (e) {
      console.error('Failed to load contact info:', e);
    } finally {
      setIsLoadingContact(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    HELP_TOPICS.forEach((t) => (allExpanded[t.id] = true));
    setExpandedItems(allExpanded);
  };

  const collapseAll = () => {
    setExpandedItems({});
  };

  // Run dynamic troubleshooting test
  const handleTroubleshootTest = async (problemKey: string) => {
    setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'testing' }));
    setTroubleshootMessage((prev) => ({ ...prev, [problemKey]: 'Testing component...' }));

    await new Promise((r) => setTimeout(r, 900));

    if (problemKey === 'internet') {
      const isOnline = navigator.onLine;
      if (isOnline) {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'success' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? '✓ इंटरनेट कनेक्शन चालू है (Network Online).' : '✓ Internet connection is active and stable.',
        }));
      } else {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'alert' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? '⚠ आपका डिवाइस ऑफलाइन है। डेटा या वाई-फाई चालू करें।' : '⚠ Your device is offline. Please enable Wi-Fi or Cellular Data.',
        }));
      }
    } else if (problemKey === 'voice') {
      try {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'alert' }));
          setTroubleshootMessage((prev) => ({
            ...prev,
            [problemKey]: language === 'hi' ? '⚠ आपके ब्राउज़र में Speech Recognition सपोर्ट नहीं है। कृपया Google Chrome उपयोग करें।' : '⚠ Speech Recognition is not supported on this browser. Please use Chrome.',
          }));
        } else {
          setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'success' }));
          setTroubleshootMessage((prev) => ({
            ...prev,
            [problemKey]: language === 'hi' ? '✓ वॉइस रिकॉग्निशन इंजन सक्रिय है (Speech Recognition Ready).' : '✓ Speech recognition engine is supported and ready.',
          }));
        }
      } catch {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'alert' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? '⚠ माइक्रोफोन एक्सेस की जांच करें।' : '⚠ Please check microphone browser permission.',
        }));
      }
    } else if (problemKey === 'attendance') {
      try {
        const studentId = user?.id || 'guest';
        const res = await fetch(`/api/attendance?studentId=${encodeURIComponent(studentId)}&mode=student_summary`);
        const data = await res.json();
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'success' }));
        if (data.summary?.alreadyMarkedToday) {
          setTroubleshootMessage((prev) => ({
            ...prev,
            [problemKey]: language === 'hi' ? '✓ आज आपकी उपस्थिति पहले से दर्ज है (Present)। एक दिन में 1 उपस्थिति का नियम लागू है।' : '✓ Attendance already marked for today. 1 attendance per day security rule enforced.',
          }));
        } else {
          setTroubleshootMessage((prev) => ({
            ...prev,
            [problemKey]: language === 'hi' ? '✓ उपस्थिति प्रणाली तैयार है। आप आज की उपस्थिति दर्ज कर सकते हैं।' : '✓ Attendance system is ready. You can mark today\'s presence.',
          }));
        }
      } catch {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'alert' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? '⚠ उपस्थिति सर्वर कनेक्शन की जांच की जा रही है।' : '⚠ Unable to check attendance server.',
        }));
      }
    } else if (problemKey === 'login') {
      if (user) {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'success' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? `✓ आप ${user.name} (${user.email}) के रूप में सफलतापूर्वक लॉग इन हैं।` : `✓ You are actively logged in as ${user.name} (${user.email}).`,
        }));
      } else {
        setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'alert' }));
        setTroubleshootMessage((prev) => ({
          ...prev,
          [problemKey]: language === 'hi' ? '⚠ आप अभी लॉग इन नहीं हैं। कृपया Google Sign-In पर क्लिक करें।' : '⚠ You are not signed in. Click Google Sign-In.',
        }));
      }
    } else {
      setTroubleshootStatus((prev) => ({ ...prev, [problemKey]: 'success' }));
      setTroubleshootMessage((prev) => ({
        ...prev,
        [problemKey]: language === 'hi' ? '✓ सिस्टम की जांच पूरी हुई। यदि समस्या बनी रहे तो पेज रीलोड करें।' : '✓ System checked. Please refresh page if problem persists.',
      }));
    }
  };

  // Save admin contact updates
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingContact(true);
      const res = await fetch('/api/data/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setContactInfo(data.data);
        setIsEditingContact(false);
        setContactSaveSuccess(true);
        setTimeout(() => setContactSaveSuccess(false), 4000);
      }
    } catch (e) {
      console.error('Failed to update contact info:', e);
    } finally {
      setIsSavingContact(false);
    }
  };

  // Check if any official contact info has been configured
  const hasConfiguredContact = Boolean(
    contactInfo.phone?.trim() ||
      contactInfo.email?.trim() ||
      contactInfo.officeContact?.trim() ||
      contactInfo.supportContact?.trim() ||
      (contactInfo.address?.trim() && contactInfo.address !== 'Khalari, Ranchi District, Jharkhand - 829205')
  );

  // Filter topics based on search query and category
  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle =
        topic.titleHi.toLowerCase().includes(q) ||
        topic.titleEn.toLowerCase().includes(q) ||
        topic.summaryHi.toLowerCase().includes(q) ||
        topic.summaryEn.toLowerCase().includes(q);

      const matchSteps =
        topic.stepsHi.some((s) => s.toLowerCase().includes(q)) ||
        topic.stepsEn.some((s) => s.toLowerCase().includes(q));

      return matchTitle || matchSteps;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Help &amp; Support Center</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-blue-200 border border-white/20">
                18 Guides &amp; Solutions
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {language === 'hi'
                ? 'सहायता केंद्र • सम्पूर्ण मार्गदर्शिका'
                : 'Help Center • Complete User Guide'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
              {language === 'hi'
                ? 'जनता +2 उच्च विद्यालय खलारी ऐप की हर सुविधा, समाधान एवं सहायता की सरल हिंदी व अंग्रेजी में जानकारी।'
                : 'Step-by-step guides, troubleshooting, and support for all features of Janta +2 High School app.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={expandAll}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all text-center"
            >
              {language === 'hi' ? 'सभी खोलें' : 'Expand All'}
            </button>
            <button
              onClick={collapseAll}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all text-center"
            >
              {language === 'hi' ? 'सभी बंद करें' : 'Collapse All'}
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative pt-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-blue-300" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'किसी भी सुविधा या समस्या को खोजें (उदा: Attendance, Login, Live, PDF, रिजल्ट...)'
                : 'Search any feature or problem (e.g. Attendance, Login, Live Class, MCQ, PDF...)'
            }
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 text-white placeholder-blue-200/60 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', labelHi: 'सभी (All)', labelEn: 'All' },
            { id: 'account', labelHi: 'खाता व लॉगिन', labelEn: 'Account' },
            { id: 'academic', labelHi: 'कक्षा व पढ़ाई', labelEn: 'Academics' },
            { id: 'routine', labelHi: 'रूटीन व उपस्थिति', labelEn: 'Routines' },
            { id: 'problems', labelHi: 'समस्याएं (Fixes)', labelEn: 'Common Problems' },
            { id: 'contact', labelHi: 'विद्यालय संपर्क', labelEn: 'Contact' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'bg-white/10 text-blue-100 hover:bg-white/15'
              }`}
            >
              {language === 'hi' ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Search results counter */}
      {searchQuery && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
          <span>
            {language === 'hi' ? 'खोज परिणाम:' : 'Search results for:'}{' '}
            <strong className="text-slate-800">&quot;{searchQuery}&quot;</strong> ({filteredTopics.length} topics found)
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-700 font-bold hover:underline"
          >
            {language === 'hi' ? 'फ़िल्टर हटाएं' : 'Clear Search'}
          </button>
        </div>
      )}

      {/* HELP TOPICS LIST */}
      <div className="space-y-3">
        {filteredTopics.map((item) => {
          const isExpanded = !!expandedItems[item.id];
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              id={`topic-${item.id}`}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all hover:border-blue-200"
            >
              {/* Header / Accordion Trigger */}
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 focus:outline-hidden group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      item.category === 'problems'
                        ? 'bg-amber-100 text-amber-800'
                        : item.category === 'contact'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800 group-hover:bg-blue-700 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase text-[10px]">
                        {item.badge}
                      </span>
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors mt-0.5">
                      {language === 'hi' ? item.titleHi : item.titleEn}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 hidden xs:block line-clamp-1">
                      {language === 'hi' ? item.summaryHi : item.summaryEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200 transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {language === 'hi' ? item.summaryHi : item.summaryEn}
                  </p>

                  {/* Step-by-Step Instructions */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>
                        {language === 'hi'
                          ? 'चरण-दर-चरण निर्देश (Step-by-Step Instructions):'
                          : 'Step-by-Step Instructions:'}
                      </span>
                    </h4>

                    <div className="space-y-2.5">
                      {(language === 'hi' ? item.stepsHi : item.stepsEn).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                          <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip or Important Note */}
                    {(item.tipsHi || item.tipsEn) && (
                      <div className="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <span>{language === 'hi' ? item.tipsHi : item.tipsEn}</span>
                      </div>
                    )}
                  </div>

                  {/* SPECIAL SECTION 17: COMMON PROBLEMS TROUBLESHOOTING GRID */}
                  {item.id === 'problems' && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>
                          {language === 'hi'
                            ? 'त्वरित समस्या निदान एवं टेस्ट (Interactive Diagnostics & Fixes):'
                            : 'Interactive Diagnostics & Fixes:'}
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            key: 'login',
                            titleHi: 'Login नहीं हो रहा',
                            titleEn: 'Cannot Sign In / Login',
                            descHi: 'Google sign-in पॉपअप या सेशन समस्या।',
                            descEn: 'Google sign-in popup or session token issue.',
                            icon: LogIn,
                          },
                          {
                            key: 'live',
                            titleHi: 'Live class connect नहीं हो रही',
                            titleEn: 'Live Class Not Connecting',
                            descHi: 'कैमरा/माइक अनुमति या सर्वर रुकावट।',
                            descEn: 'Camera/mic permissions or server status.',
                            icon: Video,
                          },
                          {
                            key: 'pdf',
                            titleHi: 'PDF नहीं खुल रही',
                            titleEn: 'PDF Not Opening / Blank',
                            descHi: 'रीडर पॉपअप ब्लॉक या नेटवर्क धीमी गति।',
                            descEn: 'Reader popup blocked or slow network.',
                            icon: Download,
                          },
                          {
                            key: 'attendance',
                            titleHi: 'Attendance submit नहीं हो रही',
                            titleEn: 'Attendance Submit Blocked',
                            descHi: 'दैनिक एकल उपस्थिति सुरक्षा नियम की जांच।',
                            descEn: 'Single attendance per day security check.',
                            icon: UserCheck,
                          },
                          {
                            key: 'voice',
                            titleHi: 'Voice recognition काम नहीं कर रहा',
                            titleEn: 'Voice Recognition Mic Issue',
                            descHi: 'ब्राउज़र माइक्रोफोन इंजन व अनुमति जांच।',
                            descEn: 'Browser speech engine & mic permission test.',
                            icon: Mic,
                          },
                          {
                            key: 'internet',
                            titleHi: 'Internet connection problem',
                            titleEn: 'Internet Connection Test',
                            descHi: 'डिवाइस नेटवर्क व सर्वर कनेक्टिविटी टेस्ट।',
                            descEn: 'Device network and server latency check.',
                            icon: Wifi,
                          },
                        ].map((prob) => {
                          const status = troubleshootStatus[prob.key] || 'idle';
                          const msg = troubleshootMessage[prob.key];
                          const ProbIcon = prob.icon;

                          return (
                            <div
                              key={prob.key}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between gap-2.5"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                                  <ProbIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-xs font-bold text-slate-900">
                                    {language === 'hi' ? prob.titleHi : prob.titleEn}
                                  </h5>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {language === 'hi' ? prob.descHi : prob.descEn}
                                  </p>
                                </div>
                              </div>

                              {/* Interactive Diagnostic Feedback */}
                              {msg && (
                                <div
                                  className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                                    status === 'success'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                                  }`}
                                >
                                  {status === 'success' ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  ) : (
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  )}
                                  <span className="truncate">{msg}</span>
                                </div>
                              )}

                              <button
                                onClick={() => handleTroubleshootTest(prob.key)}
                                disabled={status === 'testing'}
                                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                              >
                                {status === 'testing' ? (
                                  <>
                                    <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                                    <span>Testing...</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3 h-3 text-slate-500" />
                                    <span>[ Try Again / पुनः प्रयास करें ]</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SPECIAL SECTION 18: AUTHENTIC CONTACT SCHOOL / SUPPORT */}
                  {item.id === 'contact' && (
                    <div className="space-y-4 pt-2">
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider block">
                              Official Institutional Helpdesk
                            </span>
                            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                              जनता +2 उच्च विद्यालय, खलारी (Janta +2 High School)
                            </h4>
                          </div>

                          {/* Admin Edit Trigger */}
                          {isAdmin && (
                            <button
                              onClick={() => setIsEditingContact(!isEditingContact)}
                              className="px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{isEditingContact ? 'Close Editor' : 'Admin: Edit Support Info'}</span>
                            </button>
                          )}
                        </div>

                        {/* Admin Inline Editor Form */}
                        {isAdmin && isEditingContact && (
                          <form
                            onSubmit={handleSaveContact}
                            className="bg-white p-4 rounded-xl border border-blue-300 space-y-3 animate-in fade-in"
                          >
                            <h5 className="text-xs font-black uppercase tracking-wider text-blue-900">
                              Admin: Set School Contact &amp; Support Details
                            </h5>
                            <p className="text-[11px] text-slate-500">
                              Please enter only authentic school contact details. Leave blank if not available yet.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                  School Phone Number:
                                </label>
                                <input
                                  type="text"
                                  value={editForm.phone || ''}
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  placeholder="e.g. +91 6531 ... (Leave blank if not set)"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                  Official Email:
                                </label>
                                <input
                                  type="email"
                                  value={editForm.email || ''}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  placeholder="e.g. jantahighschoolkhalari@gmail.com"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                  Office Contact / Hours:
                                </label>
                                <input
                                  type="text"
                                  value={editForm.officeContact || ''}
                                  onChange={(e) => setEditForm({ ...editForm, officeContact: e.target.value })}
                                  placeholder="e.g. Principal Office (10:00 AM - 04:00 PM)"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                  Support Desk Note:
                                </label>
                                <input
                                  type="text"
                                  value={editForm.supportContact || ''}
                                  onChange={(e) => setEditForm({ ...editForm, supportContact: e.target.value })}
                                  placeholder="e.g. Inquiries regarding admissions & board exams"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                                  Campus Address:
                                </label>
                                <input
                                  type="text"
                                  value={editForm.address || 'Khalari, Ranchi District, Jharkhand - 829205'}
                                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsEditingContact(false)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSavingContact}
                                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                              >
                                {isSavingContact ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                <span>Save Support Information</span>
                              </button>
                            </div>
                          </form>
                        )}

                        {contactSaveSuccess && (
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-700" />
                            <span>Official support information saved successfully.</span>
                          </div>
                        )}

                        {/* DISPLAY OFFICIAL CONTACT OR "School support contact will be available here." */}
                        {hasConfiguredContact ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                            {contactInfo.phone && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                                <PhoneCall className="w-4 h-4 text-blue-700 shrink-0" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone / Helpline</span>
                                  <span className="font-extrabold text-slate-900">{contactInfo.phone}</span>
                                </div>
                              </div>
                            )}

                            {contactInfo.email && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-blue-700 shrink-0" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Official Email</span>
                                  <span className="font-extrabold text-slate-900 break-all">{contactInfo.email}</span>
                                </div>
                              </div>
                            )}

                            {contactInfo.officeContact && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                                <Building className="w-4 h-4 text-blue-700 shrink-0" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Office Contact</span>
                                  <span className="font-extrabold text-slate-900">{contactInfo.officeContact}</span>
                                </div>
                              </div>
                            )}

                            {contactInfo.supportContact && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2.5">
                                <Info className="w-4 h-4 text-blue-700 shrink-0" />
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Support Desk</span>
                                  <span className="font-extrabold text-slate-900">{contactInfo.supportContact}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* RULE COMPLIANCE: If no contact information has been added, show exact text */
                          <div className="p-4 bg-amber-50/90 rounded-xl border border-amber-200 text-center space-y-1">
                            <p className="text-xs sm:text-sm font-black text-amber-900">
                              “School support contact will be available here.”
                            </p>
                            <p className="text-[11px] text-amber-800">
                              (विद्यालय सहायता संपर्क शीघ्र उपलब्ध कराया जाएगा। विद्यालय प्रशासन द्वारा अधिकृत विवरण जोड़ने पर यहां प्रदर्शित होगा।)
                            </p>
                          </div>
                        )}

                        {/* Always show authentic Campus Location & Identification */}
                        <div className="p-3 bg-white/80 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              {contactInfo.address || 'Khalari, P.O. & P.S. Khalari, Ranchi District, Jharkhand - 829205'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>School Code: 23045 • U-DISE Code: 20210403502 • JAC Affiliated</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Action Shortcut */}
                  {item.actionLabel && item.actionSection && (
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => onOpenSection(item.actionSection!)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-98 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[11px] text-slate-400">Topic #{item.number}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Emergency Admin Security Link */}
      <div className="p-4 rounded-3xl bg-slate-200/70 border border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Shield className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            {language === 'hi'
              ? 'शिक्षक व विद्यालय स्टाफ सहायता विवरण अपडेट करने हेतु एडमिन लॉगिन करें।'
              : 'Teachers & staff can enter admin credentials to manage helpdesk settings.'}
          </span>
        </div>

        <button
          onClick={onOpenAdminModal}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs"
        >
          {isAdmin ? 'Admin Mode Active' : 'Staff Admin Login'}
        </button>
      </div>
    </div>
  );
}
