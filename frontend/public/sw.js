// SmartFlow AI - Service Worker for PWA
const CACHE_NAME = 'smartflow-v2.0'
const STATIC_CACHE = 'smartflow-static-v2.0'

const PRECACHE_URLS = [
  '/',
  '/map',
  '/dashboard',
  '/compare',
  '/news',
  '/leaderboard',
  '/offline',
]

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(() => {})
    }).then(() => self.skipWaiting())
  )
})

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== STATIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('localhost:8000')) return // Don't cache API

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request).then(r => r || caches.match('/offline')))
  )
})

// Push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'SmartFlow Alert', {
      body: data.body || 'Traffic update available',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: '🗺 View Map' },
        { action: 'dismiss', title: '✕ Dismiss' }
      ]
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/map'))
  }
})
