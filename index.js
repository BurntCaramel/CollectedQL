import { functions } from './funcs.js'

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    return await handleRequestThrowing(request)
  }
  catch (error) {
    return jsonResponse({
      error: error.message
    })
  }
}


function adjustedPath(path) {
  return path.split('/pipeline')[1]
}

function jsonResponse(json) {
  return new Response(JSON.stringify(json, null, '  '), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

/**
 * Fetch and log a given request object
 * @param {Request} request
 */
async function handleRequestThrowing(request) {
  const keys = Object.keys(self)

  const url = new URL(request.url);
  const path = adjustedPath(url.pathname);

  if (/^\/1\//.test(path)) {
    const argsRaw = decodeURIComponent(path.substring(3))
    const functionsForRequest = functions({ request })

    const pipeline = argsRaw.split('|>')

    const initial = {}
    const result = await pipeline.reduce(async (memo, item) => {
      let arity = 1;
      if (memo === initial) {
        arity = 0;
      }

      const f = functionsForRequest[arity](item)
      if (f == null) {
        throw new Error(`Invalid input or command ${item}/${arity}`)
      }

      return f(await memo);
    }, initial)

    if (!!result && !!result.body) {
      return result
    }

    if (!!result && typeof result.getReader === 'function') {
      return new Response(result)
    }

    return jsonResponse({
      meta: {
        version: 1,
        argsRaw,
        pipeline,
        path,
        fullPath: url.pathname
      },
      data: result
    })
  }

  const response = await fetch(request)
  return response
}
