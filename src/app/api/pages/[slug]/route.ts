import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const page = await queryOne('SELECT * FROM pages WHERE slug=$1', [params.slug]);
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ page });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const b = await req.json();
    const newSlug = b.slug || params.slug;
    const [row] = await query(`
      UPDATE pages SET
        title=$1, slug=$2, content=$3, meta_description=$4,
        is_published=$5, show_in_nav=$6, updated_at=NOW()
      WHERE slug=$7 RETURNING *
    `, [b.title, newSlug, b.content, b.metaDescription ?? '',
        b.isPublished ?? false, b.showInNav ?? false, params.slug]);
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ page: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await query('DELETE FROM pages WHERE slug=$1', [params.slug]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
