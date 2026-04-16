import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const electionId = new URL(req.url).searchParams.get('electionId');
    let sql = 'SELECT * FROM parties';
    const params: unknown[] = [];
    if (electionId) { sql += ' WHERE election_id=$1'; params.push(electionId); }
    sql += ' ORDER BY seats DESC, total_votes DESC';
    const parties = await query(sql, params);
    return NextResponse.json({ parties });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // Verify the provided election_id exists; if not, fall back to the active election
    let electionId: string | null = b.electionId ?? null;
    if (electionId) {
      const check = await query('SELECT id FROM elections WHERE id=$1 LIMIT 1', [electionId]);
      if (!check.length) electionId = null;
    }
    if (!electionId) {
      const elections = await query(
        'SELECT id FROM elections WHERE is_active=TRUE LIMIT 1'
      ) as {id:string}[];
      electionId = elections[0]?.id ?? null;
    }
    if (!electionId) {
      return NextResponse.json({ error: 'No active election found' }, { status: 422 });
    }

    const [row] = await query(`
      INSERT INTO parties (name, short_name, color, bg_color, founded_year, ideology, election_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [b.name, b.shortName, b.color, b.bgColor, b.foundedYear ?? null, b.ideology ?? null, electionId]);
    return NextResponse.json({ party: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
