import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const elections = await query(`
      SELECT id, name, country, election_type, region, province, date, status,
             total_seats, total_registered_voters, description, flag_emoji, is_active,
             created_at, updated_at
      FROM elections ORDER BY created_at DESC
    `);
    return NextResponse.json({ elections });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const [row] = await query(`
      INSERT INTO elections (name, country, election_type, region, province, date, status,
        total_seats, total_registered_voters, description, flag_emoji)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `, [b.name, b.country ?? 'Pakistan', b.electionType ?? 'General', b.region, b.province,
        b.date, b.status ?? 'upcoming', b.totalSeats ?? 0,
        b.totalRegisteredVoters ?? 0, b.description ?? '', b.flagEmoji ?? '🗳️']);
    return NextResponse.json({ election: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
