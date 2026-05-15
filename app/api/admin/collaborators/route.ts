import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

export async function GET(req: NextRequest) {
  const slug = extractSlugFromRequest(req);
  if (!slug) return NextResponse.json({ error: 'MISSING_TENANT' }, { status: 400 });

  const result = await authenticatedFetch(req, '/api/auth/collaborators', {
    headers: { 'X-Tenant-Slug': slug },
  });

  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}
