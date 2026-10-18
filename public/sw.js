// Service worker de los avisos del navegador (EC-1526). Solo recibe pushes y abre el enlace del aviso.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// Guarda cuándo llegó el último push a este navegador, para que la página pueda mostrar si el mensaje llega aunque el sistema no lo muestre.
function rememberPush(info) {
  return new Promise((resolve) => {
    const open = indexedDB.open('notices', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('state');
    open.onerror = () => resolve();
    open.onsuccess = () => {
      const tx = open.result.transaction('state', 'readwrite');
      tx.objectStore('state').put(info, 'lastPush');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
  });
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = typeof data.title === 'string' && data.title ? data.title : 'Web Owlet';
  event.waitUntil((async () => {
    await rememberPush({ at: Date.now(), title });
    try {
      await self.registration.showNotification(title, {
        body: typeof data.body === 'string' ? data.body : '',
        icon: '/owlet-icon.png',
        tag: typeof data.id === 'string' ? data.id : undefined,
        data: { url: typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/gestion/pedidos' },
      });
    } finally {
      // Aunque el sistema no muestre la notificación, la campanita de la página abierta se actualiza.
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      windows.forEach((client) => client.postMessage({ type: 'push-received' }));
    }
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/gestion/pedidos';
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
    if (open) {
      await open.focus();
      open.postMessage({ type: 'open-url', url });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
