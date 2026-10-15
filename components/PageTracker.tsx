'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cancelPageView, isSkippedPath, trackPageView } from '@/lib/analytics';

// Cuenta una visita cada vez que la persona cambia de página.
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSkippedPath(pathname)) trackPageView(pathname);
    return cancelPageView;
  }, [pathname]);

  return null;
}
