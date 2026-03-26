import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    
    const channels = await db.channel.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
