import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { PARTIES } from '@/lib/mockData';

export async function GET(req: NextRequest) {
  try {
    const electionId = new URL(req.url).searchParams.get('electionId');
    let sql = `
      SELECT *, 
             facebook_url AS "facebookUrl", twitter_url AS "twitterUrl",
             instagram_url AS "instagramUrl", youtube_url AS "youtubeUrl"
      FROM parties
    `;
    const params: unknown[] = [];
    if (electionId) { sql += ' WHERE election_id=$1'; params.push(electionId); }
    sql += ' ORDER BY seats DESC, total_votes DESC';
    let parties = await query(sql, params);

    // Mock Fallback
    if (!parties.length) {
      parties = PARTIES.map(p => ({
        ...p,
        short_name: p.shortName,
        total_votes: p.totalVotes,
        founded_year: p.foundedYear
      })) as any;
    }

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
      INSERT INTO parties (name, short_name, color, bg_color, founded_year, ideology, election_id, 
                           facebook_url, twitter_url, instagram_url, youtube_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `, [b.name, b.shortName, b.color, b.bgColor, b.foundedYear ?? null, b.ideology ?? null, electionId,
        b.facebookUrl ?? null, b.twitterUrl ?? null, b.instagramUrl ?? null, b.youtubeUrl ?? null]);
    return NextResponse.json({ party: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
