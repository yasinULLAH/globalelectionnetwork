import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const published = new URL(req.url).searchParams.get('published');
    let sql = 'SELECT id, title, slug, meta_description, is_published, show_in_nav, created_at, updated_at FROM pages';
    const params: unknown[] = [];
    if (published === 'true') { sql += ' WHERE is_published = TRUE'; }
    sql += ' ORDER BY created_at DESC';
    const pages = await query(sql, params);
    return NextResponse.json({ pages });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const [row] = await query(`
      INSERT INTO pages (title, slug, content, meta_description, is_published, show_in_nav)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [b.title, slug, b.content ?? '', b.metaDescription ?? '', b.isPublished ?? false, b.showInNav ?? false]);
    return NextResponse.json({ page: row }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
