import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const channel = await db.channel.findUnique({
      where: { id },
      include: { category: true }
    });
    
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }
    
    // Increment views
    await db.channel.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}
