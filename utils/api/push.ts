import { apiClient } from './client';

export type PushCategory = 'orders' | 'payments' | 'stock';

// 'system' son los avisos de prueba: no son una categoría que se pueda apagar.
export type NoticeCategory = PushCategory | 'system';

export interface AppNotification {
  id: string;
  type: string;
  category: NoticeCategory;
  title: string;
  body: string;
  url: string;
  siteSlug: string | null;
  read: boolean;
  createdAt: string;
}

export interface PushSubscriptionBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  device?: string;
}

// Los avisos nunca interrumpen la navegación con un modal de error.
const quiet = { _skipModal: true };

export const push = {
  vapidKey: () => apiClient.get<{ publicKey: string | null }>('/api/push/vapid-key', quiet),

  list: (before?: string) =>
    apiClient.get<{ data: AppNotification[]; hasMore: boolean }>('/api/push/notifications', { ...quiet, params: before ? { before } : undefined }),

  unread: () => apiClient.get<{ unread: number }>('/api/push/notifications/unread-count', quiet),

  markRead: (body: { ids: string[] } | { all: true }) => apiClient.post<{ updated: number }>('/api/push/notifications/read', body, quiet),

  test: () => apiClient.post<{ queued: number }>('/api/push/test', {}, quiet),

  remove: (id: string) => apiClient.delete(`/api/push/notifications/${encodeURIComponent(id)}`, quiet),

  clear: () => apiClient.post<{ deleted: number }>('/api/push/notifications/clear', {}, quiet),

  subscribe: (body: PushSubscriptionBody) => apiClient.post('/api/push/subscriptions', body, quiet),

  unsubscribe: (endpoint: string) => apiClient.delete('/api/push/subscriptions', { ...quiet, data: { endpoint } }),

  status: (endpoint: string) => apiClient.get<{ subscribed: boolean; devices: number }>('/api/push/subscriptions/status', { ...quiet, params: { endpoint } }),

  preferences: () => apiClient.get<{ categories: Record<PushCategory, boolean> }>('/api/push/preferences', quiet),

  savePreferences: (categories: Partial<Record<PushCategory, boolean>>) =>
    apiClient.put<{ categories: Record<PushCategory, boolean> }>('/api/push/preferences', { categories }, quiet),
};
