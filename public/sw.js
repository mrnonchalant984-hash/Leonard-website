self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "LeonardX";
  const options = { body: data.body || "You have a new LeonardX notification.", icon: "/favicon.ico", badge: "/favicon.ico", data: { url: data.url || "/notifications" } };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/notifications";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) { if ("focus" in client) { client.navigate(url); return client.focus(); } }
    return clients.openWindow(url);
  }));
});
