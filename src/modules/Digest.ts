import { valueToUint8Array } from "./values";

function hex(view: DataView): string {
  var hexCodes = [];
  for (var i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    var value = view.getUint32(i)
    // toString(16) will give the hex representation of the number without padding
    var stringValue = value.toString(16)
    // We use concatenation and slice for padding
    var padding = '00000000'
    var paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue);
  }

  // Join all the hex strings into one
  return hexCodes.join("");
}

export async function sha256(value: string | Uint8Array | ReadableStream | null): Promise<string> {
  if (!value) {
    throw 'Digest must be passed valid data type';
  }

  const data: Uint8Array = await valueToUint8Array(value);
  return hex(new DataView(await crypto.subtle.digest("SHA-256", data)))
}