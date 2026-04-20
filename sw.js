// TrackLift Service Worker – Offline-first caching
var CACHE = 'tracklift-v2';

var BASE = self.registration.scope;
var ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icons/icon.svg',
  BASE + 'js/store.js',
  BASE + 'js/exercises-db.js',
  BASE + 'js/plans-db.js',
  BASE + 'js/utils.js',
  BASE + 'js/dashboard.js',
  BASE + 'js/plans.js',
  BASE + 'js/workout.js',
  BASE + 'js/exercises.js',
  BASE + 'js/progress.js',
  BASE + 'js/body.js',
  BASE + 'js/app.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

// Install: cache all local assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      // Cache local assets (ignore CDN failures gracefully)
      var localAssets = ASSETS.filter(function(a) { return a.startsWith('/'); });
      return cache.addAll(localAssets).catch(function(err) {
        console.warn('Cache install partial:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: cache-first for local, network-first for CDN
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  // CDN resources: network-first, fall back to cache
  if (url.includes('cdn.tailwindcss.com') || url.includes('cdn.jsdelivr.net')) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Local files: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return res;
      });
    })
  );
});
