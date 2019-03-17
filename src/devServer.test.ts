import { makeServer } from "./devServer";
import * as Hapi from "hapi";

describe("makeServer()", () => {
  let server: Hapi.Server | null;

  beforeAll(() => {
    server = makeServer({ port: 2222 });
  });
  afterAll(() => {
    server = null;
  });

  const subject: () => Hapi.Server = () => server as Hapi.Server;

  it("is 200 for /1/-pipeline", async () => {
    const res = await subject().inject({
      method: "get",
      url: "/1/-pipeline/Viewer.ipAddress"
    });

    const json = JSON.parse(res.payload)
    expect(json.data).toEqual("0.0.0.0");
  });
});
