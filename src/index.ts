import './types.ts'
import { makeRunner } from './funcs'

addEventListener('fetch', (event: Event) => {
  if (event instanceof FetchEvent) {
    event.respondWith(handleRequest(event.request))
  }
})

async function handleRequest(request: Request): Promise<Response> {
  try {
    return await handleRequestThrowing(request)
  }
  catch (error) {
    return jsonResponse({
      error: error.message
    })
  }
}


function adjustedPath(path: string): string {
  return path.split('/pipeline')[1];
}

function jsonResponse(json: { meta?: {}, data?: any, error?: {} }): Response {
  return new Response(JSON.stringify(json, null, '  '), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

async function handleRequestThrowing(request: Request): Promise<Response> {
  const keys = Object.keys(self)

  const url = new URL(request.url);
  const path = adjustedPath(url.pathname);

  if (/^\/1\//.test(path)) {
    const argsRaw = decodeURIComponent(path.substring(3))
    const run = makeRunner({ request })

    const pipeline = argsRaw.split('|>')

    let index = 0;
    const result = await pipeline.reduce(async (memo, item) => {
      let arity = 1;
      if (index === 0) {
        arity = 0;
      }
      index += 1;

      return run(item, arity === 0 ? [] : [await memo]);
    }, null as (ReturnType<typeof run> | null));

    const response = result as Response
    if (!!response && !!response.body) {
      return response
    }

    const readable = result as ReadableStream
    if (!!readable && typeof readable.getReader === 'function') {
      return new Response(readable)
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
