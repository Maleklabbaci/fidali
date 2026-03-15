// public/sw.js
self.addEventListener('push', function(event) {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard' },
    requireInteraction: true, // Reste visible jusqu'à action
    actions: [
      { action: 'open', title: '👁️ Voir' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Si l'app est déjà ouverte, focus et navigue
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Cache minimal pour PWA
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
