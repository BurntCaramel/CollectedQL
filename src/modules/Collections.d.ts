declare const COLLECTIONS_KV: {
  get<T extends "text" | "arrayBuffer" | "stream">(
    key: string,
    type: T
  ): Promise<
    { text: string; arrayBuffer: ArrayBuffer; stream: ReadableStream }[T] | null
  >;

  put(key: string, content: string | ReadableStream<any> | ArrayBuffer): void;
  delete(key: string): void;
};
