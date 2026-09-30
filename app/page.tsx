import { db } from '@/lib/db';
import { SchoolPortalClient } from '@/components/SchoolPortalClient';

// Server rendering strategy: Ensure dynamic server-side rendering compatibility for production hosting
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Pre-fetch initial data server-side from local database
  // This eliminates client-side network waterfalls, accelerates first contentful paint,
  // and provides pre-rendered content for crawlers and mobile users.
  const initialNotices = db.getNotices();
  const initialLiveSessions = db.getLiveSessions();
  const initialFaculty = db.getFaculty();
  const initialAboutSchool = db.getAboutSchool();
  const initialContact = db.getSchoolContact();

  return (
    <SchoolPortalClient
      initialNotices={initialNotices}
      initialLiveSessions={initialLiveSessions}
      initialFaculty={initialFaculty}
      initialAboutSchool={initialAboutSchool}
      initialContact={initialContact}
    />
  );
}
