function hex(buffer) {
  var hexCodes = [];
  var view = new DataView(buffer);
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

async function sha256String(s) {
  var buffer = new TextEncoder("utf-8").encode(s);
  return hex(await crypto.subtle.digest("SHA-256", buffer))
}

function jsonResponse(json) {
  return new Response(JSON.stringify(json, null, '  '), {
    headers: {
      "Content-Type": "application/json"
    }
  })
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

export const functions = ({ request }) => {
  return [
  def0([
    ['Viewer.ipAddress', () => request.headers.get('CF-Connecting-IP')],
    [/^"(.*)"$/, (_ , s) => s]
  ]),
  (input) => {
    const defs = {
      'Fetch.get': async (url) => {
        const res = await fetch('https://' + url)
        return res
      },
      'Fetch.body': async (res) => {
        return res.body
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
          data = new TextEncoder("utf-8").encode(value);
        }
        else {
          throw 'Digest must be passed valid data type'
        }

        return hex(await crypto.subtle.digest("SHA-256", data))
      }
    }
    return defs[input]
  }
]
}