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

type PipableType = string | number | Response | ReadableStream | null | Array<Array<string>>;

type NullaryDefinition = [string, () => PipableType] | [RegExp, (...args: Array<string>) => PipableType]

function makeNullary([pattern, f]: NullaryDefinition): (input: string) => (() => PipableType) | null {
  if (typeof pattern === 'string') {
    return (input) => input === pattern ? f : null;
  }
  else if (pattern instanceof RegExp) {
    return (input) => {
      const matches = pattern.exec(input)
      if (matches == null) {
        return null
      }

      return () => f(...matches)
    }
  }

  throw new Error(`Invalid pattern ${pattern}`)
}

function def0(defs: Array<NullaryDefinition>): (input: string) => () => PipableType {
  const concreteDefs = defs.map(makeNullary);

  return function(input: string) {
    let f: (() => any) | null = null;
    concreteDefs.some((check) => {
      const foundF = check(input)
      if (foundF) {
        f = foundF
        return true
      }
      return false
    });

    return f || (() => {
      throw new Error(`No function found matching ${input}/0`)
    });
  }
}

type UnaryFunc = ((res: Response) => Promise<PipableType>) | ((url: string) => Promise<PipableType>) | ((value: string | ReadableStream | null) => Promise<PipableType>);

function def1(defs: Record<string, UnaryFunc>): (input: string) => (value: any) => Promise<PipableType> {
  return function(input: string) {
    let f: ((value: any) => Promise<PipableType>) | undefined = defs[input];

    return f || ((value: any) => {
      throw new Error(`No function found matching ${input}/1`)
    });
  }
}

export function makeRunner({ request }: { request: Request }) {
  const arityToFuncs: Array<((input: string) => (...args: Array<PipableType>) => PipableType | Promise<PipableType>)> = [
    def0([
      ['Viewer.ipAddress', () => request.headers.get('CF-Connecting-IP')],
      [/^"(.*)"$/, (_ , s) => s]
    ]),
    def1({
      'Fetch.get': async (url: string) => {
        const res = await fetch(url)
        return res;
      },
      'Fetch.body': async (res: Response) => {
        return res.body;
      },
      'Fetch.status': async (res: Response) => {
        return res.status;
      },
      'Fetch.headers': async (res: Response) => {
        return Array.from(res.headers as unknown as Iterable<Array<string>>);
      },
      'sha256': async (value: string | ReadableStream | null) => {
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
    })
  ]

  return async function(name: string, args: Array<PipableType> = []): Promise<PipableType> {
    const arity = args.length
    const funcs = arityToFuncs[arity]
    const f = !!funcs ? funcs(name) : null
    if (!f) {
      throw new Error(`No function found matching ${name}/${arity}`)
    }

    return await f(...args);
  }
}