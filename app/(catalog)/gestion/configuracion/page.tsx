'use client';

import { useState } from 'react';
import { Text, ColorWheel, useToast } from 'zoui';
import { apiClient } from '@/utils/api/client';

function getInitialHue(): number {
  if (typeof document === 'undefined') return 262;
  const style = getComputedStyle(document.documentElement);
  const brand500 = style.getPropertyValue('--color-brand-500').trim();
  const match = brand500.match(/hsl\((\d+)/);
  return match ? parseInt(match[1]) : 262;
}

function applyHueLive(hue: number) {
  const root = document.documentElement;
  const contrast = hue >= 45 && hue <= 75 ? '#000000' : '#ffffff';
  root.style.setProperty('--color-brand-50',       `hsl(${hue}, 95%, 97%)`);
  root.style.setProperty('--color-brand-100',      `hsl(${hue}, 90%, 93%)`);
  root.style.setProperty('--color-brand-200',      `hsl(${hue}, 85%, 86%)`);
  root.style.setProperty('--color-brand-300',      `hsl(${hue}, 80%, 75%)`);
  root.style.setProperty('--color-brand-400',      `hsl(${hue}, 75%, 62%)`);
  root.style.setProperty('--color-brand-500',      `hsl(${hue}, 72%, 50%)`);
  root.style.setProperty('--color-brand-600',      `hsl(${hue}, 75%, 42%)`);
  root.style.setProperty('--color-brand-700',      `hsl(${hue}, 80%, 34%)`);
  root.style.setProperty('--color-brand-contrast', contrast);
}

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [hue, setHue] = useState<number>(getInitialHue);
  const [saving, setSaving] = useState(false);

  function handleHueChange(newHue: number) {
    setHue(newHue);
    applyHueLive(newHue);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiClient.patch('/api/store/store/config/brand-hue', { brand_hue: hue });
      toast({ message: 'Color de marca guardado', type: 'success' });
    } catch {
      toast({ message: 'No se pudo guardar el color', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ padding: '32px', overflowY: 'auto' }}>
      <Text variant="heading-2" as="h1" style={{ marginBottom: '32px' }}>Configuración</Text>

      <div style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        maxWidth: '480px',
      }}>
        <Text variant="heading-3" as="h2" style={{ marginBottom: '4px' }}>Color de marca</Text>
        <Text variant="body-sm" color="secondary" as="p" style={{ marginBottom: '28px' }}>
          El color elegido se aplica en toda la tienda para todos los visitantes.
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <ColorWheel
            value={hue}
            onChange={handleHueChange}
            size={160}
            testId="store-color-wheel"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 'var(--control-height-md)',
              padding: '0 var(--control-padding-x-md)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-brand-500)',
              color: 'var(--color-brand-contrast)',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {saving ? 'Guardando…' : 'Guardar color'}
          </button>
        </div>
      </div>
    </main>
  );
}
