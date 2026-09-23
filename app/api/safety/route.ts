import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const reports = db.getSafetyReports();
    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error('Error fetching safety reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, messageContent, senderName, senderId, reportedBy, reporterEmail, reason } = body;

    if (!messageContent || !senderName || !reportedBy || !reason) {
      return NextResponse.json(
        { success: false, error: 'Message content, sender, reporter, and reason are required.' },
        { status: 400 }
      );
    }

    const report = db.reportMessage({
      messageId,
      messageContent,
      senderName,
      senderId,
      reportedBy,
      reporterEmail,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: 'Report submitted for teacher/admin moderation review.',
      report,
    });
  } catch (error) {
    console.error('Error reporting message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, actionNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Report id and status required' }, { status: 400 });
    }

    const updated = db.updateSafetyReport(id, status, actionNote);
    if (updated) {
      return NextResponse.json({ success: true, message: 'Report updated' });
    }
    return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}
