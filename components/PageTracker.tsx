'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

// Cuenta una visita cada vez que la persona cambia de página.
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent({ type: 'pageview', path: pathname });
  }, [pathname]);

  return null;
}
