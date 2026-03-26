import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all channels
export async function GET() {
  try {
    const channels = await db.channel.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}

// POST - Create new channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const channel = await db.channel.create({
      data: {
        name: body.name,
        slug: body.slug,
        logoUrl: body.logoUrl,
        streamUrl: body.streamUrl,
        epgUrl: body.epgUrl,
        isLive: body.isLive !== false,
        country: body.country,
        language: body.language,
        categoryId: body.categoryId || null
      }
    });
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 });
  }
}
