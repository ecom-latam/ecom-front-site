import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

export async function POST(req: NextRequest) {
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const body = await req.json();

  const result = await authenticatedFetch(req, '/api/auth/invitations', {
    method: 'POST',
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
