self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data?.json?.() || {}; } catch {}
  const title = data.title || 'tutlabs';
  const body = data.body || 'You have a new message';
  const options = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.url || '/'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(clients.openWindow(url));
});
