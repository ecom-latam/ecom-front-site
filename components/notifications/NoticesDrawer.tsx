'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Drawer, Icon, Modal, Text } from 'zoui';
import type { IconName } from 'zoui';
import { timeAgo } from '@/lib/timeAgo';
import type { AppNotification } from '@/utils/api/push';
import PushOptIn from './PushOptIn';
import styles from './notifications.module.scss';

const CATEGORY_ICON: Record<string, IconName> = { orders: 'shopping-cart', payments: 'circle-check', stock: 'package', system: 'bell' };

// Una categoría que esta versión no conoce nunca debe romper la bandeja.
const iconOf = (category: string): IconName => CATEGORY_ICON[category] ?? 'bell';

interface Props {
  open: boolean;
  onClose: () => void;
  unread: number;
  items: AppNotification[] | null;
  hasMore: boolean;
  error: string;
  loadMore: () => void | Promise<void>;
  markRead: (id: string) => void | Promise<void>;
  markAllRead: () => void | Promise<void>;
  remove: (id: string) => void | Promise<void>;
  removeAll: () => void | Promise<void>;
}

// Bandeja de avisos de la persona en este sitio.
export default function NoticesDrawer({ open, onClose, unread, items, hasMore, error, loadMore, markRead, markAllRead, remove, removeAll }: Props) {
  const router = useRouter();
  const [confirmAll, setConfirmAll] = useState(false);

  function go(item: AppNotification) {
    if (!item.read) void markRead(item.id);
    onClose();
    router.push(item.url);
  }

  return (
    <Drawer open={open} onClose={onClose} label="Avisos" size="md">
      <Drawer.Header>Avisos</Drawer.Header>
      <Drawer.Body data-testid="notifications-drawer">
        <PushOptIn />
        {error && <Text variant="body-sm" color="danger" data-testid="notifications-error">{error}</Text>}
        {items !== null && items.length === 0 && (
          <div className={styles.empty} data-testid="notifications-empty">
            <Text variant="body-sm" color="secondary">Todavía no tenés avisos. Cuando haya un pedido nuevo o un pago aprobado, lo vas a ver acá.</Text>
          </div>
        )}
        <div className={styles.list}>
          {items?.map((item) => (
            <div key={item.id} className={styles.itemRow} data-testid="notification-item" data-read={item.read}>
              <button type="button" className={styles.item} onClick={() => go(item)} data-testid="notification-open">
                <span className={styles.dot} data-read={item.read} />
                <Icon name={iconOf(item.category)} size="sm" />
                <span className={styles.text}>
                  <Text variant={item.read ? 'body-sm' : 'label'}>{item.title}</Text>
                  {item.body && <Text variant="body-sm" color="secondary">{item.body}</Text>}
                  <Text variant="caption" color="muted">{timeAgo(item.createdAt)}</Text>
                </span>
              </button>
              <button type="button" className={styles.remove} onClick={() => void remove(item.id)} aria-label="Borrar este aviso" title="Borrar este aviso" data-testid="notification-delete">
                <Icon name="trash-2" size="sm" />
              </button>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className={styles.more}>
            <Button emphasis="outlined" size="sm" onClick={loadMore} data-testid="notifications-more">Ver más</Button>
          </div>
        )}
      </Drawer.Body>
      <Drawer.Footer>
        <Button emphasis="outlined" size="md" disabled={unread === 0} onClick={markAllRead} data-testid="notifications-read-all">Marcar todas como leídas</Button>
        <Button emphasis="outlined" size="md" disabled={!items || items.length === 0} onClick={() => setConfirmAll(true)} data-testid="notifications-delete-all">Borrar todas</Button>
      </Drawer.Footer>

      {confirmAll && (
        <Modal open size="sm" onClose={() => setConfirmAll(false)}>
          <Modal.Header>Borrar todos los avisos</Modal.Header>
          <Modal.Body>
            <Text variant="body-sm" color="secondary">Vas a borrar todos los avisos de este sitio, leídos y sin leer. No se puede deshacer.</Text>
          </Modal.Body>
          <Modal.Footer>
            <Button emphasis="filled" size="md" onClick={() => { setConfirmAll(false); void removeAll(); }} data-testid="notifications-confirm-delete-all">Borrar todas</Button>
            <Button emphasis="outlined" size="md" onClick={() => setConfirmAll(false)}>Cancelar</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Drawer>
  );
}
