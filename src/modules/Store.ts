import { config } from "../config.secret";
import * as Digest from "./Digest";

const cacheTimeSecs = 60 * 60 * 24 * 7;

export async function readTextMarkdown(sha256: string) {
  const readURL = `${config.storage.baseURL}/1/storage/text/markdown/sha256/${sha256}`;
  return fetch(readURL, {
    cf: {
      cacheTtlByStatus: { "200-299": cacheTimeSecs, 404: 1, "500-599": 0 }
    }
  } as RequestInit);
}

export async function addTextMarkdown(value: string | ReadableStream | null) {
  const sha256 = await Digest.sha256(value) as string;
  const uploadURL = `${config.storage.baseURL}/1/storage/text/markdown/sha256/${sha256}`;
  console.log('uploadURL', uploadURL)
  const uploadReq = new Request(uploadURL, {
    method: "POST",
    headers: {
      "Content-Type": "text/markdown"
    },
    body: value
  });
  const uploadRes = await fetch(uploadReq);
  return uploadRes.statusText + ' ' + sha256;
}
