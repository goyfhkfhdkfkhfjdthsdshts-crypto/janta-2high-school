import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SchoolClass } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterClass = searchParams.get('class');

    const sessions = db.getLiveSessions(filterClass || undefined);
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    return NextResponse.json({ success: false, message: 'Failed to load sessions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schoolClass, subject, teacherName, title, createdBy } = body;

    if (!schoolClass || !subject || !teacherName || !title) {
      return NextResponse.json(
        { success: false, message: 'Class, Subject, Teacher Name, and Title are required' },
        { status: 400 }
      );
    }

    // Generate unique, clean alphanumeric room name on meet.jit.si
    const cleanSubj = subject.replace(/[^a-zA-Z0-9]/g, '');
    const cleanTeacher = teacherName.replace(/[^a-zA-Z0-9]/g, '');
    const timeHash = Date.now().toString(36);
    // Real valid meet.jit.si room name:
    const meetingId = `JantaHighSchoolKhalari_Class${schoolClass}_${cleanSubj}_${cleanTeacher}_${timeHash}`;
    const meetingUrl = `https://meet.jit.si/${meetingId}`;

    const newSession = db.createLiveSession({
      class: schoolClass as SchoolClass,
      subject,
      teacherName,
      title,
      meetingId,
      meetingUrl,
      createdBy: createdBy || 'Teacher',
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    console.error('Error creating live session:', error);
    return NextResponse.json({ success: false, message: 'Failed to start live session' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'Session ID required' }, { status: 400 });
    }

    const updated = db.endLiveSession(sessionId);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: updated, message: 'This Live Class has ended.' });
  } catch (error) {
    console.error('Error ending live session:', error);
    return NextResponse.json({ success: false, message: 'Failed to end live session' }, { status: 500 });
  }
}
