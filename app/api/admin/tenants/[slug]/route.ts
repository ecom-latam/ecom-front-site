import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';

type RouteContext = { params: Promise<{ slug: string }> };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const body = await req.json();
  const result = await authenticatedFetch(req, `/api/tenants/admin/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}
