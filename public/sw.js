// Service Worker for Andrew Cares Village
// Provides offline functionality and caching across all pages

const CACHE_NAME = 'andrew-cares-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/',
    '/home.html',
    '/mentorship.html',
    '/mentorship-instructor.html',
    '/admin.html',
    '/offline.html',
    // CSS and JS files
    '/css/styles.css',
    'js/config.js',
    'js/error-handler.js',
    // Firebase SDKs (cached from CDN)
    'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js',
    'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js',
    'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js',
    // External libraries
    'https://cdn.quilljs.com/1.3.6/quill.snow.css',
    'https://cdn.quilljs.com/1.3.6/quill.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache static resources
self.addEventListener('install', event => {
    console.log('🔧 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Caching static resources');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('✅ Service Worker installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle network requests with caching strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip Firebase API calls (let them handle their own caching)
    if (event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('firebase.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('📋 Serving from cache:', event.request.url);
                    return response;
                }

                // Try network request
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache successful responses
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed, try to serve offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        
                        // For other requests, return a basic offline response
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync for queued actions
self.addEventListener('sync', event => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(processQueuedActions());
    }
});

// Process queued actions when connection is restored
async function processQueuedActions() {
    try {
        const queuedActions = await getQueuedActions();
        
        for (const action of queuedActions) {
            try {
                await processAction(action);
                await removeQueuedAction(action.id);
                console.log('✅ Processed queued action:', action.type);
            } catch (error) {
                console.error('❌ Failed to process queued action:', error);
            }
        }
    } catch (error) {
        console.error('❌ Background sync failed:', error);
    }
}

// Helper functions for queued actions
async function getQueuedActions() {
    // This would integrate with IndexedDB or localStorage
    return JSON.parse(localStorage.getItem('queuedActions') || '[]');
}

async function processAction(action) {
    // Process different types of queued actions
    switch (action.type) {
        case 'message':
            return sendQueuedMessage(action.data);
        case 'booking':
            return submitQueuedBooking(action.data);
        case 'review':
            return submitQueuedReview(action.data);
        default:
            console.warn('Unknown action type:', action.type);
    }
}

async function removeQueuedAction(actionId) {
    const actions = JSON.parse(localStorage.getItem('queuedActions') || '[]');
    const filtered = actions.filter(action => action.id !== actionId);
    localStorage.setItem('queuedActions', JSON.stringify(filtered));
}

// Placeholder functions for actual API calls
async function sendQueuedMessage(data) {
    // Would make actual Firebase call here
    console.log('Sending queued message:', data);
}

async function submitQueuedBooking(data) {
    // Would make actual Firebase call here
    console.log('Submitting queued booking:', data);
}

async function submitQueuedReview(data) {
    // Would make actual Firebase call here
    console.log('Submitting queued review:', data);
}
