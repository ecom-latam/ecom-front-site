import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

const BFF_URL = process.env.BFF_URL ?? 'http://localhost:4000';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const accessToken = req.cookies.get('access_token')?.value;
  if (!accessToken) {
    const res = NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    clearAuthCookies(res);
    return res;
  }

  const formData = await req.formData();

  const upstreamForm = new FormData();
  formData.forEach((value, key) => upstreamForm.append(key, value));

  const upstream = await fetch(`${BFF_URL}/api/product/products/${id}/images`, {
    method: 'POST',
    headers: {
      'X-Tenant-Slug': slug,
      Authorization: `Bearer ${accessToken}`,
    },
    body: upstreamForm,
  });

  const data = upstream.status === 204 ? null : await upstream.json();
  const response = NextResponse.json(
    upstream.ok ? data : { error: (data as { error?: string })?.error ?? 'REQUEST_FAILED' },
    { status: upstream.status }
  );

  if (upstream.status === 401) clearAuthCookies(response);
  return response;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const body = await req.json();

  const result = await authenticatedFetch(req, `/api/product/products/${id}/images/order`, {
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

  const body = await req.json();

  const result = await authenticatedFetch(req, `/api/product/products/${id}/images`, {
    method: 'DELETE',
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

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const body = await req.json();

  const result = await authenticatedFetch(req, `/api/product/products/${id}/images/main`, {
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
