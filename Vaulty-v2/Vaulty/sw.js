const CACHE='vaulty-v1';
const ASSETS=['./','./index.html','./css/styles.css','./js/app.js','./js/data.js','./js/utils.js','./assets/images/logo-vaulty.png','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request))));
