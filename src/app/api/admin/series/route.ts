import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all series
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    
    const [series, total] = await Promise.all([
      db.series.findMany({
        include: { 
          category: true,
          _count: { select: { seasons: true } }
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      db.series.count()
    ]);
    
    return NextResponse.json({
      series,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take)
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

// POST - Create new series
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const series = await db.series.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        posterUrl: body.posterUrl,
        backdropUrl: body.backdropUrl,
        trailerUrl: body.trailerUrl,
        imdbId: body.imdbId,
        imdbRating: body.imdbRating ? parseFloat(body.imdbRating) : null,
        year: body.year ? parseInt(body.year) : null,
        endYear: body.endYear ? parseInt(body.endYear) : null,
        status: body.status,
        language: body.language,
        country: body.country,
        isFeatured: body.isFeatured || false,
        isTrending: body.isTrending || false,
        categoryId: body.categoryId || null
      }
    });
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}
