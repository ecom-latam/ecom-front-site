'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Switch, Text } from 'zoui';
import { usePushDevice } from '@/hooks/usePushDevice';
import { push, type PushCategory } from '@/utils/api/push';
import styles from './notifications.module.scss';

const CATEGORIES: { key: PushCategory; label: string; hint: string }[] = [
  { key: 'orders', label: 'Pedidos', hint: 'Pedido nuevo y pedido pagado listo para enviar.' },
  { key: 'payments', label: 'Pagos', hint: 'Pago aprobado de un pedido con retiro en el local.' },
  { key: 'stock', label: 'Stock', hint: 'Producto con pocas unidades o sin stock.' },
];

interface LastPush { at: number; title: string }

const isLastPush = (value: unknown): value is LastPush => typeof value === 'object' && value !== null && 'at' in value && typeof value.at === 'number' && 'title' in value && typeof value.title === 'string';

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
  const [testMessage, setTestMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [lastPush, setLastPush] = useState<LastPush | null>(null);

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

  // Lee lo que guardó el service worker la última vez que le llegó un push.
  const readLastPush = useCallback(() => {
    const open = indexedDB.open('notices', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('state');
    open.onerror = () => setLastPush(null);
    open.onsuccess = () => {
      const get = open.result.transaction('state', 'readonly').objectStore('state').get('lastPush');
      get.onsuccess = () => {
        const value: unknown = get.result;
        setLastPush(isLastPush(value) ? value : null);
      };
      get.onerror = () => setLastPush(null);
    };
  }, []);

  useEffect(() => {
    readLastPush();
    const timer = setInterval(readLastPush, 3000);
    return () => clearInterval(timer);
  }, [readLastPush]);

  const permission = typeof Notification === 'undefined' ? 'no disponible' : Notification.permission === 'granted' ? 'permitido' : Notification.permission === 'denied' ? 'bloqueado' : 'sin decidir';

  // Muestra una notificación directamente desde este navegador, sin pasar por el servidor: sirve para saber si el sistema las muestra.
  async function showLocal() {
    setTestMessage('');
    setTesting(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        setTestMessage('Todavía no hay un service worker registrado en este navegador. Activá las notificaciones push primero.');
        return;
      }
      await registration.showNotification('Prueba en este navegador', { body: 'Si ves este aviso en tu pantalla, el sistema muestra las notificaciones.', icon: '/owlet-icon.png' });
      setTestMessage('Pedimos mostrar la notificación. Si no la ves en tu pantalla, el bloqueo está en tu sistema: en Mac, revisá Ajustes del Sistema → Notificaciones → tu navegador, y que no esté activo el modo Concentración.');
    } catch {
      setTestMessage('El navegador no pudo mostrar la notificación. Revisá el permiso del sitio en el candado de la barra de direcciones.');
    } finally {
      setTesting(false);
    }
  }

  // Manda un aviso real por todo el camino (servidor, servicio de push del navegador y vuelta).
  async function sendServer() {
    setTestMessage('');
    setTesting(true);
    try {
      const { data } = await push.test();
      setTestMessage(data.queued > 0 ? 'Mandamos un aviso de prueba. Debería llegarte en unos segundos como notificación y quedar en la campanita.' : 'Mandamos un aviso de prueba a la campanita, pero este navegador no está suscripto a las notificaciones push.');
    } catch {
      setTestMessage('No pudimos mandar el aviso de prueba. Intentá de nuevo.');
    } finally {
      setTesting(false);
    }
  }

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

        <div className={styles.diag} data-testid="push-diagnostic">
          <Text variant="label">Probar las notificaciones</Text>
          <Text variant="caption" color="muted">Permiso del navegador para este sitio: {permission}. Este navegador: {state === 'on' ? 'suscripto' : 'no suscripto'}.</Text>
          <Text variant="caption" color="muted" data-testid="push-last">{lastPush ? `Último push recibido por este navegador: ${new Date(lastPush.at).toLocaleTimeString('es-AR')} («${lastPush.title}»).` : 'Este navegador todavía no recibió ningún push.'}</Text>
          <div className={styles.testRow}>
            <Button emphasis="outlined" size="sm" disabled={testing || state !== 'on'} onClick={showLocal} data-testid="push-test-local">Mostrar una en este navegador</Button>
            <Button emphasis="outlined" size="sm" disabled={testing} onClick={sendServer} data-testid="push-test-server">Enviarme un aviso de prueba</Button>
          </div>
          {testMessage && <Text variant="body-sm" color="secondary" data-testid="push-test-message">{testMessage}</Text>}
        </div>

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
