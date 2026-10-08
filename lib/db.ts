import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  SchoolClass,
  LiveClassSession,
  MCQQuestion,
  Book,
  TimetableEntry,
  Notice,
  ExamSchedule,
  PublishedResult,
  FacultyMember,
  AttendanceRecord,
  SchoolContactInfo,
  NotificationItem,
  HomeworkItem,
  CalendarEvent,
  ReportedSafetyItem,
  AdminAuditLog,
  AboutSchoolData,
  WrittenQuestion,
  WrittenSubmission,
  ChatMessage,
  ChatConversation,
  UserRole,
  BookmarkItem,
  TestAttemptRecord,
  StudentNote,
} from './types';
import { initialAboutSchoolData } from './aboutData';

// Secure Password Hashing Helper
export function hashPassword(password: string): string {
  const salt = 'janta_khalari_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

interface DatabaseSchema {
  users: UserProfile[];
  liveClassSessions: LiveClassSession[];
  mcqQuestions: MCQQuestion[];
  books: Book[];
  timetables: TimetableEntry[];
  notices: Notice[];
  examSchedules: ExamSchedule[];
  results: PublishedResult[];
  faculty: FacultyMember[];
  attendance: AttendanceRecord[];
  schoolContact?: SchoolContactInfo;
  notifications?: NotificationItem[];
  homework?: HomeworkItem[];
  calendarEvents?: CalendarEvent[];
  reportedSafetyItems?: ReportedSafetyItem[];
  auditLogs?: AdminAuditLog[];
  aboutSchool?: AboutSchoolData;
  writtenQuestions?: WrittenQuestion[];
  writtenSubmissions?: WrittenSubmission[];
  chatConversations?: ChatConversation[];
  chatMessages?: ChatMessage[];
  testAttempts?: TestAttemptRecord[];
  studentBookmarks?: BookmarkItem[];
  studentNotes?: StudentNote[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'school_database.json');

// Initial seed data with authentic Jharkhand Academic Council (JAC) High School curriculum
const initialTimetables: TimetableEntry[] = [
  // Class 10 Monday
  { id: 't-10-mon-1', class: '10', day: 'Monday', subject: 'Mathematics', startTime: '09:00 AM', endTime: '09:45 AM', teacherName: 'Mr. R. K. Sharma', room: 'Room 101' },
  { id: 't-10-mon-2', class: '10', day: 'Monday', subject: 'Science (Physics)', startTime: '09:45 AM', endTime: '10:30 AM', teacherName: 'Dr. A. K. Verma', room: 'Lab 1' },
  { id: 't-10-mon-3', class: '10', day: 'Monday', subject: 'English', startTime: '10:30 AM', endTime: '11:15 AM', teacherName: 'Mrs. S. Tirkey', room: 'Room 101' },
  { id: 't-10-mon-4', class: '10', day: 'Monday', subject: 'Hindi', startTime: '11:30 AM', endTime: '12:15 PM', teacherName: 'Mr. P. N. Pandey', room: 'Room 101' },
  { id: 't-10-mon-5', class: '10', day: 'Monday', subject: 'Social Science', startTime: '12:15 PM', endTime: '01:00 PM', teacherName: 'Mr. B. Munda', room: 'Room 101' },
  { id: 't-10-mon-6', class: '10', day: 'Monday', subject: 'Sanskrit', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Acharya R. Mishra', room: 'Room 101' },

  // Class 10 Saturday (CRITICAL: Preserving Saturday subjects: Maths, S.S.T, English, Sanskrit, IT, Healthcare, including 1:00–2:00 entries)
  { id: 't-10-sat-1', class: '10', day: 'Saturday', subject: 'Maths', startTime: '09:45 AM', endTime: '10:45 AM', teacherName: 'Mr. R. K. Sharma', room: 'Room 101' },
  { id: 't-10-sat-2', class: '10', day: 'Saturday', subject: 'S.S.T', startTime: '10:45 AM', endTime: '11:30 AM', teacherName: 'Mr. B. Munda', room: 'Room 101' },
  { id: 't-10-sat-3', class: '10', day: 'Saturday', subject: 'English', startTime: '11:30 AM', endTime: '12:20 PM', teacherName: 'Mrs. S. Tirkey', room: 'Room 101' },
  { id: 't-10-sat-4', class: '10', day: 'Saturday', subject: 'Sanskrit', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Acharya R. Mishra', room: 'Room 101' },
  { id: 't-10-sat-5', class: '10', day: 'Saturday', subject: 'Information Technology', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Mr. V. Kumar', room: 'Computer Lab' },
  { id: 't-10-sat-6', class: '10', day: 'Saturday', subject: 'Healthcare', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Ms. P. Soren (Healthcare Trainer)', room: 'Health Lab' },

  // Class 9 Saturday
  { id: 't-9-sat-1', class: '9', day: 'Saturday', subject: 'Maths', startTime: '09:00 AM', endTime: '09:45 AM', teacherName: 'Mr. S. K. Gupta', room: 'Room 91' },
  { id: 't-9-sat-2', class: '9', day: 'Saturday', subject: 'S.S.T', startTime: '09:45 AM', endTime: '10:30 AM', teacherName: 'Mrs. M. Kumari', room: 'Room 91' },
  { id: 't-9-sat-3', class: '9', day: 'Saturday', subject: 'English', startTime: '10:30 AM', endTime: '11:15 AM', teacherName: 'Mrs. S. Tirkey', room: 'Room 91' },
  { id: 't-9-sat-4', class: '9', day: 'Saturday', subject: 'Sanskrit', startTime: '11:30 AM', endTime: '12:15 PM', teacherName: 'Acharya R. Mishra', room: 'Room 91' },
  { id: 't-9-sat-5', class: '9', day: 'Saturday', subject: 'Information Technology', startTime: '12:15 PM', endTime: '01:00 PM', teacherName: 'Mr. V. Kumar', room: 'Computer Lab' },
  { id: 't-9-sat-6', class: '9', day: 'Saturday', subject: 'Healthcare', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Ms. P. Soren', room: 'Health Lab' },

  // Class 11 Saturday (Science/Arts/Commerce)
  { id: 't-11-sat-1', class: '11', day: 'Saturday', subject: 'Physics / Accountancy / History', startTime: '09:00 AM', endTime: '10:00 AM', teacherName: 'Senior Faculty', room: 'Block A' },
  { id: 't-11-sat-2', class: '11', day: 'Saturday', subject: 'Chemistry / Business Studies / Pol Science', startTime: '10:00 AM', endTime: '11:00 AM', teacherName: 'Senior Faculty', room: 'Block A' },
  { id: 't-11-sat-3', class: '11', day: 'Saturday', subject: 'Maths / Economics', startTime: '11:15 AM', endTime: '12:15 PM', teacherName: 'Mr. R. K. Sharma', room: 'Block A' },
  { id: 't-11-sat-4', class: '11', day: 'Saturday', subject: 'Information Technology / Computer Science', startTime: '12:15 PM', endTime: '01:00 PM', teacherName: 'Mr. V. Kumar', room: 'Computer Lab' },
  { id: 't-11-sat-5', class: '11', day: 'Saturday', subject: 'Healthcare & Vocational Practicals', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Ms. P. Soren', room: 'Skill Lab' },

  // Class 12 Saturday
  { id: 't-12-sat-1', class: '12', day: 'Saturday', subject: 'Physics / Accountancy', startTime: '09:00 AM', endTime: '10:00 AM', teacherName: 'Dr. A. K. Verma', room: 'Block B' },
  { id: 't-12-sat-2', class: '12', day: 'Saturday', subject: 'Chemistry / Business Studies', startTime: '10:00 AM', endTime: '11:00 AM', teacherName: 'Dr. M. K. Roy', room: 'Lab 2' },
  { id: 't-12-sat-3', class: '12', day: 'Saturday', subject: 'Mathematics / Biology / Economics', startTime: '11:15 AM', endTime: '12:15 PM', teacherName: 'Mr. R. K. Sharma', room: 'Block B' },
  { id: 't-12-sat-4', class: '12', day: 'Saturday', subject: 'English Core', startTime: '12:15 PM', endTime: '01:00 PM', teacherName: 'Mrs. S. Tirkey', room: 'Block B' },
  { id: 't-12-sat-5', class: '12', day: 'Saturday', subject: 'Information Technology / Healthcare Practicals', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Vocational Faculty', room: 'Computer Lab' },
];

const initialFaculty: FacultyMember[] = [
  {
    id: 'f-1',
    name: 'Dr. Rameshwar Mahto',
    designation: 'Principal & Senior Educator',
    subject: 'Administration & Education',
    classesTaught: 'Class 9 to 12',
    qualification: 'M.Sc., M.Ed., Ph.D.',
    experience: '24 Years',
    email: 'principal.jantakhalari@gmail.com',
    phone: '+91 94311 XXXXX',
  },
  {
    id: 'f-2',
    name: 'Mr. Rajesh Kumar Sharma',
    designation: 'PGT Mathematics',
    subject: 'Mathematics',
    classesTaught: 'Class 10, 11, 12',
    qualification: 'M.Sc. (Mathematics), B.Ed.',
    experience: '16 Years',
    email: 'rksharma.janta@gmail.com',
  },
  {
    id: 'f-3',
    name: 'Dr. Anil Kumar Verma',
    designation: 'PGT Physics',
    subject: 'Physics & Science',
    classesTaught: 'Class 10, 11, 12 (Science)',
    qualification: 'M.Sc. (Physics), Ph.D., B.Ed.',
    experience: '14 Years',
    email: 'akverma.physics@gmail.com',
  },
  {
    id: 'f-4',
    name: 'Dr. Manoj Kumar Roy',
    designation: 'PGT Chemistry',
    subject: 'Chemistry & Science',
    classesTaught: 'Class 10, 11, 12 (Science)',
    qualification: 'M.Sc. (Chemistry), B.Ed.',
    experience: '12 Years',
    email: 'mkroy.chem@gmail.com',
  },
  {
    id: 'f-5',
    name: 'Mrs. Sushma Tirkey',
    designation: 'TGT / PGT English',
    subject: 'English Language & Literature',
    classesTaught: 'Class 9, 10, 11, 12',
    qualification: 'M.A. (English), B.Ed.',
    experience: '11 Years',
    email: 'stirkey.eng@gmail.com',
  },
  {
    id: 'f-6',
    name: 'Mr. Prem Nath Pandey',
    designation: 'TGT Hindi',
    subject: 'Hindi',
    classesTaught: 'Class 9, 10',
    qualification: 'M.A. (Hindi), B.Ed.',
    experience: '15 Years',
    email: 'pnpandey.hindi@gmail.com',
  },
  {
    id: 'f-7',
    name: 'Acharya Ramakant Mishra',
    designation: 'Senior Sanskrit Teacher',
    subject: 'Sanskrit',
    classesTaught: 'Class 9, 10',
    qualification: 'Acharya (Sanskrit), Shiksha Shastri',
    experience: '18 Years',
    email: 'rmishra.sanskrit@gmail.com',
  },
  {
    id: 'f-8',
    name: 'Mr. Vikas Kumar',
    designation: 'Faculty (IT & Computer Science)',
    subject: 'Information Technology',
    classesTaught: 'Class 9, 10, 11, 12',
    qualification: 'MCA, B.Tech (IT)',
    experience: '8 Years',
    email: 'vikas.it@gmail.com',
  },
  {
    id: 'f-9',
    name: 'Ms. Priya Soren',
    designation: 'Vocational Trainer (Healthcare)',
    subject: 'Healthcare & First Aid',
    classesTaught: 'Class 9, 10, 11, 12',
    qualification: 'B.Sc. Nursing, Certified Vocational Trainer',
    experience: '6 Years',
    email: 'priya.healthcare@gmail.com',
  },
  {
    id: 'f-10',
    name: 'Mr. Birsa Munda',
    designation: 'TGT Social Science',
    subject: 'Social Science (History, Civics, Geography)',
    classesTaught: 'Class 9, 10',
    qualification: 'M.A. (History), B.Ed.',
    experience: '10 Years',
    email: 'bmunda.sst@gmail.com',
  },
];

const initialNotices: Notice[] = [
  {
    id: 'n-1',
    title: 'JAC Board Examination 2026 Registration & Form Fill-up',
    description: 'All regular and ex-students of Class 10 and Class 12 are hereby notified that the JAC Examination Registration verification is in progress. Submit caste/income certificates and passport photos to the school office before the deadline.',
    date: '2026-09-20',
    important: true,
    published: true,
    targetClass: 'All',
    author: 'Principal Office',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-2',
    title: 'Pre-Board Examination Schedule Released for Class 10 & 12',
    description: 'The Pre-Board examinations for Classes 10 and 12 will commence shortly. Attendance is mandatory for all students to qualify for the final admit card.',
    date: '2026-09-18',
    important: true,
    published: true,
    targetClass: 'All',
    author: 'Examination Controller',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-3',
    title: 'Saturday Remedial & Vocational Healthcare Classes',
    description: 'Reminder for all students of Class 9 to 12: Special IT, Sanskrit, and Healthcare vocational training sessions take place every Saturday from 1:00 PM to 2:00 PM. Hands-on practical attendance is recorded.',
    date: '2026-09-15',
    important: false,
    published: true,
    targetClass: 'All',
    author: 'Vocational Wing',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n-4',
    title: 'E-Kalyan Jharkhand Scholarship Portal Document Verification',
    description: 'Students applying for post-matric and pre-matric scholarships through E-Kalyan portal must submit their hard copies along with bank passbook copies to Mr. Pandey.',
    date: '2026-09-12',
    important: true,
    published: true,
    targetClass: 'All',
    author: 'Scholarship Desk',
    createdAt: new Date().toISOString(),
  },
];

const initialExamSchedules: ExamSchedule[] = [
  {
    id: 'ex-10-1',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-02-16',
    day: 'Monday',
    subject: 'Hindi (Course A / B)',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: 'Carry original admit card, blue/black ballpoint pen, reach center by 09:15 AM.',
  },
  {
    id: 'ex-10-2',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-02-19',
    day: 'Thursday',
    subject: 'Mathematics (गणित)',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: 'Geometry box allowed, no smart devices.',
  },
  {
    id: 'ex-10-3',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-02-23',
    day: 'Monday',
    subject: 'Science (विज्ञान - Physics, Chemistry, Biology)',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: 'Answer sheets contain Section A (Objective MCQ) and Section B (Subjective).',
  },
  {
    id: 'ex-10-4',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-02-26',
    day: 'Thursday',
    subject: 'Social Science (सामाजिक विज्ञान)',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: 'Map pointing section is compulsory.',
  },
  {
    id: 'ex-10-5',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-03-02',
    day: 'Monday',
    subject: 'English (First Flight / Footprints)',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: '15 minutes extra reading time provided.',
  },
  {
    id: 'ex-10-6',
    class: '10',
    examName: 'JAC Annual Board Examination 2026',
    date: '2026-03-05',
    day: 'Thursday',
    subject: 'Sanskrit / Information Technology / Healthcare',
    time: '09:45 AM - 01:00 PM',
    room: 'Designated Examination Center',
    instructions: 'Vocational & optional language paper.',
  },
  // Class 12 Science/Arts/Commerce
  {
    id: 'ex-12-1',
    class: '12',
    examName: 'JAC Intermediate (+2) Board Exam 2026',
    date: '2026-02-16',
    day: 'Monday',
    subject: 'Physics / Accountancy / History',
    time: '02:00 PM - 05:15 PM',
    room: 'Designated Examination Center',
  },
  {
    id: 'ex-12-2',
    class: '12',
    examName: 'JAC Intermediate (+2) Board Exam 2026',
    date: '2026-02-20',
    day: 'Friday',
    subject: 'Chemistry / Business Studies / Pol Science',
    time: '02:00 PM - 05:15 PM',
    room: 'Designated Examination Center',
  },
  {
    id: 'ex-12-3',
    class: '12',
    examName: 'JAC Intermediate (+2) Board Exam 2026',
    date: '2026-02-24',
    day: 'Tuesday',
    subject: 'Mathematics / Biology / Economics',
    time: '02:00 PM - 05:15 PM',
    room: 'Designated Examination Center',
  },
  {
    id: 'ex-12-4',
    class: '12',
    examName: 'JAC Intermediate (+2) Board Exam 2026',
    date: '2026-02-28',
    day: 'Saturday',
    subject: 'English Core / Elective',
    time: '02:00 PM - 05:15 PM',
    room: 'Designated Examination Center',
  },
];

const initialBooks: Book[] = [
  {
    id: 'b-10-math',
    class: '10',
    subject: 'Mathematics',
    title: 'JCERT / NCERT Mathematics (गणित कक्षा 10)',
    authorOrPublisher: 'JCERT / NCERT Jharkhand Edition',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jhem1dd.zip',
    description: 'Complete official textbook for Class 10 JAC Board with Real Numbers, Polynomials, Quadratic Equations, Trigonometry, and Statistics.',
    chapterCount: 15,
    uploadedAt: '2026-08-10',
  },
  {
    id: 'b-10-sci',
    class: '10',
    subject: 'Science',
    title: 'Science (विज्ञान कक्षा 10)',
    authorOrPublisher: 'NCERT / JCERT',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jhsc1dd.zip',
    description: 'Includes Chemical Reactions, Life Processes, Light Reflection, Electricity, and Heredity chapters with diagrams.',
    chapterCount: 16,
    uploadedAt: '2026-08-10',
  },
  {
    id: 'b-10-sst',
    class: '10',
    subject: 'Social Science',
    title: 'Bharat Aur Samkalin Vishwa - II (भारत और समकालीन विश्व)',
    authorOrPublisher: 'JCERT Ranchi',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jhess1dd.zip',
    description: 'History, Civics, Geography and Economics textbooks for Class 10 JAC curriculum.',
    chapterCount: 22,
    uploadedAt: '2026-08-12',
  },
  {
    id: 'b-10-eng',
    class: '10',
    subject: 'English',
    title: 'First Flight & Footprints without Feet',
    authorOrPublisher: 'NCERT',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jhef1dd.zip',
    description: 'Class 10 English literature reader and supplementary textbook.',
    chapterCount: 20,
    uploadedAt: '2026-08-14',
  },
  {
    id: 'b-10-sans',
    class: '10',
    subject: 'Sanskrit',
    title: 'Shemushi - Dwitiyo Bhagah (शेमुषी भाग - 2)',
    authorOrPublisher: 'NCERT / JCERT',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/jhsk1dd.zip',
    description: 'Official Sanskrit syllabus textbook for JAC High School Class 10.',
    chapterCount: 12,
    uploadedAt: '2026-08-15',
  },
  {
    id: 'b-10-it',
    class: '10',
    subject: 'Information Technology',
    title: 'Information Technology (Code 402 / JAC Skill)',
    authorOrPublisher: 'Vocational Council & CBSE/JAC',
    fileUrl: 'https://ncert.nic.in/vocational.php',
    description: 'Employability Skills, Digital Documentation, Electronic Spreadsheet, Database Management, and Web Applications.',
    chapterCount: 8,
    uploadedAt: '2026-08-18',
  },
  {
    id: 'b-12-phy',
    class: '12',
    subject: 'Physics',
    stream: 'Science',
    title: 'Physics Part I & II (भौतिकी कक्षा 12)',
    authorOrPublisher: 'NCERT / JAC',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/leph1dd.zip',
    description: 'Electrostatics, Magnetism, Optics, Modern Physics, and Semiconductor electronics.',
    chapterCount: 14,
    uploadedAt: '2026-08-20',
  },
  {
    id: 'b-12-chem',
    class: '12',
    subject: 'Chemistry',
    stream: 'Science',
    title: 'Chemistry Part I & II (रसायन विज्ञान कक्षा 12)',
    authorOrPublisher: 'NCERT / JAC',
    fileUrl: 'https://ncert.nic.in/textbook/pdf/lech1dd.zip',
    description: 'Solutions, Electrochemistry, Chemical Kinetics, Coordination Compounds, and Organic Reactions.',
    chapterCount: 16,
    uploadedAt: '2026-08-20',
  },
];

const initialMcqQuestions: MCQQuestion[] = [
  // Class 10 Science
  {
    id: 'mcq-10-sci-1',
    class: '10',
    subject: 'Science',
    chapter: 'Chemical Reactions & Equations',
    question: 'जब लोहे की कील को कॉपर सल्फेट के विलयन में डुबोया जाता है, तो विलयन का रंग कैसा हो जाता है? (When an iron nail is dipped in copper sulphate solution, the colour of solution changes to?)',
    optionA: 'नीला (Blue)',
    optionB: 'हरा (Green)',
    optionC: 'पीला (Yellow)',
    optionD: 'लाल (Red)',
    correctAnswer: 'B',
    explanation: 'लोहा (Iron) कॉपर से अधिक अभिक्रियाशील है। यह कॉपर सल्फेट से कॉपर को विस्थापित कर फेरस सल्फेट (FeSO4) बनाता है, जिससे विलयन का रंग हल्का हरा हो जाता है।',
  },
  {
    id: 'mcq-10-sci-2',
    class: '10',
    subject: 'Science',
    chapter: 'Life Processes',
    question: 'मानव वृक्क (Kidney) किस तंत्र का भाग है? (The kidneys in human beings are a part of the system for?)',
    optionA: 'पोषण (Nutrition)',
    optionB: 'श्वसन (Respiration)',
    optionC: 'उत्सर्जन (Excretion)',
    optionD: 'परिवहन (Transportation)',
    correctAnswer: 'C',
    explanation: 'वृक्क (Kidney) मानव उत्सर्जन तंत्र (Excretory System) का मुख्य अंग है जो रक्त से अपशिष्ट यूरिया और अतिरिक्त लवणों को छानकर मूत्र बनाता है।',
  },
  {
    id: 'mcq-10-sci-3',
    class: '10',
    subject: 'Science',
    chapter: 'Light - Reflection & Refraction',
    question: 'किसी अवतल दर्पण की फोकस दूरी 20 सेमी है। उसकी वक्रता त्रिज्या (Radius of Curvature) क्या होगी?',
    optionA: '10 सेमी',
    optionB: '20 सेमी',
    optionC: '40 सेमी',
    optionD: '30 सेमी',
    correctAnswer: 'C',
    explanation: 'वक्रता त्रिज्या (R) = 2 × फोकस दूरी (f)। यहाँ f = 20 सेमी है, अतः R = 2 × 20 = 40 सेमी होगी।',
  },
  // Class 10 Mathematics
  {
    id: 'mcq-10-math-1',
    class: '10',
    subject: 'Mathematics',
    chapter: 'Real Numbers',
    question: 'संख्या 140 का अभाज्य गुणनखंडन (Prime Factorisation) क्या है? (What is the prime factorisation of 140?)',
    optionA: '2 × 3 × 5 × 7',
    optionB: '2² × 5 × 7',
    optionC: '2³ × 5 × 7',
    optionD: '2 × 5² × 7',
    correctAnswer: 'B',
    explanation: '140 = 2 × 70 = 2 × 2 × 35 = 2² × 5 × 7. अतः सही उत्तर B है।',
  },
  {
    id: 'mcq-10-math-2',
    class: '10',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    question: 'द्विघात समीकरण ax² + bx + c = 0 के मूल वास्तविक और समान होंगे यदि विविक्तकर (Discriminant D) का मान हो:',
    optionA: 'D > 0',
    optionB: 'D < 0',
    optionC: 'D = 0',
    optionD: 'D ≥ 1',
    correctAnswer: 'C',
    explanation: 'जब विविक्तकर D = b² - 4ac = 0 होता है, तो द्विघात समीकरण के दोनों मूल वास्तविक और समान (Real and Equal) होते हैं।',
  },
  {
    id: 'mcq-10-math-3',
    class: '10',
    subject: 'Mathematics',
    chapter: 'Trigonometry',
    question: 'यदि sin θ = 3/5 हो, तो cos θ का मान क्या होगा? (If sin θ = 3/5, what is cos θ?)',
    optionA: '4/5',
    optionB: '5/4',
    optionC: '3/4',
    optionD: '1/5',
    correctAnswer: 'A',
    explanation: 'cos² θ = 1 - sin² θ = 1 - (3/5)² = 1 - 9/25 = 16/25. अतः cos θ = √(16/25) = 4/5.',
  },
  // Class 10 Social Science
  {
    id: 'mcq-10-sst-1',
    class: '10',
    subject: 'Social Science',
    chapter: 'Nationalism in India',
    question: 'जलियांवाला बाग हत्याकांड किस तिथि को हुआ था? (On which date did the Jallianwala Bagh massacre take place?)',
    optionA: '13 अप्रैल 1919',
    optionB: '10 मार्च 1919',
    optionC: '15 अगस्त 1920',
    optionD: '26 जनवरी 1930',
    correctAnswer: 'A',
    explanation: '13 अप्रैल 1919 को बैसाखी के दिन अमृतसर के जलियांवाला बाग में जनरल डायर ने निहत्थी सभा पर गोलियां चलवाई थीं।',
  },
  // Class 10 Sanskrit & IT
  {
    id: 'mcq-10-sans-1',
    class: '10',
    subject: 'Sanskrit',
    chapter: 'व्याकरणम् (Grammar)',
    question: "'विद्या + आलय:' इत्यस्य सन्धिरूपं किम् भवति? (What is the sandhi of Vidya + Alayah?)",
    optionA: 'विद्यलय:',
    optionB: 'विद्यालय:',
    optionC: 'विद्ययालय:',
    optionD: 'विद्यालयम्',
    correctAnswer: 'B',
    explanation: "'आ + आ = आ' (दीर्घ सन्धि)। अतः विद्या + आलय: = विद्यालय:।",
  },
  {
    id: 'mcq-10-it-1',
    class: '10',
    subject: 'Information Technology',
    chapter: 'Digital Documentation',
    question: 'किसी डॉक्यूमेंट में टेक्स्ट को बोल्ड (Bold) करने का सही शॉर्टकट क्या है? (Shortcut for Bold text?)',
    optionA: 'Ctrl + B',
    optionB: 'Ctrl + I',
    optionC: 'Ctrl + U',
    optionD: 'Ctrl + S',
    correctAnswer: 'A',
    explanation: 'Ctrl + B शॉर्टकट का उपयोग टेक्स्ट को बोल्ड करने के लिए किया जाता है।',
  },
  // Class 12 Physics & Chemistry
  {
    id: 'mcq-12-phy-1',
    class: '12',
    subject: 'Physics',
    chapter: 'Electrostatics',
    question: 'विद्युत क्षेत्र की तीव्रता (Electric Field Intensity) का SI मात्रक क्या है? (SI unit of Electric Field Intensity?)',
    optionA: 'N/C (न्यूटन/कूलम्ब)',
    optionB: 'J/C (जूल/कूलम्ब)',
    optionC: 'V/m (वोल्ट/मीटर)',
    optionD: 'दोनों A और C (Both A and C)',
    correctAnswer: 'D',
    explanation: 'विद्युत क्षेत्र E = F/q (N/C) अथवा E = -dV/dr (V/m) होता है। दोनों ही वैद्युत क्षेत्र तीव्रता के मान्य SI मात्रक हैं।',
  },
  {
    id: 'mcq-12-chem-1',
    class: '12',
    subject: 'Chemistry',
    chapter: 'Solutions',
    question: 'मोललता (Molality) की इकाई क्या है? (What is the unit of Molality?)',
    optionA: 'mol/L',
    optionB: 'mol/kg',
    optionC: 'g/L',
    optionD: 'mol/mL',
    correctAnswer: 'B',
    explanation: 'मोललता (Molality) = (विलेय के मोल) / (विलायक का द्रव्यमान किग्रा में) = mol/kg। यह तापमान पर निर्भर नहीं करती।',
  },
];

const initialResults: PublishedResult[] = [
  {
    id: 'res-10-1',
    class: '10',
    examName: 'JAC Annual Secondary Examination 2026',
    year: '2026',
    studentName: 'Amit Kumar Singh',
    rollCode: '11045',
    rollNo: '0012',
    totalMarks: 500,
    obtainedMarks: 442,
    percentage: 88.4,
    division: '1st Division',
    subjectScores: [
      { subject: 'Hindi', marks: 86, maxMarks: 100 },
      { subject: 'English', marks: 84, maxMarks: 100 },
      { subject: 'Mathematics', marks: 95, maxMarks: 100 },
      { subject: 'Science', marks: 91, maxMarks: 100 },
      { subject: 'Social Science', marks: 86, maxMarks: 100 },
    ],
    publishedAt: '2026-05-24',
  },
  {
    id: 'res-10-2',
    class: '10',
    examName: 'JAC Annual Secondary Examination 2026',
    year: '2026',
    studentName: 'Pooja Kumari Oraon',
    rollCode: '11045',
    rollNo: '0028',
    totalMarks: 500,
    obtainedMarks: 456,
    percentage: 91.2,
    division: '1st Division',
    subjectScores: [
      { subject: 'Hindi', marks: 92, maxMarks: 100 },
      { subject: 'English', marks: 88, maxMarks: 100 },
      { subject: 'Mathematics', marks: 96, maxMarks: 100 },
      { subject: 'Science', marks: 94, maxMarks: 100 },
      { subject: 'Social Science', marks: 86, maxMarks: 100 },
    ],
    publishedAt: '2026-05-24',
  },
  {
    id: 'res-12-1',
    class: '12',
    examName: 'JAC Intermediate (+2 Science) Examination 2026',
    year: '2026',
    studentName: 'Rohan Karmali',
    rollCode: '11046',
    rollNo: '0104',
    totalMarks: 500,
    obtainedMarks: 428,
    percentage: 85.6,
    division: '1st Division',
    subjectScores: [
      { subject: 'Physics', marks: 84, maxMarks: 100 },
      { subject: 'Chemistry', marks: 82, maxMarks: 100 },
      { subject: 'Mathematics', marks: 92, maxMarks: 100 },
      { subject: 'English Core', marks: 85, maxMarks: 100 },
      { subject: 'Computer Science', marks: 85, maxMarks: 100 },
    ],
    publishedAt: '2026-05-28',
  },
];

const initialLiveSessions: LiveClassSession[] = [
  {
    id: 'live-default-1',
    class: '10',
    subject: 'Mathematics',
    teacherName: 'Mr. R. K. Sharma',
    title: 'Trigonometry & Height-Distance Problem Solving',
    meetingId: 'JantaHighSchoolKhalari_Class10_Maths_2026',
    meetingUrl: 'https://meet.jit.si/JantaHighSchoolKhalari_Class10_Maths_2026',
    status: 'live',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    createdBy: 'teacher-admin',
  },
];

// In-memory cache
let inMemoryDb: DatabaseSchema | null = null;

function ensureDataDirectory() {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const initialEnrolledStudents: UserProfile[] = [
  { id: 'std-10-1', studentId: 'std-10-1', loginId: '1001', name: 'Amit Kumar Singh', email: 'amit.singh@student.janta.edu', role: 'student', selectedClass: '10', section: 'A', rollNo: '1001', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-2', studentId: 'std-10-2', loginId: '1002', name: 'Pooja Kumari Oraon', email: 'pooja.oraon@student.janta.edu', role: 'student', selectedClass: '10', section: 'A', rollNo: '1002', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-3', studentId: 'std-10-3', loginId: '1003', name: 'Rahul Soren', email: 'rahul.soren@student.janta.edu', role: 'student', selectedClass: '10', section: 'A', rollNo: '1003', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-4', studentId: 'std-10-4', loginId: '1004', name: 'Anjali Kumari', email: 'anjali.kumari@student.janta.edu', role: 'student', selectedClass: '10', section: 'A', rollNo: '1004', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-5', studentId: 'std-10-5', loginId: '1005', name: 'Rohit Kumar', email: 'rohit.kumar@student.janta.edu', role: 'student', selectedClass: '10', section: 'B', rollNo: '1005', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-6', studentId: 'std-10-6', loginId: '1006', name: 'Neha Sharma', email: 'neha.sharma@student.janta.edu', role: 'student', selectedClass: '10', section: 'B', rollNo: '1006', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-7', studentId: 'std-10-7', loginId: '1007', name: 'Deepak Mahto', email: 'deepak.mahto@student.janta.edu', role: 'student', selectedClass: '10', section: 'B', rollNo: '1007', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-8', studentId: 'std-10-8', loginId: '1008', name: 'Priya Kumari', email: 'priya.kumari@student.janta.edu', role: 'student', selectedClass: '10', section: 'B', rollNo: '1008', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-1', studentId: 'std-9-1', loginId: '901', name: 'Vicky Kumar', email: 'vicky.kumar@student.janta.edu', role: 'student', selectedClass: '9', section: 'A', rollNo: '901', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-2', studentId: 'std-9-2', loginId: '902', name: 'Sunita Munda', email: 'sunita.munda@student.janta.edu', role: 'student', selectedClass: '9', section: 'A', rollNo: '902', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-3', studentId: 'std-9-3', loginId: '903', name: 'Ajay Oraon', email: 'ajay.oraon@student.janta.edu', role: 'student', selectedClass: '9', section: 'B', rollNo: '903', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-11-1', studentId: 'std-11-1', loginId: '1101', name: 'Rohan Karmali', email: 'rohan.karmali@student.janta.edu', role: 'student', selectedClass: '11', section: 'A', rollNo: '1101', stream: 'Science', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-11-2', studentId: 'std-11-2', loginId: '1102', name: 'Meena Kumari', email: 'meena.kumari@student.janta.edu', role: 'student', selectedClass: '11', section: 'B', rollNo: '1102', stream: 'Arts', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-12-1', studentId: 'std-12-1', loginId: '1201', name: 'Manish Verma', email: 'manish.verma@student.janta.edu', role: 'student', selectedClass: '12', section: 'A', rollNo: '1201', stream: 'Science', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-12-2', studentId: 'std-12-2', loginId: '1202', name: 'Sunita Kumari', email: 'sunita.k12@student.janta.edu', role: 'student', selectedClass: '12', section: 'A', rollNo: '1202', stream: 'Commerce', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
];

export const initialStaffUsers: UserProfile[] = [
  { id: 'tch-101', loginId: 'TCH-101', name: 'Dr. Rameshwar Mahto', email: 'rameshwar.mahto@janta.edu', role: 'teacher', selectedClass: '10', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'tch-102', loginId: 'TCH-102', name: 'Sunita Devi', email: 'sunita.devi@janta.edu', role: 'teacher', selectedClass: '9', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'adm-001', loginId: 'ADM-001', name: 'Senior School Administrator', email: 'admin@janta.edu', role: 'admin', selectedClass: '10', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'prn-001', loginId: 'PRN-001', name: 'Principal Dr. Arvind Kumar', email: 'principal@janta.edu', role: 'principal', selectedClass: '10', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  { id: 'prt-1001', loginId: 'PRT-1001', name: 'Rajesh Kumar Singh (Guardian of Amit)', email: 'rajesh.singh@parents.janta.edu', role: 'parent', selectedClass: '10', childId: 'std-10-1', childName: 'Amit Kumar Singh', childRollNo: '1001', childClass: '10', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'live',
    title: '🔴 Live Class Alert',
    message: 'Dr. A. K. Verma has scheduled a live revision session for Class 10 Science.',
    targetClass: '10',
    linkSection: 'live',
    urgent: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-2',
    type: 'notice',
    title: '📢 JAC Board Registration Notice',
    message: 'Official circular regarding JAC Matric & Intermediate Annual Examination Form submission.',
    targetClass: 'All',
    linkSection: 'notice',
    urgent: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-3',
    type: 'homework',
    title: '📚 New Assignment Assigned',
    message: 'Mathematics: Chapter 8 Introduction to Trigonometry Exercise 8.4 problem set.',
    targetClass: '10',
    linkSection: 'homework',
    urgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-4',
    type: 'exam',
    title: '📅 Pre-Board Exam Datesheet',
    message: 'Pre-Board Examination date sheet published for Classes 10 & 12. Check shift timings.',
    targetClass: 'All',
    linkSection: 'exam',
    urgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-5',
    type: 'attendance',
    title: '✅ Attendance Confirmation',
    message: 'Daily attendance portal is active. Verify your morning attendance before 10:00 AM.',
    targetClass: 'All',
    linkSection: 'attendance',
    urgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-6',
    type: 'result',
    title: '📊 Terminal Result Published',
    message: 'Mid-term evaluation results have been uploaded. Enter your Roll Code and Roll No to view.',
    targetClass: 'All',
    linkSection: 'results',
    urgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    readByStudentIds: [],
  },
  {
    id: 'notif-7',
    type: 'study',
    title: '📖 New Study Material Uploaded',
    message: 'Science & Sanskrit e-books and previous year question bank updated for session 2026-27.',
    targetClass: 'All',
    linkSection: 'study',
    urgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    readByStudentIds: [],
  },
];

const initialHomework: HomeworkItem[] = [
  {
    id: 'hw-1',
    class: '10',
    subject: 'Mathematics',
    title: 'Trigonometric Identities & Applications',
    description: 'Solve textbook NCERT Chapter 8 Exercise 8.4 questions 1 to 5 in your homework notebook with complete proof steps.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    attachmentUrl: 'https://ncert.nic.in/textbook/pdf/jemh108.pdf',
    attachmentName: 'NCERT_Maths_Ch8_Exercise.pdf',
    assignedBy: 'Mr. R. K. Sharma (PGT Mathematics)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    completions: [
      { studentId: 'student_101', studentName: 'Aman Kumar Verma', completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), notes: 'Completed in notebook, questions verified.' }
    ],
  },
  {
    id: 'hw-2',
    class: '10',
    subject: 'Science (Physics)',
    title: 'Light - Reflection and Refraction Ray Diagrams',
    description: 'Draw ray diagrams for concave and convex mirrors showing all 6 object positions and write the sign convention table.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString().split('T')[0],
    attachmentUrl: 'https://ncert.nic.in/textbook/pdf/jesc110.pdf',
    attachmentName: 'Science_Light_RayDiagrams.pdf',
    assignedBy: 'Dr. A. K. Verma (Physics)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    completions: [],
  },
  {
    id: 'hw-3',
    class: '10',
    subject: 'Social Science (Geography)',
    title: 'Resources and Development - Soil Map of India',
    description: 'Mark and shade major soil types of Jharkhand and India (Alluvial, Black, Red and Laterite soil) on an outline political map.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString().split('T')[0],
    assignedBy: 'Mr. B. Munda (SST)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    completions: [],
  },
  {
    id: 'hw-4',
    class: '9',
    subject: 'Mathematics',
    title: 'Number Systems - Rationalising the Denominator',
    description: 'Complete NCERT Chapter 1 Exercise 1.5 all sub-parts on irrational numbers and real number operations.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    assignedBy: 'Mr. S. K. Gupta',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    completions: [],
  },
  {
    id: 'hw-5',
    class: '11',
    subject: 'Physics',
    title: 'Laws of Motion & Friction Numerical Problems',
    description: 'Solve questions on banking of roads and conservation of linear momentum with free-body diagrams.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString().split('T')[0],
    assignedBy: 'Senior Physics Faculty',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completions: [],
  },
  {
    id: 'hw-6',
    class: '12',
    subject: 'Chemistry',
    title: 'Electrochemistry - Nernst Equation Calculations',
    description: 'Calculate standard EMF and equilibrium constants for galvanic cell questions 1 to 8.',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    assignedBy: 'Dr. M. K. Roy',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    completions: [],
  },
];

const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Gandhi Jayanti Holiday',
    description: 'National Holiday celebrating Mahatma Gandhi Jayanti. School remains closed.',
    startDate: '2026-10-02',
    endDate: '2026-10-02',
    category: 'holiday',
    isHoliday: true,
    createdBy: 'Principal Office',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cal-2',
    title: 'Durga Puja / Dussehra Vacation',
    description: 'Autumn festive break for Durga Puja and Dussehra celebrations across Jharkhand.',
    startDate: '2026-10-18',
    endDate: '2026-10-24',
    category: 'holiday',
    isHoliday: true,
    createdBy: 'School Administration',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cal-3',
    title: 'Diwali & Chhath Puja Holidays',
    description: 'Festive holidays for Deepawali, Govardhan Puja, Bhai Dooj and Chhath Mahaparv.',
    startDate: '2026-11-08',
    endDate: '2026-11-15',
    category: 'holiday',
    isHoliday: true,
    createdBy: 'Principal Office',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'cal-4',
    title: 'Annual Science & IT Exhibition 2026',
    description: 'Inter-class science and vocational technology working model exhibition in the school auditorium.',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    category: 'event',
    isHoliday: false,
    createdBy: 'Science Department',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'cal-5',
    title: 'Class 10 & 12 Pre-Board Examination',
    description: 'JAC Board model pattern pre-board examination for matric and intermediate candidates.',
    startDate: '2026-12-10',
    endDate: '2026-12-22',
    category: 'exam',
    isHoliday: false,
    createdBy: 'Examination In-charge',
    createdAt: '2026-09-10T10:00:00Z',
  },
  {
    id: 'cal-6',
    title: 'Annual Sports Day & Athletics Meet',
    description: 'Track and field events, relay races, football tournament, and prize distribution ceremony.',
    startDate: '2027-01-12',
    endDate: '2027-01-13',
    category: 'activity',
    isHoliday: false,
    createdBy: 'Physical Education Dept',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'cal-7',
    title: 'Republic Day Celebration',
    description: 'Flag hoisting at 08:30 AM, national anthem, parade and cultural presentations.',
    startDate: '2027-01-26',
    endDate: '2027-01-26',
    category: 'event',
    isHoliday: false,
    createdBy: 'Principal Office',
    createdAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'cal-8',
    title: 'JAC Annual Board Examination 2027',
    description: 'Jharkhand Academic Council official matric and intermediate board examinations commence.',
    startDate: '2027-02-15',
    endDate: '2027-03-05',
    category: 'exam',
    isHoliday: false,
    createdBy: 'JAC Examination Cell',
    createdAt: '2026-09-15T10:00:00Z',
  },
];

const initialAuditLogs: AdminAuditLog[] = [
  {
    id: 'audit-1',
    action: 'CREATE_NOTICE',
    performedBy: 'Principal / Admin',
    targetType: 'Notice',
    details: 'Published JAC Board Form submission circular with registration guidelines.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'audit-2',
    action: 'CREATE_HOMEWORK',
    performedBy: 'Mr. R. K. Sharma',
    targetType: 'Homework',
    details: 'Created Mathematics Class 10 assignment: Trigonometric Identities.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'audit-3',
    action: 'UPDATE_CALENDAR',
    performedBy: 'Examination Cell',
    targetType: 'Calendar',
    details: 'Added Pre-Board and Annual Examination dates to school master calendar.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'audit-4',
    action: 'UPDATE_ATTENDANCE',
    performedBy: 'Attendance Supervisor',
    targetType: 'Attendance',
    details: 'Verified morning check-ins and locked attendance database for today.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

const initialWrittenQuestions: WrittenQuestion[] = [
  {
    id: 'wq-10-sci-1',
    class: '10',
    subject: 'Science (Physics)',
    chapter: 'Light - Reflection and Refraction',
    question: 'State Snell’s law of refraction and derive the relation between refractive index, speed of light in vacuum, and speed of light in the medium. Also state the conditions for total internal reflection. [5 Marks]',
    marks: 5,
    wordLimit: '150 - 200 words',
    modelAnswer: '1. Snell’s Law: The ratio of the sine of the angle of incidence (i) to the sine of the angle of refraction (r) is a constant for a given pair of media and color of light: sin(i) / sin(r) = constant (n₂₁).\n2. Refractive Index formula: Absolute refractive index n = c / v, where c is speed of light in vacuum (3 × 10⁸ m/s) and v is speed of light in the medium.\n3. Conditions for Total Internal Reflection (TIR):\n   a) Light must travel from an optically denser medium to an optically rarer medium.\n   b) The angle of incidence in the denser medium must be greater than the critical angle (i > c) for the pair of media.',
    markingScheme: '2 marks for Snell’s law statement and formula; 1.5 marks for refractive index relation; 1.5 marks for the two TIR conditions.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wq-10-math-1',
    class: '10',
    subject: 'Mathematics',
    chapter: 'Trigonometry',
    question: 'Prove the trigonometric identity: (sin θ - 2 sin³ θ) / (2 cos³ θ - cos θ) = tan θ. [4 Marks]',
    marks: 4,
    wordLimit: 'Step-by-step mathematical proof',
    modelAnswer: 'LHS = (sin θ - 2 sin³ θ) / (2 cos³ θ - cos θ)\n= [sin θ (1 - 2 sin² θ)] / [cos θ (2 cos² θ - 1)]\nSince 1 = sin² θ + cos² θ:\nNumerator = sin θ (sin² θ + cos² θ - 2 sin² θ) = sin θ (cos² θ - sin² θ)\nDenominator = cos θ (2 cos² θ - (sin² θ + cos² θ)) = cos θ (cos² θ - sin² θ)\nCanceling (cos² θ - sin² θ):\nLHS = sin θ / cos θ = tan θ = RHS. Hence proved.',
    markingScheme: '1 mark for factoring sin θ and cos θ; 2 marks for expanding/substituting 1 = sin²θ + cos²θ; 1 mark for simplification to tan θ.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wq-10-sst-1',
    class: '10',
    subject: 'Social Science',
    chapter: 'Nationalism in India & Jharkhand Movement',
    question: 'Explain the significance of the Non-Cooperation Movement in the Chotanagpur region of Jharkhand. Mention the role of Tana Bhagats and tribal leadership. [5 Marks]',
    marks: 5,
    wordLimit: '150 - 200 words',
    modelAnswer: '1. Tribal Participation: The Tana Bhagats under Jatra Bhagat followed Mahatma Gandhi’s non-violence principles and actively refused to pay chowkidari tax and British rent.\n2. Ranchi & Hazaribagh Centers: Palamu, Ranchi, and Hazaribagh became major agitation zones. Boycott of foreign cloth and British liquor shops was led by tribal women and local volunteers.\n3. National Unity: The movement united urban leaders with rural and forest-dwelling communities across Jharkhand, elevating the local struggle into the national freedom movement.',
    markingScheme: '2 marks for Tana Bhagats movement details; 1.5 marks for boycott movement across districts; 1.5 marks for national integration impact.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wq-9-sci-1',
    class: '9',
    subject: 'Science',
    chapter: 'Force and Laws of Motion',
    question: 'State Newton’s Second Law of Motion and deduce the mathematical formula F = ma. [4 Marks]',
    marks: 4,
    wordLimit: '100 - 150 words',
    modelAnswer: 'Newton’s Second Law states that the rate of change of momentum of an object is proportional to the applied unbalanced force in the direction of force.\nDerivation:\nInitial momentum p₁ = mu, Final momentum p₂ = mv.\nChange in momentum Δp = m(v - u).\nRate of change = m(v - u) / t = ma (since acceleration a = (v - u)/t).\nTherefore, Force F ∝ ma => F = k·ma. In SI units where k = 1, F = ma.',
    markingScheme: '1.5 marks for statement; 2 marks for step-by-step derivation; 0.5 marks for unit definition.',
    createdAt: new Date().toISOString(),
  },
];

const initialChatConversations: ChatConversation[] = [
  {
    id: 'group-10',
    type: 'group',
    title: 'Class 10 - Academic Discussion',
    subtitle: 'Official Classroom & Board Exam Doubt Group',
    class: '10',
    participants: ['all-class-10'],
    lastMessage: 'Dr. A. K. Verma: Remember to revise ray diagrams for the pre-board exam.',
    lastMessageTime: '10:45 AM',
  },
  {
    id: 'group-9',
    type: 'group',
    title: 'Class 9 - Student Study Circle',
    subtitle: 'Daily Homework, Science & Maths Discussions',
    class: '9',
    participants: ['all-class-9'],
    lastMessage: 'Mr. S. K. Gupta: Mathematics exercises 8.1 questions 1 to 5 to be completed today.',
    lastMessageTime: '09:15 AM',
  },
  {
    id: 'group-11',
    type: 'group',
    title: 'Class 11 - Science & Commerce',
    subtitle: 'Physics, Chemistry, Accountancy & Economics',
    class: '11',
    participants: ['all-class-11'],
    lastMessage: 'Acharya R. Mishra: Sanskrit practical recitation notes are uploaded.',
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'group-12',
    type: 'group',
    title: 'Class 12 - JAC Board Focus',
    subtitle: 'Inter-Science, Arts & Commerce Board Preparation',
    class: '12',
    participants: ['all-class-12'],
    lastMessage: 'Dr. Rameshwar Mahto: Model question papers for 2026 examination are available.',
    lastMessageTime: 'Yesterday',
  },
  {
    id: 'dm-teacher-math',
    type: 'direct',
    title: 'Mr. R. K. Sharma (Mathematics PGT)',
    subtitle: 'Direct Teacher Academic Consultation',
    participants: ['teacher-math', 'student'],
    lastMessage: 'Great job solving the quadratic equation exercise. Keep practicing!',
    lastMessageTime: '11:20 AM',
  },
  {
    id: 'dm-principal',
    type: 'direct',
    title: 'Dr. Rameshwar Mahto (Principal Office)',
    subtitle: 'Official Student & Parent Guidance Desk',
    participants: ['principal', 'student', 'parent'],
    lastMessage: 'Welcome to Janta +2 High School academic portal. Feel free to contact for school guidance.',
    lastMessageTime: 'Sep 25',
  },
];

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'group-10',
    senderId: 'faculty-verma',
    senderName: 'Dr. A. K. Verma (Physics)',
    senderRole: 'teacher',
    text: 'Dear Class 10 students, please revise Chapter 10 Light (Reflection & Refraction) numericals tonight. Focus on convex lens magnification formula.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    reactions: { '👍': ['Student Aman', 'Priya Kumari'], '💡': ['Rohit Kumar'] },
  },
  {
    id: 'msg-2',
    conversationId: 'group-10',
    senderId: 'student-aman',
    senderName: 'Aman Kumar (Roll 101)',
    senderRole: 'student',
    text: 'Sir, what is the sign convention for object distance (u) in concave mirror problems?',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    reactions: { '❓': ['Kavita Soren'] },
  },
  {
    id: 'msg-3',
    conversationId: 'group-10',
    senderId: 'faculty-verma',
    senderName: 'Dr. A. K. Verma (Physics)',
    senderRole: 'teacher',
    text: 'Object distance (u) is ALWAYS negative in Cartesian sign conventions because the object is placed to the left of the mirror.',
    replyTo: {
      id: 'msg-2',
      senderName: 'Aman Kumar (Roll 101)',
      text: 'Sir, what is the sign convention for object distance (u)...',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    reactions: { '👏': ['Aman Kumar (Roll 101)', 'Rahul Oraon', 'Pooja Kumari'] },
  },
  {
    id: 'msg-4',
    conversationId: 'group-10',
    senderId: 'faculty-sharma',
    senderName: 'Mr. R. K. Sharma (Maths)',
    senderRole: 'teacher',
    text: 'Class 10 Saturday special schedule: Maths period is 9:45 AM - 10:45 AM followed by S.S.T at 10:45 AM. Be punctual!',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    reactions: { '👍': ['Dr. Rameshwar Mahto', 'Aman Kumar (Roll 101)'] },
  },
];

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    if (!inMemoryDb.attendance) inMemoryDb.attendance = [];
    if (!inMemoryDb.users || inMemoryDb.users.length === 0) inMemoryDb.users = [...initialEnrolledStudents, ...initialStaffUsers];
    if (!inMemoryDb.notifications) inMemoryDb.notifications = [...initialNotifications];
    if (!inMemoryDb.homework) inMemoryDb.homework = [...initialHomework];
    if (!inMemoryDb.calendarEvents) inMemoryDb.calendarEvents = [...initialCalendarEvents];
    if (!inMemoryDb.reportedSafetyItems) inMemoryDb.reportedSafetyItems = [];
    if (!inMemoryDb.auditLogs) inMemoryDb.auditLogs = [...initialAuditLogs];
    if (!inMemoryDb.aboutSchool) inMemoryDb.aboutSchool = initialAboutSchoolData;
    if (!inMemoryDb.writtenQuestions) inMemoryDb.writtenQuestions = [...initialWrittenQuestions];
    if (!inMemoryDb.writtenSubmissions) inMemoryDb.writtenSubmissions = [];
    if (!inMemoryDb.chatConversations) inMemoryDb.chatConversations = [...initialChatConversations];
    if (!inMemoryDb.chatMessages) inMemoryDb.chatMessages = [...initialChatMessages];
    if (!inMemoryDb.testAttempts) inMemoryDb.testAttempts = [];
    if (!inMemoryDb.studentBookmarks) inMemoryDb.studentBookmarks = [];
    if (!inMemoryDb.studentNotes) inMemoryDb.studentNotes = [];
    return inMemoryDb;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(content);
      if (!inMemoryDb!.attendance) inMemoryDb!.attendance = [];
      if (!inMemoryDb!.users || inMemoryDb!.users.length === 0) {
        inMemoryDb!.users = [...initialEnrolledStudents, ...initialStaffUsers];
      } else {
        // Ensure staff accounts exist without overwriting student accounts
        for (const staff of initialStaffUsers) {
          if (!inMemoryDb!.users.some((u) => u.id === staff.id || (staff.loginId && u.loginId === staff.loginId))) {
            inMemoryDb!.users.push(staff);
          }
        }
      }
      if (!inMemoryDb!.notifications) inMemoryDb!.notifications = [...initialNotifications];
      if (!inMemoryDb!.homework) inMemoryDb!.homework = [...initialHomework];
      if (!inMemoryDb!.calendarEvents) inMemoryDb!.calendarEvents = [...initialCalendarEvents];
      if (!inMemoryDb!.reportedSafetyItems) inMemoryDb!.reportedSafetyItems = [];
      if (!inMemoryDb!.auditLogs) inMemoryDb!.auditLogs = [...initialAuditLogs];
      if (!inMemoryDb!.aboutSchool) inMemoryDb!.aboutSchool = initialAboutSchoolData;
      if (!inMemoryDb!.writtenQuestions) inMemoryDb!.writtenQuestions = [...initialWrittenQuestions];
      if (!inMemoryDb!.writtenSubmissions) inMemoryDb!.writtenSubmissions = [];
      if (!inMemoryDb!.chatConversations) inMemoryDb!.chatConversations = [...initialChatConversations];
      if (!inMemoryDb!.chatMessages) inMemoryDb!.chatMessages = [...initialChatMessages];
      if (!inMemoryDb!.testAttempts) inMemoryDb!.testAttempts = [];
      if (!inMemoryDb!.studentBookmarks) inMemoryDb!.studentBookmarks = [];
      if (!inMemoryDb!.studentNotes) inMemoryDb!.studentNotes = [];
      return inMemoryDb!;
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
  }

  inMemoryDb = {
    users: [...initialEnrolledStudents, ...initialStaffUsers],
    liveClassSessions: initialLiveSessions,
    mcqQuestions: initialMcqQuestions,
    books: initialBooks,
    timetables: initialTimetables,
    notices: initialNotices,
    examSchedules: initialExamSchedules,
    results: initialResults,
    faculty: initialFaculty,
    attendance: [],
    notifications: [...initialNotifications],
    homework: [...initialHomework],
    calendarEvents: [...initialCalendarEvents],
    reportedSafetyItems: [],
    auditLogs: [...initialAuditLogs],
    aboutSchool: initialAboutSchoolData,
    testAttempts: [],
    studentBookmarks: [],
    studentNotes: [],
  };

  saveDatabase(inMemoryDb);
  return inMemoryDb;
}

export function saveDatabase(db: DatabaseSchema) {
  inMemoryDb = db;
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database to disk:', err);
  }
}

// Entity helper functions
export const db = {
  // Authentication & Passwords
  authenticateUser(
    role: UserRole,
    loginId: string,
    password: string,
    selectedClass?: string
  ): { success: boolean; user?: UserProfile; message?: string } {
    if (!loginId || !password) {
      return { success: false, message: 'Login ID and password are required.' };
    }

    const data = getDatabase();
    const cleanId = loginId.trim().toLowerCase();

    // Find user matching role and identifier
    const user = data.users.find((u) => {
      if (u.role !== role) {
        if (!(role === 'admin' && u.role === 'principal')) {
          return false;
        }
      }

      const matchId = u.id && u.id.toLowerCase() === cleanId;
      const matchStudentId = u.studentId && u.studentId.toLowerCase() === cleanId;
      const matchLoginId = u.loginId && u.loginId.toLowerCase() === cleanId;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const matchRoll =
        u.role === 'student' &&
        u.rollNo &&
        u.rollNo.toLowerCase() === cleanId &&
        (!selectedClass || u.selectedClass === selectedClass);

      return matchId || matchStudentId || matchLoginId || matchEmail || matchRoll;
    });

    if (!user) {
      return { success: false, message: 'Invalid Login ID or Password.' };
    }

    // Verify Password
    let isPasswordValid = false;
    if (user.passwordHash) {
      isPasswordValid = verifyPassword(password, user.passwordHash);
    } else {
      // Fallback verification for initial seed accounts
      if (user.role === 'student') {
        isPasswordValid =
          password === (user.rollNo || 'student123') ||
          password === 'student123' ||
          password === '123456';
      } else if (user.role === 'teacher') {
        isPasswordValid = password === 'teacher123';
      } else if (user.role === 'admin') {
        isPasswordValid = password === 'admin12345678';
      } else if (user.role === 'principal') {
        isPasswordValid = password === 'principal123';
      } else if (user.role === 'parent') {
        isPasswordValid = password === 'parent123';
      }

      if (isPasswordValid) {
        user.passwordHash = hashPassword(password);
        saveDatabase(data);
      }
    }

    if (!isPasswordValid) {
      return { success: false, message: 'Invalid Login ID or Password.' };
    }

    return {
      success: true,
      user,
    };
  },

  changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    if (!userId || !currentPassword || !newPassword) {
      return { success: false, message: 'All password fields are required.' };
    }

    if (newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const data = getDatabase();
    const clean = userId.trim().toLowerCase();
    const user = data.users.find(
      (u) =>
        (u.id && u.id.toLowerCase() === clean) ||
        (u.studentId && u.studentId.toLowerCase() === clean) ||
        (u.loginId && u.loginId.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.rollNo && u.rollNo.toLowerCase() === clean)
    );

    if (!user) {
      return { success: false, message: 'Account not found.' };
    }

    // Verify current password
    let isCurrentValid = false;
    if (user.passwordHash) {
      isCurrentValid = verifyPassword(currentPassword, user.passwordHash);
    } else {
      if (user.role === 'student') {
        isCurrentValid =
          currentPassword === (user.rollNo || 'student123') || currentPassword === 'student123';
      } else if (user.role === 'teacher') {
        isCurrentValid = currentPassword === 'teacher123';
      } else if (user.role === 'admin') {
        isCurrentValid = currentPassword === 'admin12345678';
      } else if (user.role === 'principal') {
        isCurrentValid = currentPassword === 'principal123';
      } else if (user.role === 'parent') {
        isCurrentValid = currentPassword === 'parent123';
      }
    }

    if (!isCurrentValid) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    user.passwordHash = hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    saveDatabase(data);

    return { success: true, message: 'Password changed successfully.' };
  },

  // Users & Profiles: Permanent identification & secure persistence
  findUser(identifier: string): UserProfile | undefined {
    if (!identifier) return undefined;
    const data = getDatabase();
    const clean = identifier.trim().toLowerCase();
    return data.users.find(
      (u) =>
        (u.id && u.id.toLowerCase() === clean) ||
        (u.studentId && u.studentId.toLowerCase() === clean) ||
        (u.loginId && u.loginId.toLowerCase() === clean) ||
        (u.email && u.email.toLowerCase() === clean) ||
        (u.rollNo && u.rollNo.toLowerCase() === clean)
    );
  },

  findUserByEmail(email: string): UserProfile | undefined {
    if (!email) return undefined;
    const data = getDatabase();
    return data.users.find((u) => u.email && u.email.toLowerCase() === email.trim().toLowerCase());
  },

  findUserById(id: string): UserProfile | undefined {
    if (!id) return undefined;
    const data = getDatabase();
    return data.users.find((u) => u.id === id || u.studentId === id || u.loginId === id);
  },

  findStudentByRoll(rollNo: string, selectedClass?: SchoolClass): UserProfile | undefined {
    if (!rollNo) return undefined;
    const data = getDatabase();
    const cleanRoll = rollNo.trim().toLowerCase();
    return data.users.find(
      (u) =>
        u.role === 'student' &&
        u.rollNo &&
        u.rollNo.toLowerCase() === cleanRoll &&
        (!selectedClass || u.selectedClass === selectedClass)
    );
  },

  // Dedicated Student Registration with Strict Validation & Verification
  registerStudent(input: {
    name: string;
    selectedClass: SchoolClass;
    section?: string;
    rollNo: string;
    phone?: string;
    studentId?: string;
    password: string;
    stream?: 'Science' | 'Commerce' | 'Arts' | 'General';
  }): {
    success: boolean;
    user?: UserProfile;
    errorType?: 'validation' | 'duplicate_id' | 'duplicate_roll' | 'password_format' | 'database_error';
    message: string;
  } {
    // 1. Validate required fields
    if (!input.name || !input.name.trim()) {
      return { success: false, errorType: 'validation', message: 'Student Full Name is required.' };
    }
    if (!input.rollNo || !input.rollNo.trim()) {
      return { success: false, errorType: 'validation', message: 'Roll Number is required.' };
    }
    if (!input.password) {
      return { success: false, errorType: 'password_format', message: 'Password is required.' };
    }
    if (input.password.length < 4) {
      return { success: false, errorType: 'password_format', message: 'Password must be at least 4 characters.' };
    }

    // 2. Check Database connection
    let data: DatabaseSchema;
    try {
      data = getDatabase();
      if (!data || !Array.isArray(data.users)) {
        return { success: false, errorType: 'database_error', message: 'School database is temporarily unavailable. Please try again.' };
      }
    } catch {
      return { success: false, errorType: 'database_error', message: 'School database is temporarily unavailable. Please try again.' };
    }

    const cleanRoll = input.rollNo.trim();
    const cleanSection = (input.section || 'A').trim().toUpperCase();
    const targetClass = input.selectedClass || '10';
    const targetStudentId = (
      input.studentId?.trim() ||
      `std-${targetClass}-${cleanRoll.replace(/[^a-zA-Z0-9]/g, '')}`
    ).toLowerCase();

    // 3. Check for Duplicate Student ID
    const duplicateId = data.users.find(
      (u) =>
        (u.id && u.id.toLowerCase() === targetStudentId) ||
        (u.studentId && u.studentId.toLowerCase() === targetStudentId) ||
        (u.loginId && u.loginId.toLowerCase() === targetStudentId)
    );
    if (duplicateId) {
      return {
        success: false,
        errorType: 'duplicate_id',
        message: 'This Student ID is already registered.',
      };
    }

    // 4. Check for Duplicate Roll in same Class and Section
    const duplicateRoll = data.users.find(
      (u) =>
        u.role === 'student' &&
        u.rollNo &&
        u.rollNo.trim().toLowerCase() === cleanRoll.toLowerCase() &&
        u.selectedClass === targetClass &&
        (u.section || 'A').trim().toUpperCase() === cleanSection
    );
    if (duplicateRoll) {
      return {
        success: false,
        errorType: 'duplicate_roll',
        message: `A student with Roll No. ${cleanRoll} is already registered in Class ${targetClass} Section ${cleanSection}.`,
      };
    }

    // 5. Secure password hashing & permanent ID creation
    const now = new Date().toISOString();
    const permanentAccountId = `std-${targetClass}-${cleanRoll.replace(/[^a-zA-Z0-9]/g, '')}`;
    const generatedEmail = `${permanentAccountId.toLowerCase()}@student.janta.edu`;
    const passwordHash = hashPassword(input.password);

    const newStudent: UserProfile = {
      id: permanentAccountId,
      studentAccountId: permanentAccountId,
      studentId: permanentAccountId,
      loginId: permanentAccountId,
      email: generatedEmail,
      name: input.name.trim(),
      picture: '',
      role: 'student',
      selectedClass: targetClass,
      section: cleanSection,
      rollNo: cleanRoll,
      stream: input.stream || 'General',
      phone: input.phone?.trim() || '',
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    // 6. Save account permanently to database
    try {
      data.users.push(newStudent);
      saveDatabase(data);

      // Verify persistence in database
      const verifyData = getDatabase();
      const verified = verifyData.users.find((u) => u.id === permanentAccountId);
      if (!verified) {
        return {
          success: false,
          errorType: 'database_error',
          message: 'School database is temporarily unavailable. Please try again.',
        };
      }

      return {
        success: true,
        user: verified,
        message: 'Account created successfully.',
      };
    } catch {
      return {
        success: false,
        errorType: 'database_error',
        message: 'School database is temporarily unavailable. Please try again.',
      };
    }
  },

  // SAFE Upsert: Never overwrite existing data on login/reopen
  upsertUser(user: Partial<UserProfile> & { name: string }): UserProfile {
    const data = getDatabase();
    const now = new Date().toISOString();

    const lookupId = (user.id || user.studentId || user.loginId || '').trim().toLowerCase();
    const lookupEmail = (user.email || '').trim().toLowerCase();
    const lookupRoll = (user.rollNo || '').trim().toLowerCase();
    const lookupClass = user.selectedClass;

    // 1. Locate existing account by permanent unique identifiers
    let existingIndex = -1;
    if (lookupId) {
      existingIndex = data.users.findIndex(
        (u) =>
          (u.id && u.id.toLowerCase() === lookupId) ||
          (u.studentId && u.studentId.toLowerCase() === lookupId) ||
          (u.loginId && u.loginId.toLowerCase() === lookupId)
      );
    }

    if (existingIndex < 0 && lookupEmail) {
      existingIndex = data.users.findIndex(
        (u) => u.email && u.email.toLowerCase() === lookupEmail
      );
    }

    if (existingIndex < 0 && lookupRoll && user.role === 'student') {
      existingIndex = data.users.findIndex(
        (u) =>
          u.role === 'student' &&
          u.rollNo &&
          u.rollNo.toLowerCase() === lookupRoll &&
          (!lookupClass || u.selectedClass === lookupClass)
      );
    }

    // 2. EXISTING ACCOUNT FOUND: Safe Partial Update
    if (existingIndex >= 0) {
      const existing = data.users[existingIndex];
      const updated: UserProfile = {
        ...existing,
        name: user.name || existing.name,
        picture: user.picture !== undefined ? user.picture : existing.picture,
        selectedClass: user.selectedClass || existing.selectedClass,
        section: user.section || existing.section || 'A',
        rollNo: user.rollNo || existing.rollNo,
        stream: user.stream || existing.stream,
        phone: user.phone || existing.phone,
        childId: user.childId || existing.childId,
        childName: user.childName || existing.childName,
        childRollNo: user.childRollNo || existing.childRollNo,
        childClass: user.childClass || existing.childClass,
        studentId: existing.studentId || user.studentId || existing.id,
        loginId: existing.loginId || user.loginId,
        updatedAt: now,
      };

      if (user.passwordHash) {
        updated.passwordHash = user.passwordHash;
      }

      data.users[existingIndex] = updated;
      saveDatabase(data);
      return updated;
    }

    // 3. NEW ACCOUNT: Create permanent student identity
    const studentClass = user.selectedClass || '10';
    const cleanRollNum = (user.rollNo || '').trim().replace(/[^a-zA-Z0-9]/g, '');
    const permanentStudentId =
      user.studentId?.trim() ||
      user.id?.trim() ||
      (user.role === 'student' && cleanRollNum
        ? `std-${studentClass}-${cleanRollNum}`
        : `usr-${user.role || 'std'}-${Date.now().toString(36)}`);

    const permanentLoginId =
      user.loginId?.trim() ||
      (user.role === 'student' ? user.rollNo?.trim() || permanentStudentId : permanentStudentId);

    const generatedEmail =
      user.email?.trim() ||
      `${permanentLoginId.toLowerCase()}@student.janta.edu`;

    const newUser: UserProfile = {
      id: permanentStudentId,
      studentId: permanentStudentId,
      loginId: permanentLoginId,
      email: generatedEmail,
      name: user.name.trim(),
      picture: user.picture || '',
      role: user.role || 'student',
      selectedClass: studentClass,
      section: user.section?.trim().toUpperCase() || 'A',
      rollNo: user.rollNo?.trim() || '',
      stream: user.stream || 'General',
      phone: user.phone?.trim() || '',
      childId: user.childId,
      childName: user.childName,
      childRollNo: user.childRollNo,
      childClass: user.childClass,
      passwordHash: user.passwordHash || (user.rollNo ? hashPassword(user.rollNo) : undefined),
      createdAt: now,
      updatedAt: now,
    };

    data.users.push(newUser);
    saveDatabase(data);
    return newUser;
  },

  // Safe Profile Update
  updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): { success: boolean; user?: UserProfile; message?: string } {
    if (!userId) return { success: false, message: 'User ID is required' };
    const data = getDatabase();
    const clean = userId.trim().toLowerCase();
    const index = data.users.findIndex(
      (u) =>
        (u.id && u.id.toLowerCase() === clean) ||
        (u.studentId && u.studentId.toLowerCase() === clean) ||
        (u.loginId && u.loginId.toLowerCase() === clean)
    );

    if (index < 0) {
      return { success: false, message: 'Student account not found in database.' };
    }

    const current = data.users[index];
    // Guard against unauthorized role escalation
    const safeUpdates: Partial<UserProfile> = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.id;
    delete safeUpdates.studentId;
    delete safeUpdates.createdAt;

    const updatedUser: UserProfile = {
      ...current,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };

    data.users[index] = updatedUser;
    saveDatabase(data);

    return {
      success: true,
      user: updatedUser,
      message: 'Profile updated and verified in database.',
    };
  },

  // Admin Delete Student Account (Requirement 9)
  deleteStudentAccount(
    studentId: string,
    adminRole: string
  ): { success: boolean; message: string } {
    if (adminRole !== 'admin' && adminRole !== 'principal') {
      return { success: false, message: 'Unauthorized. Admin permission required.' };
    }

    const data = getDatabase();
    const clean = studentId.trim().toLowerCase();
    const initialCount = data.users.length;
    data.users = data.users.filter(
      (u) =>
        u.id.toLowerCase() !== clean &&
        (!u.studentId || u.studentId.toLowerCase() !== clean)
    );

    if (data.users.length === initialCount) {
      return { success: false, message: 'Student account not found.' };
    }

    // Clean linked data
    if (data.testAttempts) {
      data.testAttempts = data.testAttempts.filter((t) => t.studentId?.toLowerCase() !== clean);
    }
    if (data.studentBookmarks) {
      data.studentBookmarks = data.studentBookmarks.filter(
        (b) => (b.metadata as any)?.studentId?.toLowerCase() !== clean
      );
    }
    if (data.studentNotes) {
      data.studentNotes = data.studentNotes.filter((n) => n.studentId.toLowerCase() !== clean);
    }

    saveDatabase(data);
    return { success: true, message: `Student account ${studentId} permanently deleted.` };
  },

  // Test Attempt Records linked to permanent Student ID
  saveTestAttempt(attempt: Omit<TestAttemptRecord, 'id' | 'date'> & { studentId: string }): TestAttemptRecord {
    const data = getDatabase();
    if (!data.testAttempts) data.testAttempts = [];

    const record: TestAttemptRecord = {
      ...attempt,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
    };

    data.testAttempts.unshift(record);
    saveDatabase(data);
    return record;
  },

  getTestAttempts(studentId: string): TestAttemptRecord[] {
    const data = getDatabase();
    if (!data.testAttempts) return [];
    const clean = studentId.trim().toLowerCase();
    return data.testAttempts.filter(
      (a) => a.studentId && a.studentId.toLowerCase() === clean
    );
  },

  // Bookmarks linked to permanent Student ID
  saveBookmark(studentId: string, bookmark: Omit<BookmarkItem, 'savedAt'>): BookmarkItem {
    const data = getDatabase();
    if (!data.studentBookmarks) data.studentBookmarks = [];

    const fullBookmark: BookmarkItem = {
      ...bookmark,
      savedAt: new Date().toISOString(),
      metadata: { ...(bookmark.metadata || {}), studentId },
    };

    data.studentBookmarks = data.studentBookmarks.filter(
      (b) => !(b.itemId === bookmark.itemId && (b.metadata as any)?.studentId === studentId)
    );
    data.studentBookmarks.unshift(fullBookmark);
    saveDatabase(data);
    return fullBookmark;
  },

  removeBookmark(studentId: string, itemId: string): boolean {
    const data = getDatabase();
    if (!data.studentBookmarks) return false;
    const initialLen = data.studentBookmarks.length;
    data.studentBookmarks = data.studentBookmarks.filter(
      (b) => !(b.itemId === itemId && (b.metadata as any)?.studentId === studentId)
    );
    if (data.studentBookmarks.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  getBookmarks(studentId: string): BookmarkItem[] {
    const data = getDatabase();
    if (!data.studentBookmarks) return [];
    return data.studentBookmarks.filter((b) => (b.metadata as any)?.studentId === studentId);
  },

  // Student Notes linked to permanent Student ID
  saveStudentNote(
    studentId: string,
    note: { title: string; content: string; subject?: string; id?: string }
  ): StudentNote {
    const data = getDatabase();
    if (!data.studentNotes) data.studentNotes = [];
    const now = new Date().toISOString();

    if (note.id) {
      const idx = data.studentNotes.findIndex((n) => n.id === note.id && n.studentId === studentId);
      if (idx >= 0) {
        data.studentNotes[idx] = {
          ...data.studentNotes[idx],
          title: note.title,
          content: note.content,
          subject: note.subject || data.studentNotes[idx].subject,
          updatedAt: now,
        };
        saveDatabase(data);
        return data.studentNotes[idx];
      }
    }

    const newNote: StudentNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      title: note.title,
      content: note.content,
      subject: note.subject || 'General',
      createdAt: now,
      updatedAt: now,
    };

    data.studentNotes.unshift(newNote);
    saveDatabase(data);
    return newNote;
  },

  deleteStudentNote(studentId: string, noteId: string): boolean {
    const data = getDatabase();
    if (!data.studentNotes) return false;
    const initialLen = data.studentNotes.length;
    data.studentNotes = data.studentNotes.filter((n) => !(n.id === noteId && n.studentId === studentId));
    if (data.studentNotes.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  getStudentNotes(studentId: string): StudentNote[] {
    const data = getDatabase();
    if (!data.studentNotes) return [];
    const clean = studentId.trim().toLowerCase();
    return data.studentNotes.filter((n) => n.studentId.toLowerCase() === clean);
  },

  // Live Sessions
  getLiveSessions(filterClass?: string): LiveClassSession[] {
    const data = getDatabase();
    if (filterClass) {
      return data.liveClassSessions.filter((s) => s.class === filterClass);
    }
    return data.liveClassSessions;
  },
  getActiveLiveSession(meetingIdOrClass: string): LiveClassSession | undefined {
    const data = getDatabase();
    return data.liveClassSessions.find(
      (s) => s.status === 'live' && (s.meetingId === meetingIdOrClass || s.class === meetingIdOrClass)
    );
  },
  createLiveSession(session: Omit<LiveClassSession, 'id' | 'status' | 'startedAt'>): LiveClassSession {
    const data = getDatabase();
    // End any existing live session for the same class to avoid conflicts
    data.liveClassSessions.forEach((s) => {
      if (s.class === session.class && s.status === 'live') {
        s.status = 'ended';
        s.endedAt = new Date().toISOString();
      }
    });

    const newSession: LiveClassSession = {
      ...session,
      id: `live_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'live',
      startedAt: new Date().toISOString(),
    };
    data.liveClassSessions.unshift(newSession);
    saveDatabase(data);
    return newSession;
  },
  endLiveSession(sessionId: string): LiveClassSession | null {
    const data = getDatabase();
    const session = data.liveClassSessions.find((s) => s.id === sessionId || s.meetingId === sessionId);
    if (!session) return null;
    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    saveDatabase(data);
    return session;
  },

  // MCQ
  getMcqs(classNum?: string, subject?: string): MCQQuestion[] {
    const data = getDatabase();
    let questions = data.mcqQuestions;
    if (classNum) {
      questions = questions.filter((q) => q.class === classNum);
    }
    if (subject && subject !== 'All') {
      questions = questions.filter((q) => q.subject.toLowerCase() === subject.toLowerCase());
    }
    return questions;
  },
  addMcq(mcq: Omit<MCQQuestion, 'id'>): MCQQuestion {
    const data = getDatabase();
    const newMcq: MCQQuestion = {
      ...mcq,
      id: `mcq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    data.mcqQuestions.unshift(newMcq);
    saveDatabase(data);
    return newMcq;
  },
  updateMcq(id: string, updates: Partial<MCQQuestion>): MCQQuestion | null {
    const data = getDatabase();
    const idx = data.mcqQuestions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    data.mcqQuestions[idx] = { ...data.mcqQuestions[idx], ...updates };
    saveDatabase(data);
    return data.mcqQuestions[idx];
  },
  deleteMcq(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.mcqQuestions.length;
    data.mcqQuestions = data.mcqQuestions.filter((q) => q.id !== id);
    if (data.mcqQuestions.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Books
  getBooks(classNum?: string, subject?: string): Book[] {
    const data = getDatabase();
    let books = data.books;
    if (classNum) {
      books = books.filter((b) => b.class === classNum);
    }
    if (subject && subject !== 'All') {
      books = books.filter((b) => b.subject.toLowerCase() === subject.toLowerCase());
    }
    return books;
  },
  addBook(book: Omit<Book, 'id' | 'uploadedAt'>): Book {
    const data = getDatabase();
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: new Date().toISOString(),
    };
    data.books.unshift(newBook);
    saveDatabase(data);
    return newBook;
  },
  deleteBook(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.books.length;
    data.books = data.books.filter((b) => b.id !== id);
    if (data.books.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Timetables
  getTimetables(classNum?: string, day?: string): TimetableEntry[] {
    const data = getDatabase();
    let list = data.timetables;
    if (classNum) {
      list = list.filter((t) => t.class === classNum);
    }
    if (day) {
      list = list.filter((t) => t.day.toLowerCase() === day.toLowerCase());
    }
    return list;
  },
  addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): TimetableEntry {
    const data = getDatabase();
    const newEntry: TimetableEntry = {
      ...entry,
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    data.timetables.push(newEntry);
    saveDatabase(data);
    return newEntry;
  },
  deleteTimetableEntry(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.timetables.length;
    data.timetables = data.timetables.filter((t) => t.id !== id);
    if (data.timetables.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Notices
  getNotices(): Notice[] {
    const data = getDatabase();
    return data.notices;
  },
  addNotice(notice: Omit<Notice, 'id' | 'createdAt'>): Notice {
    const data = getDatabase();
    const newNotice: Notice = {
      ...notice,
      id: `n_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.notices.unshift(newNotice);
    saveDatabase(data);
    return newNotice;
  },
  deleteNotice(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.notices.length;
    data.notices = data.notices.filter((n) => n.id !== id);
    if (data.notices.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Exam Schedules
  getExamSchedules(classNum?: string): ExamSchedule[] {
    const data = getDatabase();
    if (classNum) {
      return data.examSchedules.filter((e) => e.class === classNum);
    }
    return data.examSchedules;
  },
  addExamSchedule(exam: Omit<ExamSchedule, 'id'>): ExamSchedule {
    const data = getDatabase();
    const newExam: ExamSchedule = {
      ...exam,
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    data.examSchedules.push(newExam);
    saveDatabase(data);
    return newExam;
  },
  deleteExamSchedule(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.examSchedules.length;
    data.examSchedules = data.examSchedules.filter((e) => e.id !== id);
    if (data.examSchedules.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Results
  getResults(classNum?: string, rollNo?: string): PublishedResult[] {
    const data = getDatabase();
    let res = data.results;
    if (classNum) {
      res = res.filter((r) => r.class === classNum);
    }
    if (rollNo) {
      res = res.filter((r) => r.rollNo === rollNo || r.rollCode === rollNo);
    }
    return res;
  },
  addResult(result: Omit<PublishedResult, 'id' | 'publishedAt'>): PublishedResult {
    const data = getDatabase();
    const newRes: PublishedResult = {
      ...result,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      publishedAt: new Date().toISOString(),
    };
    data.results.unshift(newRes);
    saveDatabase(data);
    return newRes;
  },
  deleteResult(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.results.length;
    data.results = data.results.filter((r) => r.id !== id);
    if (data.results.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Faculty
  getFaculty(): FacultyMember[] {
    const data = getDatabase();
    return data.faculty;
  },
  addFaculty(f: Omit<FacultyMember, 'id'>): FacultyMember {
    const data = getDatabase();
    const newF: FacultyMember = {
      ...f,
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    data.faculty.push(newF);
    saveDatabase(data);
    return newF;
  },
  deleteFaculty(id: string): boolean {
    const data = getDatabase();
    const initialLen = data.faculty.length;
    data.faculty = data.faculty.filter((f) => f.id !== id);
    if (data.faculty.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // Online Student Attendance System
  getEnrolledStudents(classNum?: string): UserProfile[] {
    const data = getDatabase();
    let students = data.users.filter((u) => u.role === 'student');
    if (classNum) {
      students = students.filter((s) => s.selectedClass === classNum);
    }
    return students;
  },

  getAttendanceRecords(filter?: {
    studentId?: string;
    studentEmail?: string;
    class?: string;
    date?: string;
    month?: string;
  }): AttendanceRecord[] {
    const data = getDatabase();
    let records = data.attendance || [];

    if (filter?.studentId) {
      records = records.filter(
        (r) =>
          r.studentId === filter.studentId ||
          (filter.studentEmail && r.studentEmail.toLowerCase() === filter.studentEmail.toLowerCase())
      );
    }
    if (filter?.class) {
      records = records.filter((r) => r.class === filter.class);
    }
    if (filter?.date) {
      records = records.filter((r) => r.date === filter.date);
    }
    if (filter?.month) {
      // YYYY-MM
      records = records.filter((r) => r.date.startsWith(filter.month!));
    }

    return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getAttendanceRecordByStudentAndDate(studentId: string, date: string, studentEmail?: string): AttendanceRecord | undefined {
    const data = getDatabase();
    return (data.attendance || []).find(
      (r) =>
        (r.studentId === studentId || (studentEmail && r.studentEmail.toLowerCase() === studentEmail.toLowerCase())) &&
        r.date === date
    );
  },

  markAttendance(record: Omit<AttendanceRecord, 'id' | 'timestamp'>): {
    success: boolean;
    code?: string;
    message?: string;
    record?: AttendanceRecord;
  } {
    const data = getDatabase();
    data.attendance = data.attendance || [];

    // STRICT RULE: Only ONE attendance record per student per day
    const existing = data.attendance.find(
      (r) =>
        (r.studentId === record.studentId ||
          (record.studentEmail && r.studentEmail.toLowerCase() === record.studentEmail.toLowerCase())) &&
        r.date === record.date
    );

    if (existing) {
      return {
        success: false,
        code: 'ALREADY_MARKED',
        message: `Attendance already marked for today (${record.date}) at ${existing.time}.`,
        record: existing,
      };
    }

    const nowIso = new Date().toISOString();
    const newRecord: AttendanceRecord = {
      ...record,
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: nowIso,
      status: 'Present',
    };

    data.attendance.unshift(newRecord);
    saveDatabase(data);

    return {
      success: true,
      message: 'Attendance marked successfully',
      record: newRecord,
    };
  },

  updateAttendanceRecord(
    id: string,
    updates: Partial<AttendanceRecord>,
    adminName?: string
  ): AttendanceRecord | null {
    const data = getDatabase();
    data.attendance = data.attendance || [];
    const idx = data.attendance.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    data.attendance[idx] = {
      ...data.attendance[idx],
      ...updates,
      correctedBy: adminName || 'School Admin',
    };
    saveDatabase(data);
    return data.attendance[idx];
  },

  deleteAttendanceRecord(id: string): boolean {
    const data = getDatabase();
    data.attendance = data.attendance || [];
    const initLen = data.attendance.length;
    data.attendance = data.attendance.filter((r) => r.id !== id);
    if (data.attendance.length !== initLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  getClassAttendanceSummary(classNum: string, date: string) {
    const data = getDatabase();
    const enrolled = (data.users || []).filter(
      (u) => u.selectedClass === classNum && u.role === 'student'
    );
    const dayRecords = (data.attendance || []).filter(
      (r) => r.class === classNum && r.date === date
    );

    const presentStudents = dayRecords.filter((r) => r.status === 'Present');
    const presentStudentIds = new Set(presentStudents.map((r) => r.studentId));
    const presentEmails = new Set(presentStudents.map((r) => r.studentEmail.toLowerCase()));

    const absentStudents = enrolled
      .filter((s) => !presentStudentIds.has(s.id) && !presentEmails.has(s.email.toLowerCase()))
      .map((s) => {
        const explicitAbsent = dayRecords.find(
          (r) =>
            (r.studentId === s.id || r.studentEmail.toLowerCase() === s.email.toLowerCase()) &&
            r.status === 'Absent'
        );
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          rollNo: s.rollNo || '-',
          class: s.selectedClass,
          status: 'Absent' as const,
          recordId: explicitAbsent?.id,
          remarks: explicitAbsent?.remarks || 'Not checked in',
        };
      });

    const totalEnrolled = Math.max(enrolled.length, presentStudents.length + absentStudents.length);
    const percentage =
      totalEnrolled > 0 ? Math.round((presentStudents.length / totalEnrolled) * 100) : 0;

    return {
      class: classNum,
      date,
      totalEnrolled,
      presentCount: presentStudents.length,
      absentCount: absentStudents.length,
      percentage,
      presentStudents,
      absentStudents,
    };
  },

  getStudentAttendanceSummary(studentId: string, classNum: string, studentEmail?: string) {
    const data = getDatabase();
    const today = new Date().toISOString().split('T')[0];

    const allRecords = (data.attendance || []).filter(
      (r) =>
        r.studentId === studentId ||
        (studentEmail && r.studentEmail.toLowerCase() === studentEmail.toLowerCase())
    );

    const todayRecord = allRecords.find((r) => r.date === today && r.status === 'Present');
    const presentDays = allRecords.filter((r) => r.status === 'Present').length;
    const totalSchoolDays = Math.max(24, presentDays + 2);
    const percentage =
      totalSchoolDays > 0 ? Math.min(100, Math.round((presentDays / totalSchoolDays) * 100)) : 100;

    return {
      studentId,
      class: classNum,
      todayStatus: todayRecord ? ('Present' as const) : ('Not Marked' as const),
      todayRecord,
      totalSchoolDays,
      presentDays,
      attendancePercentage: percentage,
      history: allRecords.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  },

  // School Official Support & Contact Information
  getSchoolContact(): SchoolContactInfo {
    const data = getDatabase();
    return data.schoolContact || {};
  },

  updateSchoolContact(info: Partial<SchoolContactInfo>): SchoolContactInfo {
    const data = getDatabase();
    data.schoolContact = {
      ...(data.schoolContact || {}),
      ...info,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(data);
    return data.schoolContact;
  },

  // 1. NOTIFICATIONS
  getNotifications(classNum?: string, studentId?: string): (NotificationItem & { isRead: boolean })[] {
    const data = getDatabase();
    const list = data.notifications || [];
    return list
      .filter((n) => !classNum || n.targetClass === 'All' || n.targetClass === classNum)
      .map((n) => ({
        ...n,
        isRead: studentId ? (n.readByStudentIds || []).includes(studentId) : false,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  markNotificationRead(notificationId: string, studentId: string): boolean {
    const data = getDatabase();
    data.notifications = data.notifications || [];
    const item = data.notifications.find((n) => n.id === notificationId);
    if (!item) return false;
    item.readByStudentIds = item.readByStudentIds || [];
    if (!item.readByStudentIds.includes(studentId)) {
      item.readByStudentIds.push(studentId);
      saveDatabase(data);
    }
    return true;
  },

  markAllNotificationsRead(studentId: string): boolean {
    const data = getDatabase();
    data.notifications = data.notifications || [];
    let modified = false;
    data.notifications.forEach((n) => {
      n.readByStudentIds = n.readByStudentIds || [];
      if (!n.readByStudentIds.includes(studentId)) {
        n.readByStudentIds.push(studentId);
        modified = true;
      }
    });
    if (modified) saveDatabase(data);
    return true;
  },

  createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const data = getDatabase();
    data.notifications = data.notifications || [];
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      readByStudentIds: [],
    };
    data.notifications.unshift(newNotif);
    saveDatabase(data);
    return newNotif;
  },

  // 2. ASSIGNMENTS / HOMEWORK
  getHomework(classNum?: string): HomeworkItem[] {
    const data = getDatabase();
    let list = data.homework || [];
    if (classNum) {
      list = list.filter((h) => h.class === classNum);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createHomework(item: Omit<HomeworkItem, 'id' | 'createdAt' | 'completions'>, creator: string): HomeworkItem {
    const data = getDatabase();
    data.homework = data.homework || [];
    const newHw: HomeworkItem = {
      ...item,
      id: `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      completions: [],
    };
    data.homework.unshift(newHw);

    // Also auto-notify students
    data.notifications = data.notifications || [];
    data.notifications.unshift({
      id: `notif-${Date.now()}-hw`,
      type: 'homework',
      title: `📚 New Homework: ${newHw.subject}`,
      message: `${newHw.title} assigned for Class ${newHw.class}. Due: ${newHw.dueDate}`,
      targetClass: newHw.class,
      linkSection: 'homework',
      createdAt: new Date().toISOString(),
      readByStudentIds: [],
    });

    db.logAudit('CREATE_HOMEWORK', creator, 'Homework', `Created homework for Class ${item.class} (${item.subject}): ${item.title}`);
    saveDatabase(data);
    return newHw;
  },

  toggleHomeworkCompletion(
    homeworkId: string,
    studentId: string,
    studentName: string,
    notes?: string,
    submissionUrl?: string,
    submissionName?: string
  ): { completed: boolean; item?: HomeworkItem } {
    const data = getDatabase();
    data.homework = data.homework || [];
    const hw = data.homework.find((h) => h.id === homeworkId);
    if (!hw) return { completed: false };

    hw.completions = hw.completions || [];
    const existingIndex = hw.completions.findIndex((c) => c.studentId === studentId);

    let completed = false;
    if (existingIndex >= 0 && !submissionUrl && !notes) {
      // Toggle off / Un-complete only when no upload was provided
      hw.completions.splice(existingIndex, 1);
      completed = false;
    } else {
      // Mark complete or update submission
      const record = {
        studentId,
        studentName,
        completedAt: new Date().toISOString(),
        notes: notes || 'Marked as completed by student.',
        submissionUrl,
        submissionName,
      };
      if (existingIndex >= 0) {
        hw.completions[existingIndex] = record;
      } else {
        hw.completions.push(record);
      }
      completed = true;
    }

    saveDatabase(data);
    return { completed, item: hw };
  },

  deleteHomework(id: string, adminName: string): boolean {
    const data = getDatabase();
    data.homework = data.homework || [];
    const initialLen = data.homework.length;
    const item = data.homework.find((h) => h.id === id);
    data.homework = data.homework.filter((h) => h.id !== id);
    if (data.homework.length !== initialLen) {
      if (item) {
        db.logAudit('DELETE_HOMEWORK', adminName, 'Homework', `Deleted homework: ${item.title} (Class ${item.class})`);
      }
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // 3. SCHOOL CALENDAR
  getCalendarEvents(category?: string, classNum?: string): CalendarEvent[] {
    const data = getDatabase();
    let list = data.calendarEvents || [];
    if (category && category !== 'all') {
      list = list.filter((e) => e.category === category);
    }
    if (classNum) {
      list = list.filter((e) => !e.targetClass || e.targetClass === 'All' || e.targetClass === classNum);
    }
    return list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  },

  createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>, adminName: string): CalendarEvent {
    const data = getDatabase();
    data.calendarEvents = data.calendarEvents || [];
    const newEvent: CalendarEvent = {
      ...event,
      id: `cal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.calendarEvents.push(newEvent);

    // Auto notification
    data.notifications = data.notifications || [];
    data.notifications.unshift({
      id: `notif-${Date.now()}-cal`,
      type: event.category === 'exam' ? 'exam' : event.isHoliday ? 'calendar' : 'notice',
      title: `📅 Calendar Event: ${newEvent.title}`,
      message: `${newEvent.description || newEvent.title} (Dates: ${newEvent.startDate})`,
      targetClass: newEvent.targetClass || 'All',
      linkSection: 'calendar',
      createdAt: new Date().toISOString(),
      readByStudentIds: [],
    });

    db.logAudit('CREATE_EVENT', adminName, 'Calendar', `Added calendar event: ${newEvent.title} (${newEvent.startDate})`);
    saveDatabase(data);
    return newEvent;
  },

  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>, adminName: string): CalendarEvent | null {
    const data = getDatabase();
    data.calendarEvents = data.calendarEvents || [];
    const event = data.calendarEvents.find((e) => e.id === id);
    if (!event) return null;

    Object.assign(event, updates);
    db.logAudit('UPDATE_CALENDAR', adminName, 'Calendar', `Updated calendar event: ${event.title}`);
    saveDatabase(data);
    return event;
  },

  deleteCalendarEvent(id: string, adminName: string): boolean {
    const data = getDatabase();
    data.calendarEvents = data.calendarEvents || [];
    const initialLen = data.calendarEvents.length;
    const item = data.calendarEvents.find((e) => e.id === id);
    data.calendarEvents = data.calendarEvents.filter((e) => e.id !== id);
    if (data.calendarEvents.length !== initialLen) {
      if (item) {
        db.logAudit('DELETE_EVENT', adminName, 'Calendar', `Deleted calendar event: ${item.title}`);
      }
      saveDatabase(data);
      return true;
    }
    return false;
  },

  // 9. REPORT & SAFETY (Chat & Content Moderation)
  reportMessage(report: Omit<ReportedSafetyItem, 'id' | 'createdAt' | 'status'>): ReportedSafetyItem {
    const data = getDatabase();
    data.reportedSafetyItems = data.reportedSafetyItems || [];
    const item: ReportedSafetyItem = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    data.reportedSafetyItems.unshift(item);
    db.logAudit('REPORT_CONTENT', report.reportedBy, 'Safety', `Reported inappropriate message by ${report.senderName}: "${report.reason}"`);
    saveDatabase(data);
    return item;
  },

  getSafetyReports(): ReportedSafetyItem[] {
    const data = getDatabase();
    return data.reportedSafetyItems || [];
  },

  updateSafetyReport(id: string, status: ReportedSafetyItem['status'], actionNote?: string): boolean {
    const data = getDatabase();
    data.reportedSafetyItems = data.reportedSafetyItems || [];
    const rep = data.reportedSafetyItems.find((r) => r.id === id);
    if (!rep) return false;
    rep.status = status;
    rep.resolvedAt = new Date().toISOString();
    if (actionNote) rep.actionNote = actionNote;
    db.logAudit('MODERATE_REPORT', 'Admin Moderator', 'Safety', `Moderation action taken on report ${id}: ${status}`);
    saveDatabase(data);
    return true;
  },

  // 10. ADMIN AUDIT & BACKUP
  logAudit(action: string, performedBy: string, targetType: string, details: string): AdminAuditLog {
    const data = getDatabase();
    data.auditLogs = data.auditLogs || [];
    const entry: AdminAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy,
      targetType,
      details,
      timestamp: new Date().toISOString(),
    };
    data.auditLogs.unshift(entry);
    // Keep max 500 audit logs to prevent unbounded file growth
    if (data.auditLogs.length > 500) {
      data.auditLogs = data.auditLogs.slice(0, 500);
    }
    saveDatabase(data);
    return entry;
  },

  getAuditLogs(): AdminAuditLog[] {
    const data = getDatabase();
    return data.auditLogs || [];
  },

  getBackupData(): DatabaseSchema {
    return getDatabase();
  },

  // 4. GLOBAL SEARCH
  globalSearch(query: string, classNum?: string) {
    const data = getDatabase();
    const q = query.trim().toLowerCase();
    if (!q) return { results: [], total: 0 };

    type SearchResultItem = {
      id: string;
      category:
        | 'Notices'
        | 'Books'
        | 'MCQs'
        | 'Timetable'
        | 'Exams'
        | 'Results'
        | 'Homework'
        | 'Calendar'
        | 'About School'
        | 'Faculty'
        | 'Written Q&A'
        | 'Chat & Groups'
        | 'Help Articles';
      title: string;
      subtitle: string;
      section: string;
      badge?: string;
    };

    const results: SearchResultItem[] = [];

    // 1. Notices
    (data.notices || []).forEach((n) => {
      if (
        n.title.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: n.id,
          category: 'Notices',
          title: n.title,
          subtitle: `${n.date} • ${n.description?.substring(0, 80)}...`,
          section: 'notice',
          badge: n.priority || 'Notice',
        });
      }
    });

    // 2. Books
    (data.books || []).forEach((b) => {
      if (
        b.title.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: b.id,
          category: 'Books',
          title: b.title,
          subtitle: `Class ${b.class} • ${b.subject} • ${b.authorOrPublisher}`,
          section: 'study',
          badge: `Class ${b.class}`,
        });
      }
    });

    // 3. MCQs
    (data.mcqQuestions || []).forEach((m) => {
      if (
        m.question.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.chapter.toLowerCase().includes(q)
      ) {
        results.push({
          id: m.id,
          category: 'MCQs',
          title: m.question,
          subtitle: `Class ${m.class} • ${m.subject} • ${m.chapter}`,
          section: 'mcq',
          badge: m.subject,
        });
      }
    });

    // 4. Timetable
    (data.timetables || []).forEach((t) => {
      if (
        t.subject.toLowerCase().includes(q) ||
        (t.teacherName && t.teacherName.toLowerCase().includes(q)) ||
        t.day.toLowerCase().includes(q)
      ) {
        results.push({
          id: t.id,
          category: 'Timetable',
          title: `${t.subject} (${t.day})`,
          subtitle: `Class ${t.class} • ${t.startTime} - ${t.endTime} • ${t.teacherName || 'Faculty'}`,
          section: 'timetable',
          badge: t.day,
        });
      }
    });

    // 5. Exams
    (data.examSchedules || []).forEach((e) => {
      if (
        e.examName.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      ) {
        results.push({
          id: e.id,
          category: 'Exams',
          title: `${e.subject} - ${e.examName}`,
          subtitle: `Class ${e.class} • Date: ${e.date} • ${e.time}`,
          section: 'exam',
          badge: e.subject,
        });
      }
    });

    // 6. Results
    (data.results || []).forEach((r) => {
      if (
        r.studentName.toLowerCase().includes(q) ||
        r.rollCode.toLowerCase().includes(q) ||
        (r.rollNo && r.rollNo.toLowerCase().includes(q)) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(q))
      ) {
        results.push({
          id: r.id,
          category: 'Results',
          title: `${r.studentName} (Roll: ${r.rollCode} - ${r.rollNo || r.rollNumber})`,
          subtitle: `Class ${r.class} • ${r.examName} • ${r.percentage}% (${r.division})`,
          section: 'results',
          badge: `${r.percentage}%`,
        });
      }
    });

    // 7. Homework
    (data.homework || []).forEach((h) => {
      if (
        h.title.toLowerCase().includes(q) ||
        h.subject.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: h.id,
          category: 'Homework',
          title: h.title,
          subtitle: `Class ${h.class} • ${h.subject} • Due: ${h.dueDate}`,
          section: 'homework',
          badge: `Class ${h.class}`,
        });
      }
    });

    // 8. Calendar
    (data.calendarEvents || []).forEach((c) => {
      if (
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      ) {
        results.push({
          id: c.id,
          category: 'Calendar',
          title: c.title,
          subtitle: `Date: ${c.startDate} • ${c.description || c.category}`,
          section: 'calendar',
          badge: c.category.toUpperCase(),
        });
      }
    });

    // 9. School Facilities & About Info
    if (data.aboutSchool) {
      (data.aboutSchool.facilities || []).forEach((fac) => {
        if (
          fac.title.toLowerCase().includes(q) ||
          fac.description.toLowerCase().includes(q)
        ) {
          results.push({
            id: fac.id,
            category: 'About School',
            title: fac.title,
            subtitle: `${fac.description} • ${fac.capacityOrDetails}`,
            section: 'about',
            badge: 'FACILITY',
          });
        }
      });
    }

    // 10. Faculty / Teachers
    (data.faculty || []).forEach((f) => {
      if (
        f.name.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        f.subject.toLowerCase().includes(q)
      ) {
        results.push({
          id: f.id,
          category: 'Faculty',
          title: f.name,
          subtitle: `${f.designation} • ${f.subject} • ${f.classesTaught || ''}`,
          section: 'faculty',
          badge: f.subject,
        });
      }
    });

    // 11. Written Q&A
    (data.writtenQuestions || []).forEach((wq) => {
      if (
        wq.question.toLowerCase().includes(q) ||
        wq.subject.toLowerCase().includes(q) ||
        wq.chapter.toLowerCase().includes(q)
      ) {
        results.push({
          id: wq.id,
          category: 'Written Q&A',
          title: wq.question,
          subtitle: `Class ${wq.class} • ${wq.subject} • ${wq.chapter} (${wq.marks} Marks)`,
          section: 'written',
          badge: `${wq.marks} Marks`,
        });
      }
    });

    // 12. Chat & Study Groups
    (data.chatConversations || []).forEach((cc) => {
      if (cc.title.toLowerCase().includes(q) || (cc.subtitle && cc.subtitle.toLowerCase().includes(q))) {
        results.push({
          id: cc.id,
          category: 'Chat & Groups',
          title: cc.title,
          subtitle: cc.subtitle || 'School Study & Academic Group',
          section: 'chat',
          badge: cc.type === 'group' ? 'GROUP' : 'DIRECT',
        });
      }
    });

    // 13. Help & Support Articles
    const helpArticles = [
      { id: 'h-1', title: '1. 🔐 SECURE SCHOOL LOGIN & REGISTRATION', subtitle: 'How to sign in with Student ID / Roll Number and restore permanent session' },
      { id: 'h-2', title: '2. 🕒 SCHOOL TIMETABLE & ROUTINE', subtitle: 'Viewing daily classes, periods, and Saturday 1:00-2:00 vocational schedule' },
      { id: 'h-3', title: '3. 📚 JAC & NCERT STUDY BOOKS', subtitle: 'Reading and downloading Class 9-12 textbooks' },
      { id: 'h-4', title: '4. 📝 JAC MCQ PRACTICE TESTS', subtitle: 'Taking chapter-wise objective tests and tracking scores' },
      { id: 'h-5', title: '5. ✍️ WRITTEN Q&A PRACTICE', subtitle: 'Submitting descriptive answers and viewing official model answers' },
      { id: 'h-6', title: '6. 🤖 24/7 AI STUDY ASSISTANT', subtitle: 'Asking doubts via voice, photo upload, and Hindi/English tutor' },
      { id: 'h-7', title: '7. 📹 LIVE VIDEO CLASSES', subtitle: 'Joining online classrooms, mic, camera, and attendance' },
      { id: 'h-8', title: '8. 📋 ONLINE DAILY ATTENDANCE', subtitle: 'Marking daily attendance and checking monthly percentages' },
      { id: 'h-9', title: '9. 📅 EXAM SCHEDULE & DATESHEET', subtitle: 'JAC Board and terminal examination dates and timings' },
      { id: 'h-10', title: '10. 🏆 PUBLISHED RESULTS & MARKSHEETS', subtitle: 'Searching marksheet with Roll Code and Roll Number' },
      { id: 'h-11', title: '11. 🔔 OFFICIAL NOTICE BOARD', subtitle: 'Viewing circulars, orders, and exam form dates' },
      { id: 'h-12', title: '12. 📑 HOMEWORK & ASSIGNMENTS', subtitle: 'Downloading teacher assignments and uploading student submissions' },
      { id: 'h-13', title: '13. 🗓️ ANNUAL ACADEMIC CALENDAR', subtitle: 'Holiday lists, sports days, and exam periods' },
      { id: 'h-14', title: '14. 💬 CHAT & STUDY GROUPS', subtitle: 'Class groups, teacher chat, voice notes, and media sharing' },
    ];
    helpArticles.forEach((h) => {
      if (h.title.toLowerCase().includes(q) || h.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: h.id,
          category: 'Help Articles',
          title: h.title,
          subtitle: h.subtitle,
          section: 'help',
          badge: 'GUIDE',
        });
      }
    });

    return { results, total: results.length };
  },

  // About School
  getAboutSchool(): AboutSchoolData {
    const data = getDatabase();
    if (!data.aboutSchool) {
      data.aboutSchool = initialAboutSchoolData;
      saveDatabase(data);
    }
    return data.aboutSchool;
  },

  updateAboutSchool(updates: Partial<AboutSchoolData>, updatedBy?: string): AboutSchoolData {
    const data = getDatabase();
    const current = data.aboutSchool || initialAboutSchoolData;
    const updated: AboutSchoolData = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || current.updatedBy,
    };
    data.aboutSchool = updated;
    saveDatabase(data);
    return updated;
  },

  // 10. WRITTEN Q&A (DESCRIPTIVE QUESTIONS & MODEL ANSWERS)
  getWrittenQuestions(classNum?: string, subject?: string): WrittenQuestion[] {
    const data = getDatabase();
    data.writtenQuestions = data.writtenQuestions || initialWrittenQuestions;
    let list = [...data.writtenQuestions];
    if (classNum && classNum !== 'All') {
      list = list.filter((q) => q.class === classNum);
    }
    if (subject && subject !== 'All') {
      list = list.filter((q) => q.subject.toLowerCase().includes(subject.toLowerCase()));
    }
    return list;
  },

  addWrittenQuestion(question: Omit<WrittenQuestion, 'id' | 'createdAt'>): WrittenQuestion {
    const data = getDatabase();
    data.writtenQuestions = data.writtenQuestions || initialWrittenQuestions;
    const newQ: WrittenQuestion = {
      ...question,
      id: `wq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.writtenQuestions.unshift(newQ);
    saveDatabase(data);
    return newQ;
  },

  deleteWrittenQuestion(id: string): boolean {
    const data = getDatabase();
    data.writtenQuestions = data.writtenQuestions || initialWrittenQuestions;
    const initialLen = data.writtenQuestions.length;
    data.writtenQuestions = data.writtenQuestions.filter((q) => q.id !== id);
    if (data.writtenQuestions.length !== initialLen) {
      saveDatabase(data);
      return true;
    }
    return false;
  },

  submitWrittenAnswer(submission: Omit<WrittenSubmission, 'id' | 'submittedAt'>): WrittenSubmission {
    const data = getDatabase();
    data.writtenSubmissions = data.writtenSubmissions || [];
    const newSub: WrittenSubmission = {
      ...submission,
      id: `wsub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toISOString(),
    };
    // Replace if already submitted for this question by same student, else prepend
    const existingIdx = data.writtenSubmissions.findIndex(
      (s) => s.questionId === submission.questionId && s.studentId === submission.studentId
    );
    if (existingIdx >= 0) {
      data.writtenSubmissions[existingIdx] = newSub;
    } else {
      data.writtenSubmissions.unshift(newSub);
    }
    saveDatabase(data);
    return newSub;
  },

  getWrittenSubmissions(questionId?: string, studentId?: string, classNum?: string): WrittenSubmission[] {
    const data = getDatabase();
    data.writtenSubmissions = data.writtenSubmissions || [];
    let list = [...data.writtenSubmissions];
    if (questionId) list = list.filter((s) => s.questionId === questionId);
    if (studentId) list = list.filter((s) => s.studentId === studentId);
    if (classNum) list = list.filter((s) => s.class === classNum);
    return list;
  },

  gradeWrittenSubmission(submissionId: string, marks: number, remarks?: string, teacherName?: string): WrittenSubmission | null {
    const data = getDatabase();
    data.writtenSubmissions = data.writtenSubmissions || [];
    const sub = data.writtenSubmissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.marksObtained = marks;
    sub.teacherRemarks = remarks;
    sub.gradedAt = new Date().toISOString();
    sub.gradedBy = teacherName || 'Subject Teacher';
    saveDatabase(data);
    return sub;
  },

  // 11. SCHOOL CHAT & STUDY GROUPS
  getChatConversations(user?: UserProfile | null): ChatConversation[] {
    const data = getDatabase();
    data.chatConversations = data.chatConversations || initialChatConversations;
    // Authorized view: students see their class group, teacher/principal chats, and any dm they are part of
    const userClass = user?.selectedClass || '10';
    const userId = user?.id || 'guest_student';
    const userRole = user?.role || 'student';

    if (userRole === 'admin' || userRole === 'principal') {
      return data.chatConversations;
    }

    return data.chatConversations.filter((c) => {
      if (c.type === 'group') {
        // Group chats for Class 9, 10, 11, 12: accessible to students/teachers
        return true;
      }
      // Direct chats: only exposed to actual participants (or teachers/principal)
      if (userRole === 'teacher') return true;
      return c.participants.includes(userId) || c.participants.includes('student');
    });
  },

  getChatMessages(conversationId: string, requestingUserId?: string, requestingRole?: UserRole): ChatMessage[] {
    const data = getDatabase();
    data.chatMessages = data.chatMessages || initialChatMessages;
    data.chatConversations = data.chatConversations || initialChatConversations;

    // Check authorization for private chats
    if (conversationId.startsWith('dm-')) {
      const conv = data.chatConversations.find((c) => c.id === conversationId);
      if (conv && requestingUserId && requestingRole !== 'admin' && requestingRole !== 'principal' && requestingRole !== 'teacher') {
        const isParticipant = conv.participants.includes(requestingUserId) || conv.participants.includes('student');
        if (!isParticipant) {
          return [];
        }
      }
    }

    return data.chatMessages.filter((m) => m.conversationId === conversationId);
  },

  sendChatMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
    const data = getDatabase();
    data.chatMessages = data.chatMessages || initialChatMessages;
    data.chatConversations = data.chatConversations || initialChatConversations;

    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    data.chatMessages.push(newMsg);

    // Update conversation lastMessage & lastMessageTime
    const conv = data.chatConversations.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessage = `${msg.senderName.split(' ')[0]}: ${msg.text.substring(0, 45)}`;
      conv.lastMessageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Keep max 2000 messages to avoid unbound file growth
    if (data.chatMessages.length > 2000) {
      data.chatMessages = data.chatMessages.slice(-2000);
    }

    saveDatabase(data);
    return newMsg;
  },

  deleteChatMessage(messageId: string, requestingUserId?: string, requestingRole?: UserRole): boolean {
    const data = getDatabase();
    data.chatMessages = data.chatMessages || initialChatMessages;
    const msg = data.chatMessages.find((m) => m.id === messageId);
    if (!msg) return false;

    // Only sender, teacher, admin or principal can delete
    if (
      requestingRole === 'admin' ||
      requestingRole === 'principal' ||
      requestingRole === 'teacher' ||
      msg.senderId === requestingUserId
    ) {
      data.chatMessages = data.chatMessages.filter((m) => m.id !== messageId);
      saveDatabase(data);
      return true;
    }
    return false;
  },

  addChatReaction(messageId: string, emoji: string, userId: string, userName: string): ChatMessage | null {
    const data = getDatabase();
    data.chatMessages = data.chatMessages || initialChatMessages;
    const msg = data.chatMessages.find((m) => m.id === messageId);
    if (!msg) return null;

    msg.reactions = msg.reactions || {};
    msg.reactions[emoji] = msg.reactions[emoji] || [];

    const existingIdx = msg.reactions[emoji].indexOf(userName);
    if (existingIdx >= 0) {
      // Toggle off
      msg.reactions[emoji].splice(existingIdx, 1);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      // Add reaction
      msg.reactions[emoji].push(userName);
    }
    saveDatabase(data);
    return msg;
  },

  toggleMuteConversation(conversationId: string, userId: string): boolean {
    const data = getDatabase();
    data.chatConversations = data.chatConversations || initialChatConversations;
    const conv = data.chatConversations.find((c) => c.id === conversationId);
    if (!conv) return false;
    conv.isMuted = !conv.isMuted;
    saveDatabase(data);
    return conv.isMuted;
  },
};

