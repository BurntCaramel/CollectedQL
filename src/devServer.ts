/// <reference types="node-webcrypto-ossl" />
import "fast-text-encoding";
import WebCrypto from "node-webcrypto-ossl";
import 'cross-fetch/polyfill';
import { Server } from "hapi";
import { handleRequest } from "./handlers";

interface Global {
  crypto: any;
  fetch: any;
}
declare const global: Global;

const crypto = new WebCrypto();
global.crypto = crypto;

async function start(port: number): Promise<void> {
  const server = new Server({
    port
  });

  server.route({
    "method": ["get", "post"],
    "path": "/pipeline/1/{command*}",
    async handler(req, h) {
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

      fetchResponse.headers.forEach((value, key) => {
        handlerResponse.header(key, value);
      });

      return handlerResponse;
    }
  })

  console.log('Starting server on port', port);

  return server.start()
}

start(5533);
