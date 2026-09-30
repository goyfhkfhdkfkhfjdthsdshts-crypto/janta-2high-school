import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || searchParams.get('id');

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID is required.' },
        { status: 400 }
      );
    }

    const testAttempts = db.getTestAttempts(studentId);
    const bookmarks = db.getBookmarks(studentId);
    const notes = db.getStudentNotes(studentId);

    return NextResponse.json({
      success: true,
      data: {
        testAttempts,
        bookmarks,
        notes,
      },
    });
  } catch (error) {
    console.error('Error fetching student activity:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, studentId } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Permanent Student ID is required.' },
        { status: 400 }
      );
    }

    if (action === 'save_test') {
      const record = db.saveTestAttempt({
        studentId,
        subject: body.subject || 'General',
        chapter: body.chapter || 'All Chapters',
        totalQuestions: Number(body.totalQuestions) || 10,
        correctAnswers: Number(body.correctAnswers) || 0,
        scorePercentage: Number(body.scorePercentage) || 0,
        class: body.class,
      });
      return NextResponse.json({ success: true, record });
    }

    if (action === 'save_bookmark') {
      const bookmark = db.saveBookmark(studentId, body.bookmark);
      return NextResponse.json({ success: true, bookmark });
    }

    if (action === 'delete_bookmark') {
      const removed = db.removeBookmark(studentId, body.itemId);
      return NextResponse.json({ success: true, removed });
    }

    if (action === 'save_note') {
      const note = db.saveStudentNote(studentId, body.note);
      return NextResponse.json({ success: true, note });
    }

    if (action === 'delete_note') {
      const removed = db.deleteStudentNote(studentId, body.noteId);
      return NextResponse.json({ success: true, removed });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error saving student activity:', error);
    return NextResponse.json(
      { success: false, message: 'School server is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
