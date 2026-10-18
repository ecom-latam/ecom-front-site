'use client';

import { useRouter } from 'next/navigation';
import { Button, Drawer, Icon, Text } from 'zoui';
import type { IconName } from 'zoui';
import { timeAgo } from '@/lib/timeAgo';
import type { AppNotification, PushCategory } from '@/utils/api/push';
import PushOptIn from './PushOptIn';
import styles from './notifications.module.scss';

const CATEGORY_ICON: Record<PushCategory, IconName> = { orders: 'shopping-cart', payments: 'circle-check', stock: 'package' };

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
}

// Bandeja de avisos de la persona en este sitio.
export default function NoticesDrawer({ open, onClose, unread, items, hasMore, error, loadMore, markRead, markAllRead }: Props) {
  const router = useRouter();

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
            <button key={item.id} type="button" className={styles.item} onClick={() => go(item)} data-testid="notification-item" data-read={item.read}>
              <span className={styles.dot} data-read={item.read} />
              <Icon name={CATEGORY_ICON[item.category]} size="sm" />
              <span className={styles.text}>
                <Text variant={item.read ? 'body-sm' : 'label'}>{item.title}</Text>
                {item.body && <Text variant="body-sm" color="secondary">{item.body}</Text>}
                <Text variant="caption" color="muted">{timeAgo(item.createdAt)}</Text>
              </span>
            </button>
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
      </Drawer.Footer>
    </Drawer>
  );
}
