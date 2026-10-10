import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { applyCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return handleCorsOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    const db = getDatabase();
    const studentCount = db.users.filter((u) => u.role === 'student').length;
    const staffCount = db.users.filter((u) => u.role !== 'student').length;

    const healthData = {
      status: 'healthy',
      service: 'Janta +2 High School - Khalari Academic Portal',
      version: '1.0.0',
      database: 'connected',
      metrics: {
        totalUsers: db.users.length,
        students: studentCount,
        staff: staffCount,
        notices: db.notices?.length || 0,
        homework: db.homework?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };

    const res = NextResponse.json(healthData, { status: 200 });
    return applyCors(res, req);
  } catch (error: any) {
    console.error('Health check failure:', error);
    const errRes = NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error?.message || 'Database inaccessible',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
    return applyCors(errRes, req);
  }
}
