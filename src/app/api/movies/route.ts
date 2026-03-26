import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || '1';
    
    const where: Record<string, unknown> = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.isFeatured = true;
    if (trending === 'true') where.isTrending = true;
    
    const take = limit ? parseInt(limit) : 20;
    const skip = (parseInt(page) - 1) * take;
    
    const [movies, total] = await Promise.all([
      db.movie.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip
      }),
      db.movie.count({ where })
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
