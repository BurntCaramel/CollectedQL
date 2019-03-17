import { valueToUint8Array } from "./values";
import { dataToHex } from "../encode";

export async function sha256(value: string | Uint8Array | ReadableStream | null): Promise<string> {
  if (!value) {
    throw 'Digest must be passed valid data type';
  }

  const data: Uint8Array = await valueToUint8Array(value);
  return dataToHex(new DataView(await crypto.subtle.digest("SHA-256", data)))
}