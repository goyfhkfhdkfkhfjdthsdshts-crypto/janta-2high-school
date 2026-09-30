import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SchoolClass } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classNum = searchParams.get('class') || undefined;

    const homework = db.getHomework(classNum);
    return NextResponse.json({
      success: true,
      homework,
      count: homework.length,
    });
  } catch (error) {
    console.error('Error fetching homework:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homework' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Student marking / unmarking completion or submitting homework
    if (action === 'toggle_complete') {
      const { homeworkId, studentId, studentName, notes, submissionUrl, submissionName } = body;
      if (!homeworkId || !studentId || !studentName) {
        return NextResponse.json(
          { success: false, error: 'Missing homeworkId, studentId, or studentName' },
          { status: 400 }
        );
      }

      const res = db.toggleHomeworkCompletion(
        homeworkId,
        studentId,
        studentName,
        notes,
        submissionUrl,
        submissionName
      );
      return NextResponse.json({
        success: true,
        completed: res.completed,
        item: res.item,
      });
    }

    // Teacher/Admin creating new homework
    if (action === 'create' || !action) {
      const { class: classNum, subject, title, description, dueDate, attachmentUrl, attachmentName, assignedBy } = body;

      if (!classNum || !subject || !title || !description || !dueDate) {
        return NextResponse.json(
          { success: false, error: 'Class, Subject, Title, Description, and Due Date are required.' },
          { status: 400 }
        );
      }

      const creator = assignedBy || 'Teacher / Faculty';
      const newHw = db.createHomework(
        {
          class: classNum as SchoolClass,
          subject,
          title,
          description,
          dueDate,
          attachmentUrl,
          attachmentName,
          assignedBy: creator,
        },
        creator
      );

      return NextResponse.json({
        success: true,
        homework: newHw,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error saving homework:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save homework' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminName = searchParams.get('adminName') || 'Teacher / Admin';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Homework ID is required' }, { status: 400 });
    }

    const deleted = db.deleteHomework(id, adminName);
    if (deleted) {
      return NextResponse.json({ success: true, message: 'Homework assignment deleted' });
    } else {
      return NextResponse.json({ success: false, error: 'Homework not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting homework:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete homework' }, { status: 500 });
  }
}
