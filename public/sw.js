const CACHE_NAME = "velto-pay-runtime-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/icons/") ||
      url.pathname.startsWith("/brand/") ||
      url.pathname === "/manifest.webmanifest");

  if (request.method !== "GET" || !isStaticAsset) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();

        if (response.ok && request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);

        return cachedResponse ?? Response.error();
      }),
  );
});

function getNotificationPayload(event) {
  if (!event.data) {
    return {
      badge: "/icons/icon-192.png",
      body: "Você tem uma nova atualização na Velto Pay.",
      data: {
        route: "/dashboard",
      },
      icon: "/icons/icon-192.png",
      title: "Velto Pay",
    };
  }

  try {
    return event.data.json();
  } catch {
    return {
      badge: "/icons/icon-192.png",
      body: event.data.text(),
      data: {
        route: "/dashboard",
      },
      icon: "/icons/icon-192.png",
      title: "Velto Pay",
    };
  }
}

function normalizeRoute(route) {
  if (typeof route !== "string" || !route.startsWith("/")) {
    return "/dashboard";
  }

  return route;
}

self.addEventListener("push", (event) => {
  const payload = getNotificationPayload(event);
  const title = payload.title || "Velto Pay";
  const options = {
    badge: payload.badge || "/icons/icon-192.png",
    body: payload.body || "Você tem uma nova atualização na Velto Pay.",
    data: {
      notificationId: payload.data?.notificationId,
      route: normalizeRoute(payload.data?.route),
    },
    icon: payload.icon || "/icons/icon-192.png",
    requireInteraction: false,
    tag: payload.tag || "velto-pay-notification",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const route = normalizeRoute(event.notification.data?.route);
  const targetUrl = new URL(route, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clientList) => {
        const sameOriginClient = clientList.find((client) => {
          return new URL(client.url).origin === self.location.origin;
        });

        if (sameOriginClient) {
          return sameOriginClient.focus().then((client) => {
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }

            return client;
          });
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
