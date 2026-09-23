import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CalendarEventCategory, SchoolClass } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const classNum = searchParams.get('class') || undefined;

    const events = db.getCalendarEvents(category, classNum);
    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'update') {
      const { id, updates, adminName } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'Missing id or updates' }, { status: 400 });
      }
      const updated = db.updateCalendarEvent(id, updates, adminName || 'Admin');
      if (updated) {
        return NextResponse.json({ success: true, event: updated });
      }
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Default create
    const { title, description, startDate, endDate, category, isHoliday, targetClass, createdBy } = body;

    if (!title || !startDate || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, Start Date, and Category are required.' },
        { status: 400 }
      );
    }

    const admin = createdBy || 'School Admin';
    const newEvent = db.createCalendarEvent(
      {
        title,
        description: description || '',
        startDate,
        endDate: endDate || startDate,
        category: category as CalendarEventCategory,
        isHoliday: !!isHoliday,
        targetClass: (targetClass as SchoolClass) || 'All',
        createdBy: admin,
      },
      admin
    );

    return NextResponse.json({
      success: true,
      event: newEvent,
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save calendar event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminName = searchParams.get('adminName') || 'Admin';

    if (!id) {
      return NextResponse.json({ success: false, error: 'Event ID is required' }, { status: 400 });
    }

    const deleted = db.deleteCalendarEvent(id, adminName);
    if (deleted) {
      return NextResponse.json({ success: true, message: 'Event deleted successfully' });
    }
    return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
