import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const party = await queryOne('SELECT * FROM parties WHERE id=$1', [params.id]);
    if (!party) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ party });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json();
    const [row] = await query(
      `UPDATE parties SET name=$1, short_name=$2, color=$3, bg_color=$4,
       founded_year=$5, ideology=$6 WHERE id=$7 RETURNING *`,
      [b.name, b.shortName, b.color, b.bgColor, b.foundedYear, b.ideology, params.id]
    );
    return NextResponse.json({ party: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM parties WHERE id=$1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
