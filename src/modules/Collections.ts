/// <reference path="./Collections.d.ts" />

export function read<T extends "text" | "arrayBuffer" | "stream">(
  uuid: string,
  type: T
) {
  return COLLECTIONS_KV.get(uuid, type);
}

export function write(
  uuid: string,
  content: string | ReadableStream<any> | ArrayBuffer
) {
  COLLECTIONS_KV.put(uuid, content);
}
