import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActor, hasAdminPanelAccess } from '@/lib/session';

/**
 * Audit trail and full-database backup are private school records: they are
 * readable only from the management panel (Principal/Admin session, or staff who
 * verified the school's admin password).
 */
function denyUnprivileged(req: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Administrator access required for audit records.' },
    { status: 403 }
  );
}

export async function GET(req: NextRequest) {
  try {
    if (!hasAdminPanelAccess(req)) {
      return denyUnprivileged(req);
    }

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

export async function POST(req: NextRequest) {
  try {
    if (!hasAdminPanelAccess(req)) {
      return denyUnprivileged(req);
    }

    const body = await req.json();
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
      const { targetType, details, auditAction } = body;
      // Attribute the entry to the verified caller, not to client-supplied text.
      const actor = getActor(req);
      const performedBy = actor ? actor.name : 'Admin';
      const log = db.logAudit(auditAction || 'ADMIN_ACTION', performedBy, targetType || 'System', details || '');
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
