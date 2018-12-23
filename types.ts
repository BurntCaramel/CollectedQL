interface FetchEvent extends Event {
  request: Request;

  respondWith(r: Promise<Response> | Response): Promise<Response>;
}
