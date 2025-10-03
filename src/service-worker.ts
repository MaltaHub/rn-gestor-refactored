/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>;
};

type PrecacheEntry = {
  url: string;
  revision?: string | null;
};

clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

setDefaultHandler(
  new NetworkFirst({
    cacheName: "default-network",
    networkTimeoutSeconds: 10,
  }),
);

registerRoute(
  ({ request }) => request.destination === "style" || request.destination === "script",
  new StaleWhileRevalidate({
    cacheName: "static-assets",
  }),
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/api"),
  new NetworkFirst({
    cacheName: "api",
    networkTimeoutSeconds: 10,
  }),
);

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

export {};
