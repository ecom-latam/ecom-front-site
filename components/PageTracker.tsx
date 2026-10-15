'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cancelPageView, isSkippedPath, trackContactClick, trackPageView } from '@/lib/analytics';

// Cuenta una visita cada vez que la persona cambia de página.
export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isSkippedPath(pathname)) trackPageView(pathname);
    return cancelPageView;
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (link) trackContactClick(link.getAttribute('href') ?? '');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
