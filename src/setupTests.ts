import "fast-text-encoding";
import WebCrypto from "node-webcrypto-ossl";
import { URL } from "whatwg-url";
import 'cross-fetch/polyfill';

interface Global {
  crypto: any;
  fetch: any;
  URL: any;
}
declare const global: Global;

const crypto = new WebCrypto();
global.crypto = crypto;

global.URL = URL;
