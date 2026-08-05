self.addEventListener('push', function (event) {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const title = payload.title || 'MoneySaver Alert'
    
    const options = {
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge.png',
      image: payload.image,
      vibrate: payload.vibration || [100, 50, 100],
      data: {
        url: payload.url || '/',
        ...(payload.data || {})
      },
      actions: payload.actions,
      tag: payload.tag,
      renotify: payload.renotify || false,
      requireInteraction: payload.priority === 'high',
    }

    event.waitUntil(self.registration.showNotification(title, options))
  } catch (err) {
    console.error('[Service Worker] Error parsing push payload', err)
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('MoneySaver', {
        body: event.data.text(),
        icon: '/icon-192x192.png',
      })
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  // Handle action buttons
  if (event.action) {
    console.log('[Service Worker] Action clicked:', event.action)
    // You could route to different URLs based on event.action if needed
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // If a window is already open, focus it and navigate
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url && 'focus' in client) {
          return client.focus().then(c => c.navigate(targetUrl))
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

self.addEventListener('notificationclose', function (event) {
  console.log('[Service Worker] Notification closed', event.notification.tag)
})
