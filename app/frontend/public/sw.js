/**
 * sw.js — Service Worker TRACC View SNCF
 *
 * Stratégie : Cache-First pour tous les fichiers data/*.geojson (fichiers hachés)
 * Les noms hachés (ex: hev_2050.abc12345.geojson) ne changent jamais →
 * on peut les garder indéfiniment dans le cache.
 *
 * Le manifest.json est rechargé à chaque visite (Network-First) pour
 * détecter les nouveaux hashes au déploiement.
 */

const CACHE_VERSION = 'v1'
const DATA_CACHE    = `tracc-data-${CACHE_VERSION}`
const APP_CACHE     = `tracc-app-${CACHE_VERSION}`

// Ressources app à précacher à l'installation
const APP_SHELL = [
  self.registration.scope,
  `${self.registration.scope}manifest.json`,
]

// ─── Installation ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

// ─── Activation (nettoyage anciens caches) ────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== DATA_CACHE && k !== APP_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const path = url.pathname

  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return

  // GeoJSON hachés (contiennent un hash 8 chars avant .geojson) → Cache-First
  // Pattern : quelque-chose.xxxxxxxx.geojson
  const isHashedGeoJSON = /\.[0-9a-f]{8}\.geojson$/.test(path)
  if (isHashedGeoJSON) {
    event.respondWith(cacheFirst(event.request, DATA_CACHE))
    return
  }

  // manifest.json → Network-First (pour détecter nouveaux hashes)
  if (path.endsWith('/manifest.json')) {
    event.respondWith(networkFirst(event.request, APP_CACHE))
    return
  }

  // Tout le reste : stratégie par défaut (pas d'interception)
})

// ─── Stratégies ──────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    throw new Error(`Network failed and no cache for ${request.url}`)
  }
}
