/// <reference types="node-webcrypto-ossl" />
import "fast-text-encoding";
import WebCrypto from "node-webcrypto-ossl";

interface Global {
  crypto: any;
  fetch: any;
}
declare const global: Global;

import { makeRunner } from './funcs'

describe("funcs", () => {
  const request = {
    headers: {
      get(key: string) {
        if (key === 'CF-Connecting-IP') {
          return '1.2.3.4'
        }
        return null
      }
    }
  } as Request;
  
  const run = makeRunner({ request });

  it('returns the ip address from the current request', async () => {
    expect(await run('Viewer.ipAddress')).toEqual('1.2.3.4')
  });

  it('returns a string', async () => {
    expect(await run('"hello"')).toEqual('hello')
  });

  it('returns the SHA-256 in hex for "a"', async () => {
    const crypto = new WebCrypto();
    global.crypto = crypto;

    const result = await run('sha256', ['a']);

    expect(result).toEqual('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb');
  });

  it('throws an error', async () => {
    expect.assertions(1);
    await expect(run('Not.Found')).rejects.toMatchObject({
      message: expect.stringMatching(/No function found matching Not.Found\/0/)
    })
  });

  describe('Fetch', () => {
    it('returns a response when fetching a URL', async () => {
      const mockResponse = {};
      const fetch = jest.fn(() => mockResponse);
      global.fetch = fetch;
      
      const result = await run('Fetch.get', ['https://example.org/']);
  
      expect(result).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('https://example.org/');
    });

    it('returns a response when fetching a URL', async () => {
      const mockResponse = { status: 404 } as Response;
      
      const result = await run('Fetch.status', [mockResponse]);
  
      expect(result).toEqual(404);
    });
  })
});
