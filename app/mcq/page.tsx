import { db } from '@/lib/db';
import { SchoolPortalClient } from '@/components/SchoolPortalClient';

export const dynamic = 'auto';

export const metadata = {
  title: 'JAC Class 10 MCQ Practice | Janta +2 High School – Khalari',
  description: 'Official JAC Class 10 Board Exam MCQ Practice and self-assessment quiz system with all 9 subjects, NCERT/JCERT solutions, score tracking, and offline progress.',
};

export default async function McqPage() {
  const initialNotices = db.getNotices();
  const initialLiveSessions = db.getLiveSessions();
  const initialFaculty = db.getFaculty();
  const initialAboutSchool = db.getAboutSchool();
  const initialContact = db.getSchoolContact();

  return (
    <SchoolPortalClient
      initialSection="mcq"
      initialTab="mcq"
      initialNotices={initialNotices}
      initialLiveSessions={initialLiveSessions}
      initialFaculty={initialFaculty}
      initialAboutSchool={initialAboutSchool}
      initialContact={initialContact}
    />
  );
}
