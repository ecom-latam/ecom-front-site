import { DynamicPageRenderer } from 'zoui';
import type { SiteRegionContent } from '@/lib/api/storeClient';
import styles from './SiteRegion.module.scss';

// Encabezado o pie editable del sitio: el mismo contenido en todas las
// paginas. Sin bloques no dibuja nada.
export function SiteRegion({ region, name }: { region?: SiteRegionContent; name: 'header' | 'footer' }) {
  if (!region || region.blocks.length === 0) return null;
  return (
    <div data-testid={`site-${name}`} style={region.backgroundColor ? { background: region.backgroundColor } : undefined}>
      <div className={styles.content}>
        <DynamicPageRenderer blocks={region.blocks} />
      </div>
    </div>
  );
}
