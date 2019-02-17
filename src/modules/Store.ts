import { config } from "../config.secret";
import * as Digest from "./Digest";
import { valueToUint8ArrayOrString } from "./values";

const duration7days = 60 * 60 * 24 * 7;
const cacheTimeSecs = duration7days;

type MediaType = "text/markdown" | "text/x.graphql.schema";

function readURLFor(mediaType: MediaType, sha256: string): string {
  return `${config.storage.baseURL}/1/storage/${mediaType}/sha256/${sha256}`;
}

function writeURLFor(mediaType: MediaType, sha256: string): string {
  return readURLFor(mediaType, sha256);
}

export async function readTextMarkdown(sha256: string) {
  const readURL = readURLFor("text/markdown", sha256);
  return fetch(readURL, {
    cf: {
      cacheTtl: cacheTimeSecs,
      // cacheTtlByStatus: { "200-299": cacheTimeSecs, 404: 1, "500-599": 0 }
    }
  } as RequestInit);
}

export async function addTextMarkdown(value: string | Uint8Array | ReadableStream | null) {
  if (value == null) {
    throw new Error('Cannot add null');
  }

  const dataOrString = await valueToUint8ArrayOrString(value);
  const sha256 = await Digest.sha256(dataOrString) as string;
  const uploadURL = writeURLFor("text/markdown", sha256);
  console.log('uploadURL', uploadURL)
  const uploadReq = new Request(uploadURL, {
    method: "POST",
    headers: {
      "Content-Type": "text/markdown"
    },
    body: dataOrString
  });
  const uploadRes = await fetch(uploadReq);
  if (uploadRes.ok) {
    return sha256;
  }

  throw "Could not upload to store";
}

export async function readTextGraphQLSchema(sha256: string) {
  const readURL = readURLFor("text/x.graphql.schema", sha256);
  return fetch(readURL, {
    cf: {
      cacheTtl: cacheTimeSecs,
      // cacheTtlByStatus: { "200-299": cacheTimeSecs, 404: 1, "500-599": 0 }
    }
  } as RequestInit);
}

export async function addTextGraphQLSchema(value: string | Uint8Array | ReadableStream | null) {
  if (value == null) {
    throw new Error('Cannot add null');
  }

  const dataOrString = await valueToUint8ArrayOrString(value);
  const sha256 = await Digest.sha256(dataOrString) as string;
  const uploadURL = writeURLFor("text/x.graphql.schema", sha256);
  console.log('uploadURL', uploadURL)
  const uploadReq = new Request(uploadURL, {
    method: "POST",
    headers: {
      "Content-Type": "text/x.graphql.schema"
    },
    body: dataOrString
  });
  const uploadRes = await fetch(uploadReq);
  if (uploadRes.ok) {
    return sha256;
  }

  throw "Could not upload to store";
}
