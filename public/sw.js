// MoveIt PWA 서비스워커
// - 앱 셸을 캐시해 오프라인/재방문 시 빠르게 로드
// - 백엔드 API(/api), 외부 CDN/음원(교차 출처)은 가로채지 않음
const CACHE = "moveit-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/pwa-192.png",
  "/pwa-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // 일부 항목이 없어도 설치가 실패하지 않도록 개별 처리
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // 외부 출처(미디어파이프 CDN, 음원 서버 등)는 SW 가 관여하지 않음
  if (url.origin !== self.location.origin) return;
  // 백엔드 API(/api, /api-deezer)는 항상 네트워크 — 캐시하지 않음
  if (url.pathname.startsWith("/api")) return;

  // SPA 내비게이션: 네트워크 우선, 실패 시 캐시된 index.html 로 폴백(오프라인)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 정적 자산: 캐시 우선, 없으면 네트워크 후 런타임 캐시에 저장
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        })
    )
  );
});
