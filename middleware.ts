import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/iniciar-sesion', '/registro'];
const PROTECTED_ROUTES = ['/carrito', '/gestion'];

function extractSlug(req: NextRequest): string | null {
  const host = req.headers.get('host') ?? '';
  const prod = host.match(/^([^.]+)\.ecom\.com(:\d+)?$/);
  if (prod) return prod[1];
  const dev = host.match(/^([^.]+)\.localhost(:\d+)?$/);
  if (dev) return dev[1];
  if (process.env.NODE_ENV === 'development') {
    const storeParam = req.nextUrl.searchParams.get('store');
    if (storeParam) return storeParam;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('_auth');

  const slug = extractSlug(req);
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
