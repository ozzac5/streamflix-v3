import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get single channel
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
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching channel:', error);
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 });
  }
}

// PUT - Update channel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const channel = await db.channel.update({
      where: { id },
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
    console.error('Error updating channel:', error);
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
  }
}

// DELETE - Delete channel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.channel.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json({ error: 'Failed to delete channel' }, { status: 500 });
  }
}
