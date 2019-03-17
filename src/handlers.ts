import { makeRunner } from './funcs'
import { readTextMarkdown } from "./modules/Store"
import * as GraphQLServer from "./graphql/GraphQLServer";
import { match } from "ramda";

interface JSONResponseInput {
  meta?: {},
  data?: any,
  error?: {}
}

export async function handleRequest(request: Request): Promise<Response> {
  try {
    const start = Date.now();
    const response = await handleRequestThrowing(request)
    const duration = Date.now() - start;
    console.log('duration', duration);

    const wrappedHeaders = new Headers(response.headers);
    wrappedHeaders.append("Server-Timing", `cfworker;dur=${duration}`);
    const wrappedResponse = new Response(response.body, {
      status: response.status,
      headers: wrappedHeaders
    });
    return wrappedResponse
  }
  catch (error) {
    console.error('Error', error)
    return jsonResponse({
      error: error.message
    })
  }
}


function adjustedPath(path: string): string {
  const [, suffix = ""] = match(/^\/1\/(.*)/, path);
  return suffix;
}

function jsonResponse(json: JSONResponseInput): Response {
  return new Response(JSON.stringify(json, null, '  '), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  })
}

export async function handleRequestThrowing(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = adjustedPath(url.pathname);

  if (/^graphql\/?/.test(path)) {
    return GraphQLServer.handleRequest(request)
  }

  if (/^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed$/.test(path)) {
    return readTextMarkdown("ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed")
  }

  if (/^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed\/redirect$/.test(path)) {
    return Response.redirect("https://collected-193006.appspot.com/1/storage/text/markdown/sha256/ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed")
  }

  if (/^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed\/hardcoded$/.test(path)) {
    return new Response(
      "# Hello2", {
        headers: {
          "Content-Type": "text/markdown"
        }
      }
    )
  }

  if (/^-pipeline\//.test(path)) {
    const argsRaw = decodeURIComponent(path.substring(10))
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
