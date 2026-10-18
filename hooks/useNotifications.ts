'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { push, type AppNotification } from '@/utils/api/push';

const POLL_MS = 20 * 1000;

export function useNotifications(open: boolean, enabled: boolean) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const loadUnread = useCallback(async () => {
    try {
      const { data } = await push.unread();
      setUnread(data.unread);
    } catch {
      // la campanita no es crítica: si falla, el contador queda como estaba
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      const { data } = await push.list();
      setItems(data.data);
      setHasMore(data.hasMore);
      setError('');
    } catch {
      setError('No pudimos leer tus avisos. Intentá de nuevo.');
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadUnread();
    if (openRef.current) await loadList();
  }, [loadUnread, loadList]);

  useEffect(() => {
    if (!enabled) return;
    void loadUnread();
    const timer = setInterval(() => { void loadUnread(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'push-received') void refresh();
      if (event.data?.type === 'open-url' && typeof event.data.url === 'string' && event.data.url.startsWith('/')) router.push(event.data.url);
    };
    if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      if ('serviceWorker' in navigator) navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, [enabled, loadUnread, refresh, router]);

  useEffect(() => {
    if (open && enabled) void loadList();
  }, [open, enabled, loadList]);

  const loadMore = useCallback(async () => {
    const last = items?.[items.length - 1];
    if (!last) return;
    try {
      const { data } = await push.list(last.id);
      setItems((current) => [...(current ?? []), ...data.data]);
      setHasMore(data.hasMore);
    } catch {
      setError('No pudimos leer más avisos. Intentá de nuevo.');
    }
  }, [items]);

  const markRead = useCallback(async (id: string) => {
    setItems((current) => current?.map((item) => (item.id === id ? { ...item, read: true } : item)) ?? null);
    setUnread((count) => Math.max(0, count - 1));
    try {
      await push.markRead({ ids: [id] });
    } catch {
      void loadUnread();
    }
  }, [loadUnread]);

  const markAllRead = useCallback(async () => {
    setItems((current) => current?.map((item) => ({ ...item, read: true })) ?? null);
    setUnread(0);
    try {
      await push.markRead({ all: true });
    } catch {
      void loadUnread();
    }
  }, [loadUnread]);

  const remove = useCallback(async (id: string) => {
    const removed = items?.find((item) => item.id === id);
    setItems((current) => current?.filter((item) => item.id !== id) ?? null);
    if (removed && !removed.read) setUnread((count) => Math.max(0, count - 1));
    try {
      await push.remove(id);
    } catch {
      setError('No pudimos borrar el aviso. Intentá de nuevo.');
      void loadList();
      void loadUnread();
    }
  }, [items, loadList, loadUnread]);

  const removeAll = useCallback(async () => {
    setItems([]);
    setHasMore(false);
    setUnread(0);
    try {
      await push.clear();
    } catch {
      setError('No pudimos borrar los avisos. Intentá de nuevo.');
      void loadList();
      void loadUnread();
    }
  }, [loadList, loadUnread]);

  return { unread, items, hasMore, error, loadMore, markRead, markAllRead, remove, removeAll };
}
