import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple password hashing
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user || user.password !== simpleHash(password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token: Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
