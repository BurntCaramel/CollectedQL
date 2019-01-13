// interface FetchEvent extends Event {
//     readonly request: Request;
//     respondWith(r: Promise<Response> | Response): Promise<Response>;
// }

interface FetchEvent extends ExtendableEvent {
  readonly clientId: string;
  readonly preloadResponse: Promise<any>;
  readonly request: Request;
  readonly resultingClientId: string;
  readonly targetClientId: string;
  respondWith(r: Promise<Response>): void;
}