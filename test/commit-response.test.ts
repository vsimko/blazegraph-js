import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {expect} from "chai";
import {updateSparql} from "../src/middleware";

describe("SPARQL commit response parsing", () => {
  const originalAdapter = axios.defaults.adapter;

  afterEach(() => {
    axios.defaults.adapter = originalAdapter;
  });

  const mockResponse = (body: string) => {
    axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => ({
      data: body,
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  };

  it("parses query and update statistics from a valid response", async () => {
    mockResponse("<p>elapsed=1ms,units=2</p><p>COMMIT: modified=3,milliseconds=4</p>");

    const result = await updateSparql("http://localhost/sparql")("INSERT DATA {}");

    expect(result).to.deep.equal({
      query: {elapsed: "1ms", units: "2"},
      update: {modified: "3", milliseconds: "4"}
    });
  });

  for (const [description, body] of [
    ["an empty response", ""],
    ["a response with only one paragraph", "<p>elapsed=1ms</p>"],
    ["an empty update paragraph", "<p>elapsed=1ms</p><p> </p>"],
    ["an invalid statistics entry", "<p>elapsed=1ms</p><p>COMMIT: malformed</p>"]
  ]) {
    it(`rejects ${description} with a descriptive error`, async () => {
      mockResponse(body);

      const error = await updateSparql("http://localhost/sparql")("INSERT DATA {}")
        .then(() => undefined, reason => reason);

      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.match(/Unable to parse Blazegraph commit response/);
    });
  }
});
