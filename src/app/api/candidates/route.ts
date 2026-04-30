import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId      = searchParams.get('electionId');
    const partyId         = searchParams.get('partyId');
    const constituencyId  = searchParams.get('constituencyId');
    const search          = searchParams.get('search');

    let sql = `
      SELECT c.*, c.photo_url AS "photoUrl", 
             c.facebook_url AS "facebookUrl", c.twitter_url AS "twitterUrl",
             c.instagram_url AS "instagramUrl", c.youtube_url AS "youtubeUrl",
             p.name AS party_name, p.short_name AS party_short,
             p.color AS party_color, p.bg_color AS party_bg,
             con.name AS constituency_name, con.code AS constituency_code
      FROM candidates c
      JOIN parties p ON p.id = c.party_id
      JOIN constituencies con ON con.id = c.constituency_id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let i = 1;
    if (electionId)     { sql += ` AND c.election_id=$${i++}`;     params.push(electionId); }
    if (partyId)        { sql += ` AND c.party_id=$${i++}`;        params.push(partyId); }
    if (constituencyId) { sql += ` AND c.constituency_id=$${i++}`; params.push(constituencyId); }
    if (search)         { sql += ` AND c.name ILIKE $${i++}`;      params.push(`%${search}%`); }
    sql += ' ORDER BY c.votes DESC';

    const candidates = await query(sql, params);
    return NextResponse.json({ candidates });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // Resolve election_id: verify provided one or fall back to active
    let electionId: string | null = b.electionId ?? null;
    if (electionId) {
      const check = await query('SELECT id FROM elections WHERE id=$1 LIMIT 1', [electionId]);
      if (!check.length) electionId = null;
    }
    if (!electionId) {
      const active = await query('SELECT id FROM elections WHERE is_active=TRUE LIMIT 1') as {id:string}[];
      electionId = active[0]?.id ?? null;
    }
    if (!electionId) {
      return NextResponse.json({ error: 'No active election found' }, { status: 422 });
    }

    // Validate required FK references
    if (!b.partyId) return NextResponse.json({ error: 'Party is required' }, { status: 400 });
    if (!b.constituencyId) return NextResponse.json({ error: 'Constituency is required' }, { status: 400 });

    const [partyCheck] = await query('SELECT id FROM parties WHERE id=$1', [b.partyId]) as {id:string}[];
    if (!partyCheck) return NextResponse.json({ error: 'Party not found' }, { status: 422 });

    const [conCheck] = await query('SELECT id FROM constituencies WHERE id=$1', [b.constituencyId]) as {id:string}[];
    if (!conCheck) return NextResponse.json({ error: 'Constituency not found' }, { status: 422 });

    const [row] = await query(`
      INSERT INTO candidates
        (name, party_id, constituency_id, election_id, votes, likes, bio, age, education, initials, profession, photo_url,
         facebook_url, twitter_url, instagram_url, youtube_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `, [b.name, b.partyId, b.constituencyId, electionId,
        b.votes ?? 0, b.likes ?? 0, b.bio ?? null, b.age ?? null,
        b.education ?? null, b.initials ?? b.name.slice(0,2).toUpperCase(),
        b.profession ?? null, b.photoUrl ?? null,
        b.facebookUrl ?? null, b.twitterUrl ?? null, b.instagramUrl ?? null, b.youtubeUrl ?? null]);
    return NextResponse.json({ candidate: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
