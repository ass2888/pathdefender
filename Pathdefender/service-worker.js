// Define a cache name, good practice to version it
const CACHE_NAME = 'path-defender-cache-v1'; 

// List of all files to cache (make sure these paths are correct relative to the service worker file)
const urlsToCache = [
    '/', // Caches the root URL (index.html)
    '/index.html', // Explicitly cache index.html
    // If you have a separate CSS file, add it here:
    // '/style.css', 
    // If you have game logic in a separate JS file, add it here:
    // '/game.js', 
    // Add paths to your icon files
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Add any other critical assets (e.g., images, sound files if they were external)
    'https://cdn.tailwindcss.com', // Cache Tailwind CSS CDN
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap', // Cache Google Fonts CSS
    // You might need to cache the font files themselves if you want full offline support for fonts
    // e.g., '/fonts/Inter-Regular.woff2', etc. (if you host them locally)
];

// Install event: This is triggered when the service worker is first installed.
// It's used to populate the cache with essential assets.
self.addEventListener('install', event => {
    console.log('Service Worker: Install event triggered.');
    event.waitUntil(
        caches.open(CACHE_NAME) // Open the cache
            .then(cache => {
                console.log('Service Worker: Caching app shell assets.');
                return cache.addAll(urlsToCache); // Add all specified URLs to the cache
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache during install:', error);
            })
    );
});

// Fetch event: This is triggered every time the browser requests a resource.
// It intercepts network requests and serves cached content when available.
self.addEventListener('fetch', event => {
    // Only handle HTTP/HTTPS requests, ignore chrome-extension:// etc.
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request) // Try to find the request in the cache
            .then(response => {
                // If a cached response is found, return it
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // If not in cache, fetch from the network
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed:', error);
                // You could return a fallback page here for offline users
                // return caches.match('/offline.html');
            })
    );
});

// Activate event: This is triggered when the service worker becomes active.
// It's often used to clean up old caches.
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate event triggered.');
    const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache version

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches that are not in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

