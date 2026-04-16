import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const candidate = await queryOne(`
      SELECT c.*, p.name AS party_name, p.short_name AS party_short, p.color AS party_color,
             con.name AS constituency_name, con.code AS constituency_code
      FROM candidates c
      JOIN parties p ON p.id = c.party_id
      JOIN constituencies con ON con.id = c.constituency_id
      WHERE c.id = $1
    `, [params.id]);
    if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ candidate });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json();
    const [row] = await query(`
      UPDATE candidates SET
        name=$1, party_id=$2, constituency_id=$3, votes=$4, likes=$5,
        bio=$6, age=$7, education=$8, initials=$9, profession=$10, photo_url=$11
      WHERE id=$12 RETURNING *
    `, [b.name, b.partyId, b.constituencyId, b.votes, b.likes,
        b.bio, b.age, b.education, b.initials, b.profession, b.photoUrl, params.id]);
    return NextResponse.json({ candidate: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM candidates WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json();
    if (action === 'like') {
      const [row] = await query(
        'UPDATE candidates SET likes = likes + 1 WHERE id = $1 RETURNING likes',
        [params.id]
      );
      return NextResponse.json({ likes: (row as { likes: number }).likes });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
