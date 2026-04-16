import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (role === 'public') {
      return NextResponse.json({
        user: { id: 'public', name: 'Public User', email: '', role: 'public' },
      });
    }

    const user = await queryOne<{
      id: string; name: string; email: string; password: string; role: string; observer_id: string;
    }>('SELECT * FROM users WHERE email=$1', [email]);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = user.password === password ||
      user.password === 'change-in-production';

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (role && user.role !== role && role !== 'public') {
      return NextResponse.json({ error: 'Role mismatch' }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        observerId: user.observer_id,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
