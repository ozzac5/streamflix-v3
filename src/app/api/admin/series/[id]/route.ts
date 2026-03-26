import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single series with seasons and episodes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const series = await db.series.findUnique({
      where: { id },
      include: { 
        category: true,
        seasons: {
          orderBy: { seasonNumber: 'asc' },
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' }
            }
          }
        }
      }
    });
    
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

// PUT - Update series
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const series = await db.series.update({
      where: { id },
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
    console.error('Error updating series:', error);
    return NextResponse.json({ error: 'Failed to update series' }, { status: 500 });
  }
}

// DELETE - Delete series
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.series.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json({ error: 'Failed to delete series' }, { status: 500 });
  }
}
