import { NextRequest, NextResponse } from 'next/server';
import { authenticatedFetch, applyAuthResult } from '@/lib/auth/serverFetch';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const path = status ? `/api/tenants/admin?status=${encodeURIComponent(status)}` : '/api/tenants/admin';
  const result = await authenticatedFetch(req, path);
  const response = NextResponse.json(
    result.ok ? result.data : { error: result.error },
    { status: result.status }
  );
  applyAuthResult(result, response);
  return response;
}
