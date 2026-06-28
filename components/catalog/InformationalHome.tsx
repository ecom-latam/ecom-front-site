'use client';

import { DynamicPageRenderer } from 'zoui';
import type { PageInfo } from '@/lib/api/storeClient';
import { PageUnderConstruction } from './PageUnderConstruction';

// EC-559/EC-589: home de tiendas tipo "informativa" (sin catalogo) --
// renderiza el branding + los bloques de contenido generico de ecom-page.
// EC-695: migrado a DynamicPageRenderer (grilla plana, reemplaza PageRow).
// 'use client' necesario porque DynamicPageRenderer es Client Component.
export function InformationalHome({ storeInfo }: { storeInfo: PageInfo }) {
  // EC-658: la home se identifica por isHome: true, no por slug === 'home'.
  const homePage = storeInfo.pages?.find((p) => p.isHome);
  const blocks = homePage?.blocks ?? [];

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-bg-surface)' }}>
      <div className="p-4">
        {blocks.length > 0
          ? <DynamicPageRenderer blocks={blocks} showGrid={homePage?.workInProgress} />
          : <PageUnderConstruction />
        }
      </div>
    </main>
  );
}
