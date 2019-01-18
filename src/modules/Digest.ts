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

export async function sha256(value: string | ReadableStream | null): Promise<string> {
  if (!value) {
    throw 'Digest must be passed valid data type';
  }

  let data: Uint8Array;

  const stream = value as ReadableStream;
  if (typeof stream.getReader === 'function') {
    let chunks: Array<number> = []
    const reader = (value as ReadableStream<number>).getReader()
    await reader.read().then(function next({ done, value }): ReadableStreamReadResult<number> | Promise<ReadableStreamReadResult<number>> {
      // Result objects contain two properties:
      // done  - true if the stream has already given you all its data.
      // value - some data. Always undefined when done is true.
      if (done) {
        return { done: true, value: 0 };
      }

      // value for fetch streams is a Uint8Array
      chunks.push(value);

      // Read some more, and call this function again
      return reader.read().then(next);
    });
    data = new Uint8Array(chunks);
  }
  else if (typeof value === 'string') {
    data = new TextEncoder().encode(value);
  }
  else {
    throw 'Digest must be passed valid data type';
  }

  console.log('sha data', data, crypto.subtle)

  console.log('crypto.subtle', crypto.subtle)

  return hex(new DataView(await crypto.subtle.digest("SHA-256", data)))
}