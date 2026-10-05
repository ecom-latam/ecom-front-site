'use client';

import { DynamicPageRenderer } from 'zoui';
import type { PageContent, SiteLayoutContent } from '@/lib/api/storeClient';
import { PageUnderConstruction } from './PageUnderConstruction';
import { SiteRegion } from './SiteRegion';
import styles from './DynamicPage.module.scss';

// EC-587: pagina generica del page builder (cualquier slug que no sea
// 'home'). EC-695: migrado a DynamicPageRenderer (grilla plana).
// El encabezado y el pie del sitio se muestran solo en las paginas del editor,
// no en las pantallas de la tienda (catalogo, carrito, checkout, cuenta).
export function DynamicPage({ page, layout }: { page: PageContent; layout?: SiteLayoutContent }) {
  if (page.blocks.length === 0) {
    return <PageUnderConstruction />;
  }

  return (
    <>
      <SiteRegion region={layout?.header} name="header" />
      <main className={styles.root} style={{ background: 'var(--color-bg-surface)' }} data-mobile-ready>
        <div className={styles.content}>
          <DynamicPageRenderer
            blocks={page.blocks}
            mobileBlocks={page.mobileBlocks}
            showGrid={page.workInProgress}
          />
        </div>
      </main>
      <SiteRegion region={layout?.footer} name="footer" />
    </>
  );
}
