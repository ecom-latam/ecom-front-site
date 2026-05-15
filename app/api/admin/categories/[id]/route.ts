import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const result = await authenticatedFetch(req, `/api/product/categories/${id}`, {
    headers: { 'X-Tenant-Slug': slug },
  });

  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const body = await req.json();
  const result = await authenticatedFetch(req, `/api/product/categories/${id}`, {
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

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const result = await authenticatedFetch(req, `/api/product/categories/${id}`, {
    method: 'DELETE',
    headers: { 'X-Tenant-Slug': slug },
  });

  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}
