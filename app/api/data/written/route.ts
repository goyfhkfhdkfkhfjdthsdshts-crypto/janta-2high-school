import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'questions';
    const classNum = searchParams.get('class') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const questionId = searchParams.get('questionId') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    if (type === 'submissions') {
      const submissions = db.getWrittenSubmissions(questionId, studentId, classNum);
      return NextResponse.json({ success: true, submissions });
    }

    const questions = db.getWrittenQuestions(classNum, subject);
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching written questions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve written questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'submit_answer') {
      const {
        questionId,
        studentId,
        studentName,
        class: studentClass,
        subject,
        studentAnswer,
        attachmentUrl,
      } = body;

      if (!questionId || !studentAnswer) {
        return NextResponse.json(
          { success: false, message: 'Question ID and written answer are required' },
          { status: 400 }
        );
      }

      const submission = db.submitWrittenAnswer({
        questionId,
        studentId: studentId || 'student_guest',
        studentName: studentName || 'Student',
        class: studentClass || '10',
        subject: subject || 'General',
        studentAnswer,
        attachmentUrl,
      });

      return NextResponse.json({ success: true, submission });
    }

    if (action === 'add_question') {
      const {
        class: qClass,
        subject,
        chapter,
        question,
        marks,
        wordLimit,
        modelAnswer,
        markingScheme,
      } = body;

      if (!qClass || !subject || !question || !modelAnswer) {
        return NextResponse.json(
          { success: false, message: 'Class, subject, question, and model answer are required' },
          { status: 400 }
        );
      }

      const newQ = db.addWrittenQuestion({
        class: qClass,
        subject,
        chapter: chapter || 'General Chapter',
        question,
        marks: Number(marks) || 5,
        wordLimit: wordLimit || '100 - 150 words',
        modelAnswer,
        markingScheme,
      });

      return NextResponse.json({ success: true, question: newQ });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid written action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in written questions POST:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process written question action' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, marks, remarks, teacherName } = body;

    if (!submissionId || typeof marks !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Submission ID and valid marks are required' },
        { status: 400 }
      );
    }

    const updated = db.gradeWrittenSubmission(
      submissionId,
      marks,
      remarks,
      teacherName || 'Subject Teacher'
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error('Error grading written submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Question ID is required' },
        { status: 400 }
      );
    }

    const deleted = db.deleteWrittenQuestion(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting written question:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
