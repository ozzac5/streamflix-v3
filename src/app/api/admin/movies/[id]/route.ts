import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single movie
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const movie = await db.movie.findUnique({
      where: { id },
      include: { category: true }
    });
    
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    
    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 });
  }
}

// PUT - Update movie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const movie = await db.movie.update({
      where: { id },
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
    console.error('Error updating movie:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 });
  }
}

// DELETE - Delete movie
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.movie.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 });
  }
}
