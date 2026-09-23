import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classNum = searchParams.get('class') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    const notifications = db.getNotifications(classNum, studentId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationId, studentId } = body;

    if (action === 'mark_read' && notificationId && studentId) {
      db.markNotificationRead(notificationId, studentId);
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    if (action === 'mark_all_read' && studentId) {
      db.markAllNotificationsRead(studentId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (action === 'create') {
      const { type, title, message, targetClass, urgent, linkSection } = body;
      if (!title || !message) {
        return NextResponse.json(
          { success: false, error: 'Title and message are required' },
          { status: 400 }
        );
      }
      const newNotif = db.createNotification({
        type: type || 'notice',
        title,
        message,
        targetClass: targetClass || 'All',
        urgent: !!urgent,
        linkSection,
      });
      return NextResponse.json({ success: true, notification: newNotif });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in notifications POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
