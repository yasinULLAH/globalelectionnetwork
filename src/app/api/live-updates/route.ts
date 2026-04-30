import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LIVE_UPDATES } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId = searchParams.get('electionId');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    let sql = 'SELECT * FROM live_updates WHERE 1=1';
    const params: unknown[] = [];
    let i = 1;
    if (electionId) { sql += \` AND election_id=$$\{i++}\`; params.push(electionId); }
    sql += \` ORDER BY timestamp DESC LIMIT $$\{i}\`;
    params.push(limit);

    let updates = await query(sql, params);

    // Mock Fallback
    if (!updates.length) {
      updates = LIVE_UPDATES.map(u => ({
        ...u,
        constituency_code: u.constituencyCode
      })) as any;
    }

    return NextResponse.json({ updates });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const [row] = await query(`
      INSERT INTO live_updates (message, type, constituency_code, election_id)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [b.message, b.type ?? 'update', b.constituencyCode ?? null, b.electionId]);
    return NextResponse.json({ update: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
