import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const classNum = searchParams.get('class') || undefined;

    const data = db.globalSearch(q, classNum);
    return NextResponse.json({
      success: true,
      query: q,
      results: data.results,
      total: data.total,
    });
  } catch (error) {
    console.error('Error during global search:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
