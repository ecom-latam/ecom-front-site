'use client';

import { useCallback, useEffect, useState } from 'react';
import { push } from '@/utils/api/push';

// unsupported: el navegador no sabe de push. unavailable: el servidor no lo tiene activo. denied: la persona lo bloqueó.
export type PushDeviceState = 'loading' | 'unsupported' | 'unavailable' | 'denied' | 'off' | 'on';

const supported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function describeDevice(): string {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} en ${os}` : browser;
}

export function usePushDevice() {
  const [state, setState] = useState<PushDeviceState>('loading');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!supported()) {
      setState('unsupported');
      return;
    }
    try {
      const { data } = await push.vapidKey();
      setPublicKey(data.publicKey);
      if (!data.publicKey) {
        setState('unavailable');
        return;
      }
      if (Notification.permission === 'denied') {
        setState('denied');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription || Notification.permission !== 'granted') {
        setState('off');
        return;
      }
      const { data: status } = await push.status(subscription.endpoint);
      if (!status.subscribed) {
        const json = subscription.toJSON();
        if (json.keys?.p256dh && json.keys.auth) await push.subscribe({ endpoint: subscription.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, device: describeDevice() });
      }
      setState('on');
    } catch {
      setState('off');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (!publicKey) return;
    setBusy(true);
    setError('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'off');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const subscription = (await registration.pushManager.getSubscription()) ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: publicKey }));
      const json = subscription.toJSON();
      if (!json.keys?.p256dh || !json.keys.auth) throw new Error('suscripción incompleta');
      await push.subscribe({ endpoint: subscription.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth }, device: describeDevice() });
      setState('on');
    } catch {
      setError('No pudimos activar los avisos en este navegador. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  }, [publicKey]);

  const disable = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await push.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState('off');
    } catch {
      setError('No pudimos desactivar los avisos. Intentá de nuevo.');
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, error, enable, disable };
}
