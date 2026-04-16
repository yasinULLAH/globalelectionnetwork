import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
    const election = await queryOne(`
      SELECT id, name, country, election_type, region, province, date, status,
             total_seats, total_registered_voters, description, flag_emoji, is_active
      FROM elections WHERE is_active = TRUE LIMIT 1
    `);
    if (!election) return NextResponse.json({ error: 'No active election' }, { status: 404 });
    return NextResponse.json({ election });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
