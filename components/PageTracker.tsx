'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

// Espera a que la dirección se quede quieta antes de contar: al entrar al inicio el sitio redirige a la página de inicio y
// la dirección cambia dos veces seguidas, que es una sola visita.
const SETTLE_MS = 700;

// Cuenta una visita cada vez que la persona cambia de página.
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => trackEvent({ type: 'pageview', path: pathname }), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
