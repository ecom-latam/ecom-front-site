import { IllustrationMessage } from 'zoui';
import { ILLUSTRATION_MESSAGES } from '@/lib/illustrationMessages';

// Unica fuente de este estado: modo mantenimiento manual (layout.tsx) y
// pagina sin bloques (InformationalHome, DynamicPage) renderizan lo mismo.
export function PageUnderConstruction() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IllustrationMessage {...ILLUSTRATION_MESSAGES['under-construction']} />
    </div>
  );
}
