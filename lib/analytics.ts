import { apiClient } from '@/utils/api/client';
import { getAccessTokenRole } from '@/utils/helpers';

const STAFF_ROLES = ['Admin', 'Manager', 'Seller'];
const SKIPPED_PREFIXES = ['/vista-previa', '/gestion', '/iniciar-sesion', '/registro', '/unirse', '/invitacion', '/mi-cuenta', '/mis-pedidos', '/pedidos'];
const LANDED_KEY = 'ow_landed';

export type TrackEvent =
  | { type: 'pageview'; path: string }
  | { type: 'product_view'; productId: string }
  | { type: 'cart_add'; productId: string };

// El navegador pide que no lo sigan (No rastrear / Control Global de Privacidad): no se cuenta nada.
function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === '1' || nav.globalPrivacyControl === true;
}

export function shouldTrack(path: string): boolean {
  if (typeof window === 'undefined' || optedOut()) return false;
  if (SKIPPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return false;
  const role = getAccessTokenRole();
  return !(role !== null && STAFF_ROLES.includes(role));
}

// Primera página de la visita: se manda de dónde llegó la persona (solo el sitio, nunca la dirección completa).
function landing(): { landing: true; referrer: string } | { landing?: undefined } {
  try {
    if (sessionStorage.getItem(LANDED_KEY)) return {};
    sessionStorage.setItem(LANDED_KEY, '1');
    const referrer = document.referrer;
    return { landing: true, referrer: referrer && new URL(referrer).host !== window.location.host ? referrer : '' };
  } catch {
    return {};
  }
}

// Estadísticas del sitio: cuenta visitas, vistas de producto y agregados al carrito. Nunca interrumpe la página.
export function trackEvent(event: TrackEvent): void {
  const path = event.type === 'pageview' ? event.path : window.location.pathname;
  if (!shouldTrack(path)) return;
  const body = event.type === 'pageview' ? { ...event, ...landing() } : event;
  apiClient.post('/api/track', body, { _skipModal: true }).catch(() => undefined);
}
