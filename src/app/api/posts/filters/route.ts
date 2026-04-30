import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [yearsResult, categoriesResult] = await Promise.all([
      query<{ year: string }>(`
        SELECT DISTINCT EXTRACT(YEAR FROM COALESCE(published_at, created_at))::int AS year
        FROM posts
        WHERE status = 'published'
        ORDER BY year DESC
      `, []),
      query<{ category: string }>(`
        SELECT DISTINCT category
        FROM posts
        WHERE status = 'published' AND category IS NOT NULL AND category <> ''
        ORDER BY category ASC
      `, []),
    ]);

    let years = yearsResult.map((r) => r.year).filter(Boolean);
    let categories = categoriesResult.map((r) => r.category).filter(Boolean);

    // Mock Fallback
    if (!years.length) years = [new Date().getFullYear().toString()];
    if (!categories.length) categories = ['Elections', 'Technology', 'Analysis', 'News'];

    return NextResponse.json({ years, categories });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
