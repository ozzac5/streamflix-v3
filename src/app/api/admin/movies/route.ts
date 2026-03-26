import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all movies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    
    const [movies, total] = await Promise.all([
      db.movie.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      db.movie.count()
    ]);
    
    return NextResponse.json({
      movies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take)
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}

// POST - Create new movie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const movie = await db.movie.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        posterUrl: body.posterUrl,
        backdropUrl: body.backdropUrl,
        videoUrl: body.videoUrl,
        trailerUrl: body.trailerUrl,
        imdbId: body.imdbId,
        imdbRating: body.imdbRating ? parseFloat(body.imdbRating) : null,
        year: body.year ? parseInt(body.year) : null,
        duration: body.duration ? parseInt(body.duration) : null,
        quality: body.quality,
        language: body.language,
        country: body.country,
        isFeatured: body.isFeatured || false,
        isTrending: body.isTrending || false,
        categoryId: body.categoryId || null
      }
    });
    
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error creating movie:', error);
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 });
  }
}
