import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json({ movies: [], series: [], channels: [] });
    }
    
    const [movies, series, channels] = await Promise.all([
      db.movie.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } }
          ]
        },
        include: { category: true },
        take: 10
      }),
      db.series.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } }
          ]
        },
        include: { category: true },
        take: 10
      }),
      db.channel.findMany({
        where: {
          name: { contains: q }
        },
        include: { category: true },
        take: 10
      })
    ]);
    
    return NextResponse.json({ movies, series, channels });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
