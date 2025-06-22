const CACHE_NAME = 'endless-dating-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 설치 시 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('❌ 캐시 실패:', err))
  );
});

// fetch 요청 가로채기
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ JS 파일은 절대 캐시하지 않음 (흰 화면 방지 핵심)
  if (req.destination === 'script' || url.pathname.endsWith('.js')) {
    return; // 브라우저에 맡김 (network fetch)
  }

  event.respondWith(
    caches.match(req).then((response) => {
      return response || fetch(req);
    })
  );
});
