const cacheName = "DefaultCompany-Local no traffic-0.1.6";
//caches.delete("DefaultCompany-Local no traffic-0.1.1");
const contentToCache = [
    "Build/Local.loader.js",
    "Build/Local.framework.js.unityweb",
    "Build/Local.data.unityweb",
    "Build/Local.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    //self.skipWaiting();
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        let response;
        
        // Try fetching from the network first
        try {
            response = await fetch(e.request);
            
            // Check if the response is valid (status code 200)
            if (!response || response.status !== 200) {
                throw new Error('Invalid response from network');
            }
            
            console.log(`[Service Worker] Fetching resource from network: ${e.request.url}`);
        } catch (error) {
            console.error('[Service Worker] Fetch error:', error);
            
            // If network request fails, try to get it from cache
            response = await caches.match(e.request);
            
            if (response) {
                console.log(`[Service Worker] Resource found in cache: ${e.request.url}`);
                return response;
            } else {
                console.log(`[Service Worker] Resource not found in cache. Failed to fetch from network: ${e.request.url}`);
                // Handle this case according to your requirements, e.g., return a custom offline page
            }
        }
        
        // Cache the response for future use
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        
        return response;
    })());
});

