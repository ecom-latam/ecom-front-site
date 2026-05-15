import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

type Params = { params: Promise<{ userId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const { userId } = await params;
  const body = await req.json();

  const result = await authenticatedFetch(req, `/api/auth/collaborators/${userId}/role`, {
    method: 'PUT',
    headers: { 'X-Tenant-Slug': slug },
    body: JSON.stringify(body),
  });

  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const { userId } = await params;

  const result = await authenticatedFetch(req, `/api/auth/collaborators/${userId}`, {
    method: 'DELETE',
    headers: { 'X-Tenant-Slug': slug },
  });

  const response = NextResponse.json(
    result.ok ? (result.data ?? null) : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}
