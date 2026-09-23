import fs from 'fs';
import path from 'path';
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
} from './types';
import { initialAboutSchoolData } from './aboutData';

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
  { id: 't-10-sat-1', class: '10', day: 'Saturday', subject: 'Maths', startTime: '09:00 AM', endTime: '09:45 AM', teacherName: 'Mr. R. K. Sharma', room: 'Room 101' },
  { id: 't-10-sat-2', class: '10', day: 'Saturday', subject: 'S.S.T', startTime: '09:45 AM', endTime: '10:30 AM', teacherName: 'Mr. B. Munda', room: 'Room 101' },
  { id: 't-10-sat-3', class: '10', day: 'Saturday', subject: 'English', startTime: '10:30 AM', endTime: '11:15 AM', teacherName: 'Mrs. S. Tirkey', room: 'Room 101' },
  { id: 't-10-sat-4', class: '10', day: 'Saturday', subject: 'Sanskrit', startTime: '11:30 AM', endTime: '12:15 PM', teacherName: 'Acharya R. Mishra', room: 'Room 101' },
  { id: 't-10-sat-5', class: '10', day: 'Saturday', subject: 'Information Technology', startTime: '12:15 PM', endTime: '01:00 PM', teacherName: 'Mr. V. Kumar', room: 'Computer Lab' },
  { id: 't-10-sat-6', class: '10', day: 'Saturday', subject: 'Sanskrit / IT / Healthcare Special', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Vocational Faculty & IT Staff', room: 'Skill Center' },
  { id: 't-10-sat-7', class: '10', day: 'Saturday', subject: 'Healthcare', startTime: '01:00 PM', endTime: '02:00 PM', teacherName: 'Ms. P. Soren (Healthcare Trainer)', room: 'Health Lab' },

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
  { id: 'std-10-1', name: 'Amit Kumar Singh', email: 'amit.singh@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1001', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-2', name: 'Pooja Kumari Oraon', email: 'pooja.oraon@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1002', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-3', name: 'Rahul Soren', email: 'rahul.soren@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1003', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-4', name: 'Anjali Kumari', email: 'anjali.kumari@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1004', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-5', name: 'Rohit Kumar', email: 'rohit.kumar@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1005', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-6', name: 'Neha Sharma', email: 'neha.sharma@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1006', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-7', name: 'Deepak Mahto', email: 'deepak.mahto@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1007', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-10-8', name: 'Priya Kumari', email: 'priya.kumari@student.janta.edu', role: 'student', selectedClass: '10', rollNo: '1008', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-1', name: 'Vicky Kumar', email: 'vicky.kumar@student.janta.edu', role: 'student', selectedClass: '9', rollNo: '901', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-2', name: 'Sunita Munda', email: 'sunita.munda@student.janta.edu', role: 'student', selectedClass: '9', rollNo: '902', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-9-3', name: 'Ajay Oraon', email: 'ajay.oraon@student.janta.edu', role: 'student', selectedClass: '9', rollNo: '903', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-11-1', name: 'Rohan Karmali', email: 'rohan.karmali@student.janta.edu', role: 'student', selectedClass: '11', rollNo: '1101', stream: 'Science', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-11-2', name: 'Meena Kumari', email: 'meena.kumari@student.janta.edu', role: 'student', selectedClass: '11', rollNo: '1102', stream: 'Arts', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-12-1', name: 'Manish Verma', email: 'manish.verma@student.janta.edu', role: 'student', selectedClass: '12', rollNo: '1201', stream: 'Science', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
  { id: 'std-12-2', name: 'Sunita Kumari', email: 'sunita.k12@student.janta.edu', role: 'student', selectedClass: '12', rollNo: '1202', stream: 'Commerce', createdAt: '2026-04-01T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' },
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

export function getDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    if (!inMemoryDb.attendance) inMemoryDb.attendance = [];
    if (!inMemoryDb.users || inMemoryDb.users.length === 0) inMemoryDb.users = [...initialEnrolledStudents];
    if (!inMemoryDb.notifications) inMemoryDb.notifications = [...initialNotifications];
    if (!inMemoryDb.homework) inMemoryDb.homework = [...initialHomework];
    if (!inMemoryDb.calendarEvents) inMemoryDb.calendarEvents = [...initialCalendarEvents];
    if (!inMemoryDb.reportedSafetyItems) inMemoryDb.reportedSafetyItems = [];
    if (!inMemoryDb.auditLogs) inMemoryDb.auditLogs = [...initialAuditLogs];
    if (!inMemoryDb.aboutSchool) inMemoryDb.aboutSchool = initialAboutSchoolData;
    return inMemoryDb;
  }

  ensureDataDirectory();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(content);
      if (!inMemoryDb!.attendance) inMemoryDb!.attendance = [];
      if (!inMemoryDb!.users || inMemoryDb!.users.length === 0) inMemoryDb!.users = [...initialEnrolledStudents];
      if (!inMemoryDb!.notifications) inMemoryDb!.notifications = [...initialNotifications];
      if (!inMemoryDb!.homework) inMemoryDb!.homework = [...initialHomework];
      if (!inMemoryDb!.calendarEvents) inMemoryDb!.calendarEvents = [...initialCalendarEvents];
      if (!inMemoryDb!.reportedSafetyItems) inMemoryDb!.reportedSafetyItems = [];
      if (!inMemoryDb!.auditLogs) inMemoryDb!.auditLogs = [...initialAuditLogs];
      if (!inMemoryDb!.aboutSchool) inMemoryDb!.aboutSchool = initialAboutSchoolData;
      return inMemoryDb!;
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
  }

  inMemoryDb = {
    users: [...initialEnrolledStudents],
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
  // Users & Profiles
  findUserByEmail(email: string): UserProfile | undefined {
    const data = getDatabase();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserById(id: string): UserProfile | undefined {
    const data = getDatabase();
    return data.users.find((u) => u.id === id);
  },
  upsertUser(user: Partial<UserProfile> & { email: string; name: string }): UserProfile {
    const data = getDatabase();
    const existingIndex = data.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      const updated: UserProfile = {
        ...data.users[existingIndex],
        ...user,
        updatedAt: now,
      };
      data.users[existingIndex] = updated;
      saveDatabase(data);
      return updated;
    } else {
      const newUser: UserProfile = {
        id: user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        email: user.email,
        name: user.name,
        picture: user.picture || '',
        role: user.role || 'student',
        selectedClass: user.selectedClass || '10',
        rollNo: user.rollNo || '',
        stream: user.stream || 'General',
        phone: user.phone || '',
        createdAt: now,
        updatedAt: now,
      };
      data.users.push(newUser);
      saveDatabase(data);
      return newUser;
    }
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
    notes?: string
  ): { completed: boolean; item?: HomeworkItem } {
    const data = getDatabase();
    data.homework = data.homework || [];
    const hw = data.homework.find((h) => h.id === homeworkId);
    if (!hw) return { completed: false };

    hw.completions = hw.completions || [];
    const existingIndex = hw.completions.findIndex((c) => c.studentId === studentId);

    let completed = false;
    if (existingIndex >= 0) {
      // Un-complete
      hw.completions.splice(existingIndex, 1);
      completed = false;
    } else {
      // Mark complete
      hw.completions.push({
        studentId,
        studentName,
        completedAt: new Date().toISOString(),
        notes: notes || 'Marked as completed by student.',
      });
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
      category: 'Notices' | 'Books' | 'MCQs' | 'Timetable' | 'Exams' | 'Results' | 'Homework' | 'Calendar' | 'About School';
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
};

