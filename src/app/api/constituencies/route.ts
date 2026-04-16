import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId = searchParams.get('electionId');
    const type       = searchParams.get('type');

    let sql = `
      SELECT c.*, p.name AS province_name
      FROM constituencies c
      JOIN provinces p ON p.id = c.province_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let i = 1;
    if (electionId) { sql += ` AND c.election_id=$${i++}`; params.push(electionId); }
    if (type)       { sql += ` AND c.type=$${i++}`;        params.push(type); }
    sql += ' ORDER BY c.code';

    const constituencies = await query(sql, params);
    return NextResponse.json({ constituencies });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const [row] = await query(`
      INSERT INTO constituencies
        (name, code, province_id, district, type, registered_voters, total_stations, lat, lng, election_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [b.name, b.code, b.provinceId, b.district, b.type ?? 'national',
        b.registeredVoters ?? 0, b.totalStations ?? 0,
        b.lat ?? null, b.lng ?? null, b.electionId]);
    return NextResponse.json({ constituency: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
