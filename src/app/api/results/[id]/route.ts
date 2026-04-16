import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json();
    if (action === 'verify') {
      const [row] = await query(
        'UPDATE result_entries SET verified=TRUE, flagged=FALSE WHERE id=$1 RETURNING *',
        [params.id]
      );
      return NextResponse.json({ result: row });
    }
    if (action === 'flag') {
      const [row] = await query(
        'UPDATE result_entries SET flagged=TRUE, verified=FALSE WHERE id=$1 RETURNING *',
        [params.id]
      );
      return NextResponse.json({ result: row });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM result_entries WHERE id=$1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
