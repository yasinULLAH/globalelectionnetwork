import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const election = await queryOne('SELECT * FROM elections WHERE id = $1', [params.id]);
    if (!election) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ election });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json();
    const [row] = await query(`
      UPDATE elections SET
        name=$1, country=$2, election_type=$3, region=$4, province=$5, date=$6,
        status=$7, total_seats=$8, total_registered_voters=$9,
        description=$10, flag_emoji=$11, updated_at=NOW()
      WHERE id=$12 RETURNING *
    `, [b.name, b.country, b.electionType, b.region, b.province, b.date,
        b.status, b.totalSeats, b.totalRegisteredVoters,
        b.description, b.flagEmoji, params.id]);
    return NextResponse.json({ election: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM elections WHERE id = $1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
