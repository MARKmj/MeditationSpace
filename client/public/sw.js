// 静心空间 - Service Worker
// 用于缓存静态资源和提供离线支持

const CACHE_NAME = 'meditation-space-v1';
const STATIC_CACHE_NAME = 'meditation-static-v1';
const DYNAMIC_CACHE_NAME = 'meditation-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // 静态资源会由 Vite 自动处理
];

// 音频文件缓存策略
const AUDIO_CACHE_PREFIX = 'meditation-audio-';

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker: 安装中...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 缓存静态资源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker: 激活中...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('meditation-')) {
              console.log('Service Worker: 删除旧缓存', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 网络请求拦截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return;
  }

  // 音频文件缓存策略：缓存优先，网络回退
  if (request.url.includes('/sounds/') || request.url.includes('/audio/')) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }

          // 音频文件不在缓存中，从网络获取并缓存
          return fetch(request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // 网络失败，返回默认音频或错误提示
              return new Response('音频文件加载失败', {
                status: 408,
                statusText: 'Request Timeout'
              });
            });
        })
    );
    return;
  }

  // 静态资源缓存策略：缓存优先
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // API 请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // API 请求失败，返回缓存的响应或离线提示
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }

              // 返回离线提示响应
              return new Response(
                JSON.stringify({
                  error: '网络连接失败，请检查网络设置',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // HTML 页面：缓存优先
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }

          return fetch(request)
            .then((response) => {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
              return response;
            })
            .catch(() => {
              // 网络失败，返回缓存的首页
              return caches.match('/');
            });
        })
    );
    return;
  }

  // 其他请求：直接发送
  event.respondWith(fetch(request));
});

// 后台同步事件（用于离线时同步数据）
self.addEventListener('sync', (event) => {
  if (event.tag === 'meditation-records') {
    event.waitUntil(syncMeditationRecords());
  }
});

// 同步冥想记录
async function syncMeditationRecords() {
  try {
    const offlineRecords = localStorage.getItem('offlineMeditationRecords');
    if (!offlineRecords) return;

    const records = JSON.parse(offlineRecords);

    // 这里可以发送到服务器
    console.log('同步离线冥想记录:', records);

    // 清除离线记录
    localStorage.removeItem('offlineMeditationRecords');
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 推送事件
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: '开始冥想',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('静心空间提醒', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/timer')
    );
  } else if (event.action === 'close') {
    // 关闭通知
  } else {
    // 默认操作：打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: 已加载');