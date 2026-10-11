import { NextRequest, NextResponse } from 'next/server';
import { applyClientReset, fetchPlatform, httpsRedirect, maintenanceResponse, resetPending } from 'zoui/platform-server';
import { extractSlugFromRequest } from '@/lib/tenant/extractSlug';

const AUTH_ROUTES = ['/iniciar-sesion', '/registro'];
const PROTECTED_ROUTES = ['/carrito', '/gestion'];

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000';

export async function proxy(req: NextRequest) {
  const secure = httpsRedirect(req.nextUrl, req.headers);
  if (secure) return secure;
  const platform = await fetchPlatform(BFF_URL);
  if (!platform.sitesOnline || !platform.appOnline) return maintenanceResponse('sites');
  const reset = resetPending(req.headers.get('cookie'), platform.resetEpoch);
  if (reset) req.cookies.delete('_auth');
  const response = route(req);
  return reset ? applyClientReset(response, platform.resetEpoch) : response;
}

function route(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('_auth');

  const slug = extractSlugFromRequest(req);
  if (!slug) {
    return NextResponse.rewrite(new URL('/not-found', req.url));
  }

  const headers = new Headers(req.headers);
  headers.set('x-store-slug', slug);

  if (AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next({ request: { headers } });
  }

  if (PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    if (!hasSession) {
      const loginUrl = new URL('/iniciar-sesion', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
