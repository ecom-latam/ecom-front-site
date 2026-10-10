'use client';

import { useEffect, useState } from 'react';
import { DynamicPageRenderer } from 'zoui';
import type { PageBlock } from 'zoui';

// `data-render-ready` avisa al servicio de capturas que las fuentes y las imagenes ya cargaron: recien ahi se saca la foto.
export function DraftPreview({ blocks }: { blocks: PageBlock[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const images = Array.from(document.images).map((image) => (image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    })));
    Promise.all([document.fonts?.ready, ...images]).catch(() => undefined).then(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  return (
    <main style={{ background: 'var(--color-bg-surface)', minHeight: '100vh' }} data-mobile-ready data-custom-page data-render-ready={ready ? 'true' : 'false'} data-testid="draft-preview">
      <DynamicPageRenderer blocks={blocks} showGrid={false} />
    </main>
  );
}
