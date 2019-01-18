import { handleRequest } from "./handlers";

addEventListener('fetch', (event: Event) => {
  if (event instanceof FetchEvent) {
    event.respondWith(handleRequest(event.request));
  }
});
