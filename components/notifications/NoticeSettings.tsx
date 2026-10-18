'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Switch, Text } from 'zoui';
import { usePushDevice } from '@/hooks/usePushDevice';
import { push, type PushCategory } from '@/utils/api/push';
import styles from './notifications.module.scss';

const CATEGORIES: { key: PushCategory; label: string; hint: string }[] = [
  { key: 'orders', label: 'Pedidos', hint: 'Pedido nuevo y pedido pagado listo para enviar.' },
  { key: 'payments', label: 'Pagos', hint: 'Pago aprobado de un pedido con retiro en el local.' },
  { key: 'stock', label: 'Stock', hint: 'Producto con pocas unidades o sin stock.' },
];

const DEVICE_NOTE: Partial<Record<string, string>> = {
  unsupported: 'Este navegador no permite notificaciones push. Los avisos igual quedan en la campanita.',
  unavailable: 'Las notificaciones push no están disponibles por ahora. Los avisos igual quedan en la campanita.',
  denied: 'Bloqueaste las notificaciones de este sitio en el navegador. Para recibirlas, habilitalas desde el candado de la barra de direcciones.',
};

// Preferencias de avisos de la persona: notificaciones del navegador y qué categorías llegan.
export default function NoticeSettings() {
  const { state, busy, error, enable, disable } = usePushDevice();
  const [categories, setCategories] = useState<Record<PushCategory, boolean> | null>(null);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await push.preferences();
      setCategories(data.categories);
    } catch {
      setSaveError('No pudimos leer tus preferencias. Intentá de nuevo.');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(key: PushCategory, value: boolean) {
    if (!categories) return;
    const previous = categories;
    setCategories({ ...categories, [key]: value });
    setSaveError('');
    try {
      const { data } = await push.savePreferences({ [key]: value });
      setCategories(data.categories);
    } catch {
      setCategories(previous);
      setSaveError('No pudimos guardar el cambio. Intentá de nuevo.');
    }
  }

  return (
    <div className={styles.page} data-testid="notice-settings">
      <section className={styles.card}>
        <div>
          <div className={styles.title}>
            <Text variant="heading-3">Avisos</Text>
            <Badge tone={state === 'on' ? 'success' : 'neutral'} size="sm" data-testid="push-status">{state === 'on' ? 'Notificaciones push activas' : 'Notificaciones push apagadas'}</Badge>
          </div>
          <Text variant="body-sm" color="secondary">Los avisos de pedidos, pagos y stock quedan siempre guardados en la campanita. Con las notificaciones push, además te llegan al instante como un aviso en la pantalla de tu computadora, aunque estés en otra pestaña o en otra aplicación.</Text>
        </div>

        {state === 'on' || state === 'off' ? (
          <Switch checked={state === 'on'} disabled={busy} onCheckedChange={(value) => { void (value ? enable() : disable()); }} label="Notificaciones push en este navegador" data-testid="push-device-switch" />
        ) : (
          DEVICE_NOTE[state] && <Text variant="body-sm" color="secondary" data-testid="push-device-note">{DEVICE_NOTE[state]}</Text>
        )}
        {error && <Text variant="body-sm" color="danger" data-testid="push-error">{error}</Text>}

        {categories && (
          <div data-testid="push-categories">
            {CATEGORIES.map(({ key, label, hint }) => (
              <div key={key} className={styles.row}>
                <div className={styles.who}>
                  <Text variant="label">{label}</Text>
                  <Text variant="caption" color="muted">{hint}</Text>
                </div>
                <Switch checked={categories[key]} onCheckedChange={(value) => { void toggle(key, value); }} label="Recibir como push" data-testid={`push-category-${key}`} />
              </div>
            ))}
          </div>
        )}
        {saveError && <Text variant="body-sm" color="danger" data-testid="push-save-error">{saveError}</Text>}
      </section>
    </div>
  );
}
