import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';

type RouteContext = { params: Promise<{ name: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { name } = await params;
  const result = await authenticatedFetch(req, `/api/config/${name}`);
  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const { name } = await params;
  const body = await req.json();
  const result = await authenticatedFetch(req, `/api/config/${name}`, {
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
