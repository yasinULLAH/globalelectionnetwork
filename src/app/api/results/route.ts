import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId     = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');
    const verified       = searchParams.get('verified');
    const flagged        = searchParams.get('flagged');

    let sql = `
      SELECT r.*, c.name AS constituency_name, c.code AS constituency_code,
             p.color AS party_color, p.short_name AS party_short
      FROM result_entries r
      JOIN constituencies c ON c.id = r.constituency_id
      JOIN parties p ON p.id = r.party_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let i = 1;
    if (electionId)     { sql += ` AND r.election_id=$${i++}`;     params.push(electionId); }
    if (constituencyId) { sql += ` AND r.constituency_id=$${i++}`; params.push(constituencyId); }
    if (verified)       { sql += ` AND r.verified=$${i++}`;        params.push(verified === 'true'); }
    if (flagged)        { sql += ` AND r.flagged=$${i++}`;         params.push(flagged === 'true'); }
    sql += ' ORDER BY r.submitted_at DESC';

    const results = await query(sql, params);
    return NextResponse.json({ results });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const [row] = await query(`
      INSERT INTO result_entries
        (candidate_id, candidate_name, party_id, polling_station_id, polling_station_name,
         constituency_id, election_id, votes, submitted_by, observer_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
    `, [b.candidateId, b.candidateName, b.partyId, b.pollingStationId,
        b.pollingStationName, b.constituencyId, b.electionId,
        b.votes, b.submittedBy, b.observerId ?? null]);

    await query(
      'UPDATE candidates SET votes = votes + $1 WHERE id = $2',
      [b.votes, b.candidateId]
    );

    return NextResponse.json({ result: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
