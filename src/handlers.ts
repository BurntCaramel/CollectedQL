import { match } from "ramda";

import { makeRunner } from "./funcs";
import { readTextMarkdown } from "./modules/Store";
import * as GraphQLServer from "./graphql/GraphQLServer";
import * as GraphQLCSSServer from "./graphql/GraphQLCSSServer";
import { GraphQLRequestSource } from "./graphql/source";
import { fetchTextFromGitHub } from "./sources/gitHub";
import { parseSVGDocument, listAllFillsFromSVGDocument } from "./modules/SVG";
import * as Collections from "./modules/Collections";

interface JSONResponseInput {
  meta?: {};
  data?: any;
  errors?: Array<{ message: string }>;
}

export async function handleRequest(request: Request): Promise<Response> {
  try {
    const start = Date.now();
    const response = await handleRequestThrowing(request);
    const duration = Date.now() - start;
    console.log("duration", duration, "ms");

    const wrappedHeaders = new Headers(response.headers);
    wrappedHeaders.append("Server-Timing", `cfworker;dur=${duration}`);
    const wrappedResponse = new Response(response.body, {
      status: response.status,
      headers: wrappedHeaders
    });
    return wrappedResponse;
  } catch (error) {
    console.error("Error", error);
    return jsonResponse({
      errors: [{ message: error.message }]
    });
  }
}

function adjustedPath(path: string): string {
  const [, suffix = ""] = match(/^\/1\/(.*)/, path);
  return suffix;
}

function jsonResponse(json: JSONResponseInput): Response {
  return new Response(JSON.stringify(json, null, "  "), {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export async function handleRequestThrowing(
  request: Request
): Promise<Response> {
  const url = new URL(request.url);
  const path = adjustedPath(url.pathname);

  console.log({ path });

  if (/^github\/.+$/.test(path)) {
    const all = match(
      /^github\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/,
      path
    ) as Array<string>;
    const [, owner, repo, tagOrCommit, githubPath] = all;

    let text = await fetchTextFromGitHub({
      owner,
      repo,
      tagOrCommit,
      path: githubPath
    });

    let contentType = "text/plain";
    if (/\.svg$/.test(githubPath)) {
      contentType = "image/svg+xml";

      if (url.searchParams.has("query")) {
        const query = url.searchParams.get("query");
        if (query === "listFills") {
          const svg = parseSVGDocument(text);
          const fills = listAllFillsFromSVGDocument(svg);
          const uniqueFills = new Set(fills);
          return jsonResponse({ data: Array.from(uniqueFills) });
        } else {
          return jsonResponse({ data: null });
        }
      }

      const defaultFill = url.searchParams.get("defaultFill");
      if (defaultFill !== null) {
        text = text.replace(/<\/svg>/, input => {
          return `<style>svg { fill: ${defaultFill}; }</style>${input}`;
        });
      }

      const newFill = url.searchParams.get("fill");
      if (newFill !== null) {
        text = text.replace(/<\/svg>/, input => {
          return `<style>[fill] { fill: ${newFill}; }</style>${input}`;
        });
      }

      const fillReplacements = new Map<string, string>();
      const pairs = url.search.substring(1).split("&");
      // return jsonResponse({ data: pairs });

      pairs.forEach(pair => {
        const [key, value] = pair.split("=").map(decodeURIComponent);
        const [, findColor] = match(/^fill\[([^\]]+)\]$/, key);
        if (findColor !== undefined && value !== undefined) {
          fillReplacements.set(findColor, value);
        }
      });

      if (fillReplacements.size > 0) {
        text = text.replace(/<\/svg>/, input => {
          const rules: Array<string> = [];

          fillReplacements.forEach((value, key) => {
            rules.push(`[fill="${key}"i] { fill: ${value}; }`);
          });

          return `<style>
${rules.join("\n")}
</style>
${input}`;
        });
      }
    }

    return new Response(text, {
      headers: {
        "Content-Type": contentType
      }
    });
  }

  if (/^(graphql|graphql\.css)(\/?|\/.+)$/.test(path)) {
    const all = match(
      /^(graphql|graphql\.css)(?:(?:\/(github.com)\/([^\/]+)\/([^\/]+)\/([^\/]+))|)$/,
      path
    ) as Array<string>;
    const [, type, sourceName, ...params] = all as [
      string,
      "graphql" | "graphql.css",
      "github.com" | undefined,
      ...Array<string>
    ];

    let source: GraphQLRequestSource;
    if (sourceName === "github.com") {
      const [owner, repo, tagOrCommit] = params;
      const path = url.searchParams.get("queryPath");
      if (path == null) {
        throw new Error("'queryPath' query variable is required");
      }
      source = { type: "github", owner, repo, tagOrCommit, path };
    } else {
      source = { type: "http", request };
    }

    if (type === "graphql") {
      return GraphQLServer.handleRequestFromSource(source);
    } else if (type === "graphql.css") {
      return GraphQLCSSServer.handleRequestFromSource(source);
    }
  }

  if (/^collections\/1\/.+$/.test(path)) {
    const [, id] = match(/^collections\/1\/([^\/]+)$/, path) as Array<string>;

    if (request.method === "PUT") {
      if (request.body != null) {
        Collections.write(id, request.body);
        return new Response(null, { status: 200 });
      }
    } else if (request.method === "GET") {
      const text = await Collections.read(id, "text");
      if (text == null) {
        return new Response(null, { status: 404 });
      }

      return new Response(text, {
        headers: {
          "Content-Type": "text/plain"
        }
      });
    }
  }

  if (
    /^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed$/.test(
      path
    )
  ) {
    return readTextMarkdown(
      "ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed"
    );
  }

  if (
    /^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed\/redirect$/.test(
      path
    )
  ) {
    return Response.redirect(
      "https://collected-193006.appspot.com/1/storage/text/markdown/sha256/ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed"
    );
  }

  if (
    /^ac52804bd3751b1d55f3396059e47b2f20da3fe8a7318795f3b057600d33c3ed\/hardcoded$/.test(
      path
    )
  ) {
    return new Response("# Hello2", {
      headers: {
        "Content-Type": "text/markdown"
      }
    });
  }

  if (/^-pipeline\//.test(path)) {
    const argsRaw = decodeURIComponent(path.substring(10));
    const run = makeRunner({ request });

    const pipeline = argsRaw.split("|>");

    let index = 0;
    const result = await pipeline.reduce(
      async (memo, item) => {
        let arity = 1;
        if (index === 0) {
          arity = 0;
        }
        index += 1;

        return run(item, arity === 0 ? [] : [await memo]);
      },
      null as (ReturnType<typeof run> | null)
    );

    const response = result as Response;
    if (!!response && !!response.body) {
      return response;
    }

    const readable = result as ReadableStream;
    if (!!readable && typeof readable.getReader === "function") {
      return new Response(readable);
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
    });
  }

  const response = await fetch(request);
  return response;
}
