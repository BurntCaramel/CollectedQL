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

function makeNullary(pattern, f) {
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

function def0(defs) {
  const concreteDefs = defs.map(([pattern, f]) => makeNullary(pattern, f));

  return (input) => {
    let f = null;
    concreteDefs.some((check) => {
      const foundF = check(input)
      if (foundF) {
        f = foundF
        return true
      }
      return false
    });

    return f || (() => {
      throw new Error(`No function found matching ${input}`)
    });
  }
}

export const makeRunner = ({ request }) => {
  console.log('functions')
  const arityToFuncs = [
    def0([
      ['Viewer.ipAddress', () => request.headers.get('CF-Connecting-IP')],
      [/^"(.*)"$/, (_ , s) => s]
    ]),
    (input) => {
      const defs = {
        'Fetch.get': async (url) => {
          const res = await fetch('https://' + url)
          return res;
        },
        'Fetch.body': async (res) => {
          return res.body;
        },
        'Fetch.headers': async (res) => {
          return Array.from(res.headers.entries());
        },
        'sha256': async (value) => {
          let data;
          if (!!value && typeof value.getReader === 'function') {
            let chunks = []
            const reader = value.getReader()
            await reader.read().then(function next({ done, value }) {
              // Result objects contain two properties:
              // done  - true if the stream has already given you all its data.
              // value - some data. Always undefined when done is true.
              if (done) {
                return;
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
            throw 'Digest must be passed valid data type'
          }

          console.log('sha data', data, crypto.subtle)

          console.log('crypto.subtle', crypto.subtle)

          return hex(new DataView(await crypto.subtle.digest("SHA-256", data)))
        }
      }
      return defs[input]
    }
  ]

  return (name, args = []) => {
    const arity = args.length
    const funcs = arityToFuncs[arity]
    const f = !!funcs ? funcs(name) : null
    if (!f) {
      throw new Error(`No function found matching ${name}/${arity}`)
    }

    return f(...args)
  }
}