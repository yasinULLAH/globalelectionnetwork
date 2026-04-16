import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query, queryOne } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const observer = await queryOne('SELECT * FROM observers WHERE id=$1', [params.id]);
    if (!observer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ observer });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const b = await req.json();
    const passwordHash = b.password
      ? createHash('sha256').update(b.password).digest('hex')
      : undefined;

    // Build dynamic update - only set password_hash if a new password is provided
    const fields: string[] = [
      'name=$1', 'email=$2', 'phone=$3', 'cnic=$4',
      'polling_station_name=$5', 'status=$6', 'username=$7', 'photo_url=$8',
    ];
    const values: unknown[] = [
      b.name, b.email, b.phone ?? null, b.cnic ?? null,
      b.pollingStationName ?? null, b.status ?? 'pending',
      b.username ?? null, b.photoUrl ?? null,
    ];
    if (passwordHash) {
      fields.push(`password_hash=$${values.length + 1}`);
      values.push(passwordHash);
    }
    values.push(params.id);
    const [row] = await query(
      `UPDATE observers SET ${fields.join(', ')} WHERE id=$${values.length} RETURNING *`,
      values
    );
    return NextResponse.json({ observer: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const [row] = await query(
      'UPDATE observers SET status=$1 WHERE id=$2 RETURNING *',
      [status, params.id]
    );
    return NextResponse.json({ observer: row });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await query('DELETE FROM observers WHERE id=$1', [params.id]);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
