import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AttendanceRecord, SchoolClass } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'student';
    const studentId = searchParams.get('studentId') || '';
    const studentEmail = searchParams.get('studentEmail') || '';
    const classNum = (searchParams.get('class') as SchoolClass) || '10';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const month = searchParams.get('month') || date.slice(0, 7); // YYYY-MM

    if (mode === 'student') {
      if (!studentId && !studentEmail) {
        return NextResponse.json(
          { success: false, message: 'Student ID or Email is required' },
          { status: 400 }
        );
      }

      const summary = db.getStudentAttendanceSummary(studentId, classNum, studentEmail);
      return NextResponse.json({ success: true, summary });
    }

    if (mode === 'class') {
      const summary = db.getClassAttendanceSummary(classNum, date);
      return NextResponse.json({ success: true, summary });
    }

    if (mode === 'report') {
      const records = db.getAttendanceRecords({ class: classNum, month });
      const enrolled = db.getEnrolledStudents(classNum);

      // Aggregate attendance per enrolled student for monthly report
      const monthlyReport = enrolled.map((student) => {
        const studentRecords = records.filter(
          (r) =>
            r.studentId === student.id ||
            r.studentEmail.toLowerCase() === student.email.toLowerCase()
        );
        const presentCount = studentRecords.filter((r) => r.status === 'Present').length;
        const totalTrackedDays = Math.max(1, new Set(records.map((r) => r.date)).size);
        const percentage = Math.min(100, Math.round((presentCount / totalTrackedDays) * 100));

        return {
          studentId: student.id,
          name: student.name,
          rollNo: student.rollNo || '-',
          class: student.selectedClass,
          presentDays: presentCount,
          totalDays: totalTrackedDays,
          percentage,
          records: studentRecords,
        };
      });

      return NextResponse.json({
        success: true,
        month,
        class: classNum,
        totalEnrolled: enrolled.length,
        report: monthlyReport,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid query mode' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      studentEmail,
      studentName,
      spokenOrEnteredName,
      class: studentClass,
      rollNo,
      method = 'manual',
      date: clientDate,
      time: clientTime,
    } = body;

    // Security & integrity validation
    if (!studentId || !studentEmail || !studentName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authenticated student identification is required. Please sign in.',
        },
        { status: 401 }
      );
    }

    if (!studentClass || !['9', '10', '11', '12'].includes(studentClass)) {
      return NextResponse.json(
        { success: false, message: 'A valid class (9, 10, 11, 12) is required.' },
        { status: 400 }
      );
    }

    // Determine current date & time on server (authoritative date)
    const now = new Date();
    // Use server date in YYYY-MM-DD
    const authoritativeDate = clientDate || now.toISOString().split('T')[0];
    const authoritativeTime =
      clientTime ||
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    // Mark attendance with atomic duplication prevention
    const result = db.markAttendance({
      studentId,
      studentEmail,
      studentName,
      spokenOrEnteredName: spokenOrEnteredName || studentName,
      class: studentClass as SchoolClass,
      rollNo: rollNo || '',
      date: authoritativeDate,
      time: authoritativeTime,
      status: 'Present',
      method: method === 'voice' ? 'voice' : 'manual',
      verifiedBy: 'school_auth',
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          code: result.code,
          message: result.message,
          record: result.record,
        },
        { status: 409 } // 409 Conflict: Already marked for today
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      record: result.record,
    });
  } catch (error: any) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing attendance' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, remarks, adminName, date, time } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Record ID is required for correction' },
        { status: 400 }
      );
    }

    const updates: Partial<AttendanceRecord> = {};
    if (status && ['Present', 'Absent'].includes(status)) {
      updates.status = status;
    }
    if (remarks !== undefined) {
      updates.remarks = remarks;
    }
    if (date) {
      updates.date = date;
    }
    if (time) {
      updates.time = time;
    }
    updates.method = 'admin_override';

    const updated = db.updateAttendanceRecord(id, updates, adminName || 'School Admin');

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }

    db.logAudit(
      'UPDATE_ATTENDANCE',
      adminName || 'Attendance Admin',
      'Attendance',
      `Modified attendance for ${updated.studentName} on ${updated.date}: Status=${updated.status}, Remarks=${updated.remarks || 'None'}`
    );

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully',
      record: updated,
    });
  } catch (error: any) {
    console.error('Error updating attendance record:', error);
    return NextResponse.json(
      { success: false, message: 'Server error updating attendance record' },
      { status: 500 }
    );
  }
}
