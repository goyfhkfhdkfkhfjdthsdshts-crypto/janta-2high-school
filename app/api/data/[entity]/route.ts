import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const { searchParams } = new URL(req.url);
    const classNum = searchParams.get('class') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const day = searchParams.get('day') || undefined;
    const rollNo = searchParams.get('rollNo') || undefined;

    switch (entity) {
      case 'mcq':
        return NextResponse.json({ success: true, data: db.getMcqs(classNum, subject) });
      case 'books':
        return NextResponse.json({ success: true, data: db.getBooks(classNum, subject) });
      case 'timetable':
        return NextResponse.json({ success: true, data: db.getTimetables(classNum, day) });
      case 'notices':
        return NextResponse.json({ success: true, data: db.getNotices() });
      case 'exams':
        return NextResponse.json({ success: true, data: db.getExamSchedules(classNum) });
      case 'results':
        return NextResponse.json({ success: true, data: db.getResults(classNum, rollNo) });
      case 'faculty':
        return NextResponse.json({ success: true, data: db.getFaculty() });
      case 'contact':
        return NextResponse.json({ success: true, data: db.getSchoolContact() });
      default:
        return NextResponse.json({ success: false, message: 'Invalid entity' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching data entity:', error);
    return NextResponse.json({ success: false, message: 'Error retrieving data' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const body = await req.json();

    const userAgentHeader = req.headers.get('x-admin-user') || 'Admin / Faculty';

    switch (entity) {
      case 'contact': {
        const item = db.updateSchoolContact(body);
        db.logAudit('UPDATE_CONTACT', userAgentHeader, 'Contact', 'Updated school official contact details');
        return NextResponse.json({ success: true, data: item });
      }
      case 'mcq': {
        const item = db.addMcq(body);
        db.logAudit('ADD_QUESTION', userAgentHeader, 'MCQ Question', `Added MCQ question for Class ${body.class} (${body.subject})`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'books': {
        const item = db.addBook(body);
        db.logAudit('UPLOAD_STUDY_MATERIAL', userAgentHeader, 'Book / Material', `Uploaded book: "${body.title}" for Class ${body.class}`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'timetable': {
        const item = db.addTimetableEntry(body);
        db.logAudit('UPDATE_TIMETABLE', userAgentHeader, 'Timetable', `Added ${body.subject} routine for Class ${body.class} on ${body.day}`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'notices': {
        const item = db.addNotice(body);
        db.logAudit('CREATE_NOTICE', userAgentHeader, 'Notice', `Published notice: "${body.title}"`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'exams': {
        const item = db.addExamSchedule(body);
        db.logAudit('CREATE_EXAM', userAgentHeader, 'Exam Schedule', `Scheduled ${body.examName} for Class ${body.class} (${body.subject})`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'results': {
        const item = db.addResult(body);
        db.logAudit('UPDATE_RESULT', userAgentHeader, 'Result', `Published result for ${body.studentName} (Roll: ${body.rollCode}-${body.rollNo || body.rollNumber})`);
        return NextResponse.json({ success: true, data: item });
      }
      case 'faculty': {
        const item = db.addFaculty(body);
        db.logAudit('ADD_FACULTY', userAgentHeader, 'Faculty', `Added faculty profile: ${body.name}`);
        return NextResponse.json({ success: true, data: item });
      }
      default:
        return NextResponse.json({ success: false, message: 'Invalid entity' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error inserting entity item:', error);
    return NextResponse.json({ success: false, message: 'Error creating item' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const body = await req.json();
    const { id, ...updates } = body;
    const userAgentHeader = req.headers.get('x-admin-user') || 'Admin / Faculty';

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    if (entity === 'mcq') {
      const updated = db.updateMcq(id, updates);
      db.logAudit('EDIT_QUESTION', userAgentHeader, 'MCQ Question', `Updated MCQ question ID: ${id}`);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, message: 'Update not supported for entity' }, { status: 400 });
  } catch (error) {
    console.error('Error updating entity item:', error);
    return NextResponse.json({ success: false, message: 'Error updating item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userAgentHeader = req.headers.get('x-admin-user') || 'Admin / Faculty';

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    let deleted = false;
    switch (entity) {
      case 'mcq':
        deleted = db.deleteMcq(id);
        if (deleted) db.logAudit('DELETE_QUESTION', userAgentHeader, 'MCQ Question', `Deleted question ${id}`);
        break;
      case 'books':
        deleted = db.deleteBook(id);
        if (deleted) db.logAudit('DELETE_STUDY_MATERIAL', userAgentHeader, 'Book / Material', `Deleted book item ${id}`);
        break;
      case 'timetable':
        deleted = db.deleteTimetableEntry(id);
        if (deleted) db.logAudit('DELETE_TIMETABLE', userAgentHeader, 'Timetable', `Deleted timetable entry ${id}`);
        break;
      case 'notices':
        deleted = db.deleteNotice(id);
        if (deleted) db.logAudit('DELETE_NOTICE', userAgentHeader, 'Notice', `Deleted notice circular ${id}`);
        break;
      case 'exams':
        deleted = db.deleteExamSchedule(id);
        if (deleted) db.logAudit('DELETE_EXAM', userAgentHeader, 'Exam Schedule', `Deleted exam schedule ${id}`);
        break;
      case 'results':
        deleted = db.deleteResult(id);
        if (deleted) db.logAudit('DELETE_RESULT', userAgentHeader, 'Result', `Deleted marksheet entry ${id}`);
        break;
      case 'faculty':
        deleted = db.deleteFaculty(id);
        if (deleted) db.logAudit('DELETE_FACULTY', userAgentHeader, 'Faculty', `Deleted faculty profile ${id}`);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid entity' }, { status: 400 });
    }

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting entity item:', error);
    return NextResponse.json({ success: false, message: 'Error deleting item' }, { status: 500 });
  }
}
