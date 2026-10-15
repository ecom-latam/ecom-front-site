import { createPageViewSettler, createTracker } from 'zoui/track';
import type { TrackProps, Tracker } from 'zoui/track';
import { getAccessTokenRole } from '@/utils/helpers';

const BFF_URL = process.env.NEXT_PUBLIC_BFF_URL ?? 'http://localhost:4000';
const SITE_BASE_DOMAIN = (process.env.NEXT_PUBLIC_SITE_BASE_DOMAIN ?? 'ecom.com').replace(/\./g, '\\.');
const STAFF_ROLES = ['Admin', 'Manager', 'Seller'];
const SKIPPED_PREFIXES = ['/vista-previa', '/gestion', '/iniciar-sesion', '/registro', '/unirse', '/invitacion', '/mi-cuenta', '/mis-pedidos', '/pedidos'];
const LANDED_KEY = 'ow_landed';

function slugFromHost(): string {
  const host = window.location.hostname;
  const prod = host.match(new RegExp(`^([^.]+)\\.${SITE_BASE_DOMAIN}$`));
  if (prod) return prod[1];
  return host.match(/^([^.]+)\.localhost$/)?.[1] ?? '';
}

export function isSkippedPath(path: string): boolean {
  return SKIPPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function excluded(): boolean {
  if (isSkippedPath(window.location.pathname)) return true;
  const role = getAccessTokenRole();
  return role !== null && STAFF_ROLES.includes(role);
}

function headers(): Record<string, string> {
  const out: Record<string, string> = { 'X-Tenant-Slug': slugFromHost() };
  const token = localStorage.getItem('access_token');
  if (token) out.Authorization = `Bearer ${token}`;
  return out;
}

let tracker: Tracker | null = null;

export function getTracker(): Tracker | null {
  if (typeof window === 'undefined') return null;
  if (!tracker) {
    tracker = createTracker({
      endpoint: `${BFF_URL}/api/events`,
      source: 'site',
      getHeaders: headers,
      isExcluded: excluded,
      fetchImpl: (url, init) => fetch(url, { ...init, credentials: 'include' }),
    });
  }
  return tracker;
}

// Primera página de la visita: se manda de dónde llegó la persona (solo el sitio, nunca la dirección completa).
function landingSource(): string | null {
  try {
    if (sessionStorage.getItem(LANDED_KEY)) return null;
    sessionStorage.setItem(LANDED_KEY, '1');
    const referrer = document.referrer;
    const host = referrer ? new URL(referrer).host : '';
    return host && host !== window.location.host ? host.replace(/^www\./, '') : 'directo';
  } catch {
    return null;
  }
}

let settler: ReturnType<typeof createPageViewSettler> | null = null;

// Espera a que la dirección se quede quieta antes de contar: al entrar al inicio el sitio redirige y la dirección cambia dos
// veces seguidas, que es una sola visita.
export function trackPageView(path: string): void {
  const current = getTracker();
  if (!current) return;
  if (!settler) {
    settler = createPageViewSettler({
      track: (name: string, props?: TrackProps) => {
        const source = landingSource();
        current.track(name, source ? { ...props, source } : props);
      },
    });
  }
  settler.update(path);
}

export function cancelPageView(): void {
  settler?.cancel();
}

export function trackProductView(product: { _id: string; categoryId: string | null; price: number; salePrice: number | null }): void {
  getTracker()?.track('product.viewed', { productId: product._id, category: product.categoryId, price: product.salePrice ?? product.price });
}

export function trackCartAdd(productId: string, quantity: number): void {
  getTracker()?.track('cart.item_added', { productId, quantity });
}
