import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all banners
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { order: 'asc' }
    });
    
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const banner = await db.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        imageUrl: body.imageUrl,
        movieId: body.movieId || null,
        seriesId: body.seriesId || null,
        linkUrl: body.linkUrl,
        isActive: body.isActive !== false,
        order: body.order || 0
      }
    });
    
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
