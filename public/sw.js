const CACHE_NAME = 'roma-showroom-v1';
const API_CACHE_NAME = 'roma-api-v1';
const STATIC_CACHE_NAME = 'roma-static-v1';

// Archivos que se cachean al instalar
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json',
  '/outlet.png',
  '/showroom.png',
  '/hoja.png',
  '/corpino.png',
  '/masroma.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  
  // Forzar la activación inmediata
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos cacheados');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Error cacheando archivos:', error);
      })
  );
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  
  // Tomar control de todas las páginas abiertas
  event.waitUntil(clients.claim());
  
  // Eliminar caches antiguos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== STATIC_CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, fallback a cache
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Ignorar peticiones a Firebase y otros dominios externos
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('firebaseio.com') && 
      !event.request.url.includes('googleapis.com') && 
      !event.request.url.includes('unsplash.com')) {
    return;
  }
  
  // Estrategia para APIs de Firebase (datos dinámicos)
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clonar la respuesta para cachearla
          const responseClone = response.clone();
          caches.open(API_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar con cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay cache, devolver un error amigable
            return new Response(JSON.stringify({ 
              error: 'Sin conexión', 
              offline: true 
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }
  
  // Estrategia para imágenes de Unsplash (cache first)
  if (event.request.url.includes('unsplash.com')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Estrategia para archivos estáticos (HTML, CSS, JS) - Cache First
  if (event.request.url.includes('/assets/') || 
      event.request.url.endsWith('.js') || 
      event.request.url.endsWith('.css') ||
      event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Para todo lo demás (incluyendo la app) - Network First
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si es una navegación, devolver la página principal
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Sin conexión', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Sincronización en segundo plano (para cuando vuelva la conexión)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-questions') {
    event.waitUntil(syncQuestions());
  }
});

// Push notifications (preparado para futuro)
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('+Roma', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Función para sincronizar preguntas pendientes
async function syncQuestions() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const pendingQuestions = await cache.match('/pending-questions');
    
    if (pendingQuestions) {
      const questions = await pendingQuestions.json();
      // Aquí se enviarían las preguntas pendientes
      console.log('Sincronizando preguntas:', questions);
      await cache.delete('/pending-questions');
    }
  } catch (error) {
    console.error('Error en sincronización:', error);
  }
}

// Actualización automática
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
