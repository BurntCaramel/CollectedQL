export async function valueToUint8ArrayOrString(value: string | Uint8Array | ReadableStream | Response): Promise<string | Uint8Array> {
  const response = value as Response
  if (typeof response.status === 'number') {
    value = response.body as ReadableStream<any>;
  }

  const stream = value as ReadableStream;
  if (typeof stream.getReader === 'function') {
    let chunks: Array<Uint8Array> = []
    const reader = (value as ReadableStream<Uint8Array>).getReader()
    await reader.read().then(function next({ done, value }): ReadableStreamReadResult<Uint8Array> | Promise<ReadableStreamReadResult<Uint8Array>> {
      // Result objects contain two properties:
      // done  - true if the stream has already given you all its data.
      // value - some data. Always undefined when done is true.
      if (done) {
        return { done: true, value: null as unknown as Uint8Array };
      }

      // value for fetch streams is a Uint8Array
      chunks.push(value);

      // Read some more, and call this function again
      return reader.read().then(next);
    });

    const totalBytes = chunks.reduce((totalBytes, chunk) => totalBytes + chunk.byteLength, 0);
    const data = new Uint8Array(totalBytes);
    chunks.reduce((offset, chunk) => {
      data.set(chunk, offset);
      return offset + chunk.byteLength
    }, 0);
    return data;
  }
  else if (typeof value === 'string') {
    return value;
  }
  else if (value instanceof Uint8Array) {
    return value;
  }
  else {
    throw 'Must be passed valid data type';
  }
}

export async function valueToUint8Array(value: string | Uint8Array | ReadableStream | Response): Promise<Uint8Array> {
  value = await valueToUint8ArrayOrString(value);
  if (typeof value === 'string') {
    return new TextEncoder().encode(value);
  }
  else if (value instanceof Uint8Array) {
    return value;
  }
  else {
    throw 'Must be passed valid data type';
  }
}

export async function valueToString(value: string | Uint8Array | ReadableStream | Response): Promise<string> {
  if (typeof value === 'string') {
    return value;
  }

  const data = await valueToUint8Array(value);
  return new TextDecoder().decode(data);
}
