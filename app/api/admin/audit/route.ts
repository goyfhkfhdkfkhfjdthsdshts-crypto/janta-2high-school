import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const logs = db.getAuditLogs();
    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'backup') {
      const backupData = db.getBackupData();
      return NextResponse.json({
        success: true,
        data: backupData,
        timestamp: new Date().toISOString(),
        institution: 'Janta +2 High School Khalari',
      });
    }

    if (action === 'log') {
      const { performedBy, targetType, details, auditAction } = body;
      const log = db.logAudit(auditAction || 'ADMIN_ACTION', performedBy || 'Admin', targetType || 'System', details || '');
      return NextResponse.json({ success: true, log });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin audit POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process audit request' },
      { status: 500 }
    );
  }
}
