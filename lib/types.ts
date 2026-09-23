export type SchoolClass = '9' | '10' | '11' | '12';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  selectedClass: SchoolClass;
  rollNo?: string;
  stream?: 'Science' | 'Commerce' | 'Arts' | 'General';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveClassSession {
  id: string;
  class: SchoolClass;
  subject: string;
  teacherName: string;
  title: string;
  meetingId: string;
  meetingUrl: string;
  status: 'live' | 'ended';
  startedAt: string;
  endedAt?: string;
  createdBy: string;
  stream?: string;
}

export interface MCQQuestion {
  id: string;
  class: SchoolClass;
  stream?: 'Science' | 'Commerce' | 'Arts' | 'General';
  subject: string;
  chapter: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  isAiGenerated?: boolean;
}

export interface Book {
  id: string;
  class: SchoolClass;
  subject: string;
  stream?: 'Science' | 'Commerce' | 'Arts' | 'General';
  title: string;
  authorOrPublisher: string;
  fileUrl: string;
  coverImage?: string;
  description: string;
  chapterCount?: number;
  medium?: string;
  fileSize?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface TimetableEntry {
  id: string;
  class: SchoolClass;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber?: number;
  time?: string;
  subject: string;
  startTime?: string; // e.g. "09:00 AM" or "1:00 PM"
  endTime?: string;   // e.g. "09:45 AM" or "2:00 PM"
  teacher?: string;
  teacherName?: string;
  room?: string;
}

export type Timetable = TimetableEntry;

export interface Notice {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string; // e.g. "2026-09-20"
  important: boolean;
  priority?: 'normal' | 'important' | 'urgent';
  published: boolean;
  targetClass?: SchoolClass | 'All';
  author: string;
  createdAt: string;
}

export interface ExamSchedule {
  id: string;
  class: SchoolClass;
  examName: string; // e.g. "JAC Board Exam 2026", "Pre-Board Examination"
  date: string;
  day?: string;
  subject: string;
  time: string; // e.g. "09:45 AM - 01:00 PM"
  shift?: string;
  room?: string;
  instructions?: string;
}

export interface PublishedResult {
  id: string;
  class: SchoolClass;
  examName: string;
  year?: string;
  studentName: string;
  rollCode: string;
  rollNo?: string;
  rollNumber?: string;
  totalMarks: number;
  obtainedMarks?: number;
  maxMarks?: number;
  percentage: number;
  division: string;
  status?: string;
  subjectScores?: {
    subject: string;
    marks: number;
    maxMarks: number;
  }[];
  subjects?: {
    subject: string;
    marks: number;
    fullMarks: number;
  }[];
  publishedAt?: string;
  publishedDate?: string;
}

export type Result = PublishedResult;

export interface FacultyMember {
  id: string;
  name: string;
  designation: string; // e.g. "Principal", "PGT Physics", "TGT Mathematics"
  subject: string;
  classesTaught: string | string[]; // e.g. "Class 11, 12" or ['9', '10']
  qualification: string;
  experience?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export type Faculty = FacultyMember;

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  spokenOrEnteredName?: string;
  class: SchoolClass;
  rollNo?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM e.g. "09:15 AM"
  timestamp: string; // ISO string
  status: 'Present' | 'Absent';
  method: 'voice' | 'manual' | 'admin_override';
  verifiedBy?: string;
  correctedBy?: string;
  remarks?: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  rollNo?: string;
  class: SchoolClass;
  todayStatus: 'Present' | 'Absent' | 'Not Marked';
  todayRecord?: AttendanceRecord;
  totalSchoolDays: number;
  presentDays: number;
  attendancePercentage: number;
  history: AttendanceRecord[];
}

export interface SchoolContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  officeContact?: string;
  supportContact?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type NotificationType =
  | 'notice'
  | 'exam'
  | 'live'
  | 'result'
  | 'study'
  | 'homework'
  | 'attendance'
  | 'calendar'
  | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetClass?: SchoolClass | 'All';
  linkSection?: string;
  urgent?: boolean;
  createdAt: string;
  readByStudentIds?: string[];
}

export interface HomeworkCompletion {
  studentId: string;
  studentName: string;
  completedAt: string;
  notes?: string;
}

export interface HomeworkItem {
  id: string;
  class: SchoolClass;
  subject: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  attachmentUrl?: string;
  attachmentName?: string;
  assignedBy: string;
  createdAt: string;
  completions: HomeworkCompletion[];
}

export type CalendarEventCategory = 'holiday' | 'exam' | 'event' | 'academic' | 'activity';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  category: CalendarEventCategory;
  targetClass?: SchoolClass | 'All';
  isHoliday: boolean;
  createdBy: string;
  createdAt: string;
}

export type BookmarkType = 'mcq' | 'written' | 'book' | 'study' | 'notice' | 'homework';

export interface BookmarkItem {
  id: string;
  itemId: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  section: string;
  savedAt: string;
  metadata?: Record<string, any>;
}

export interface TestAttemptRecord {
  id: string;
  subject: string;
  chapter?: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  date: string;
}

export interface StudentProgressData {
  studentId: string;
  totalMcqAttempts: number;
  totalQuestionsAnswered: number;
  averageMcqScore: number;
  writtenQuestionsCompleted: number;
  completedHomeworkCount: number;
  attendancePercentage: number;
  subjectPerformance: {
    subject: string;
    accuracy: number;
    totalAttempted: number;
    status: 'strong' | 'average' | 'weak';
  }[];
  recentAttempts: TestAttemptRecord[];
  weeklyActivity: {
    day: string;
    hours: number;
    tests: number;
  }[];
}

export interface ReportedSafetyItem {
  id: string;
  messageId?: string;
  messageContent: string;
  senderName: string;
  senderId?: string;
  reportedBy: string;
  reporterEmail?: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  actionNote?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetType: string;
  details: string;
  timestamp: string;
}

export interface SchoolHighlightItem {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName?: string;
  isFeatured: boolean; // Admin can toggle this to display prominently on top
  displayOrder?: number;
}

export interface SchoolFacilityItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  verifiedStatus: string;
  capacityOrDetails?: string;
  isPublished: boolean;
}

export interface SchoolPhotoItem {
  id: string;
  title: string;
  category: 'Campus' | 'Labs & Library' | 'Sports' | 'Cultural' | 'Events' | 'Achievements';
  imageUrl: string;
  caption?: string;
  date?: string;
  isFeatured?: boolean;
  isPublished: boolean;
}

export interface SchoolTimingItem {
  activity: string;
  startTime: string;
  endTime: string;
  days: string;
  notes?: string;
}

export interface SchoolRuleItem {
  id: string;
  title: string;
  description: string;
  category: 'Attendance' | 'Uniform' | 'Classroom' | 'Campus' | 'Examinations';
}

export interface SchoolFaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Admission' | 'Academic' | 'Exams' | 'Scholarships' | 'General';
}

export interface AboutSchoolData {
  schoolName: string;
  tagline: string;
  motto: string;
  establishedYear: string;
  affiliation: string;
  schoolCode: string;
  udiseCode: string;
  board: string;
  introductionHindi: string;
  introductionEnglish: string;
  principalMessage: {
    name: string;
    designation: string;
    qualification: string;
    photoUrl?: string;
    messageHindi: string;
    messageEnglish: string;
  };
  location: {
    address: string;
    landmark: string;
    pinCode: string;
    district: string;
    state: string;
    mapCoordinates: string;
    googleMapsUrl: string;
    howToReach: string;
  };
  highlights: SchoolHighlightItem[];
  facilities: SchoolFacilityItem[];
  timings: SchoolTimingItem[];
  rules: SchoolRuleItem[];
  photos: SchoolPhotoItem[];
  faqs: SchoolFaqItem[];
  academicInfo: {
    medium: string;
    streamsOffered: string[];
    jacAffiliationNumber: string;
    examinationPattern: string;
    gradingSystem: string;
  };
  studentActivities: {
    title: string;
    description: string;
    category: string;
  }[];
  healthAndSafety: {
    title: string;
    description: string;
    status: string;
  }[];
  contactInfo: {
    officialAddress: string;
    district: string;
    state: string;
    pincode: string;
    principalOffice: string;
    schoolOfficeHours: string;
    email: string;
  };
  updatedAt: string;
  updatedBy: string;
}


