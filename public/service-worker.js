// Install 이벤트
self.addEventListener("install", (e) => {
  console.log("[Service Worker] installed");
});

// Activate 이벤트
self.addEventListener("activate", (e) => {
  console.log("[Service Worker] activated", e);
});

// Fetch 이벤트
self.addEventListener("fetch", (e) => {
  console.log("[Service Worker] fetched resource " + e.request.url);
});
