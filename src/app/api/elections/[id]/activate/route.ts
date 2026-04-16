import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('UPDATE elections SET is_active = FALSE');
    const [row] = await query(
      'UPDATE elections SET is_active = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *',
      [params.id]
    );
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ election: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
