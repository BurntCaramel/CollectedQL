/// <reference types="node-webcrypto-ossl" />
import "fast-text-encoding";
import WebCrypto from "node-webcrypto-ossl";
import { URL } from "whatwg-url";
import 'cross-fetch/polyfill';
import * as Hapi from "hapi";
import { handleRequest } from "./handlers";

interface Global {
  crypto: any;
  fetch: any;
  URL: any;
}
declare const global: Global;

const crypto = new WebCrypto();
global.crypto = crypto;

global.URL = URL;


async function handler(req: Hapi.Request, h: Hapi.ResponseToolkit) {
  const urlString = `https://example.org${req.url.href}`
    const incomingRequest = new Request(urlString, {
      method: req.method,
      headers: {
        "CF-Connecting-IP": "0.0.0.0"
      },
      body: req.payload as string
    })
    const fetchResponse = await handleRequest(incomingRequest);
    const handlerResponse = h.response(fetchResponse.body as {});

    handlerResponse.code(fetchResponse.status);

    fetchResponse.headers.forEach((value, key) => {
      handlerResponse.header(key, value);
    });

    return handlerResponse;
}

async function start(port: number): Promise<void> {
  const server = new Hapi.Server({
    port
  });

  server.route([
    {
      method: ["get", "post"],
      path: "/pipeline/1/{command*}",
      options: {
        cors: true,
      },
      handler: handler
    },
    {
      method: ["get", "post"],
      path: "/pipeline/graphql",
      options: {
        cors: true,
      },
      handler: handler
    }
  ]);

  console.log('Starting server on port', port);

  return server.start()
}

start(5533);
