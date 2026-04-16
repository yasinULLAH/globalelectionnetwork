import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const electionId = new URL(req.url).searchParams.get('electionId') ?? 'el-gb-2024';

    const [totalVotes, totalCandidates, totalObservers,
           verifiedResults, flaggedResults, parties] = await Promise.all([
      queryOne<{ total: string }>(
        'SELECT COALESCE(SUM(votes),0)::TEXT AS total FROM candidates WHERE election_id=$1',
        [electionId]
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::TEXT AS count FROM candidates WHERE election_id=$1',
        [electionId]
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::TEXT AS count FROM observers WHERE election_id=$1',
        [electionId]
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::TEXT AS count FROM result_entries WHERE election_id=$1 AND verified=TRUE',
        [electionId]
      ),
      queryOne<{ count: string }>(
        'SELECT COUNT(*)::TEXT AS count FROM result_entries WHERE election_id=$1 AND flagged=TRUE',
        [electionId]
      ),
      query(
        'SELECT short_name, color, seats, total_votes FROM parties WHERE election_id=$1 ORDER BY seats DESC',
        [electionId]
      ),
    ]);

    return NextResponse.json({
      totalVotesCast:    parseInt(totalVotes?.total ?? '0'),
      totalCandidates:   parseInt(totalCandidates?.count ?? '0'),
      totalObservers:    parseInt(totalObservers?.count ?? '0'),
      verifiedResults:   parseInt(verifiedResults?.count ?? '0'),
      flaggedResults:    parseInt(flaggedResults?.count ?? '0'),
      parties,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
