import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {expect} from "chai";
import {checkPatternExistence, readQuads} from "../src/middleware";

describe("graph URL parameters", () => {
  const originalAdapter = axios.defaults.adapter;
  const graph = "http://example.org/graph with&reserved<chars>";
  let requestUrl: string | undefined;

  beforeEach(() => {
    requestUrl = undefined;
    axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
      requestUrl = config.url;
      return {
        data: config.url?.includes("HASSTMT") ? '<data result="true"/>' : "",
        status: 200,
        statusText: "OK",
        headers: {},
        config
      };
    };
  });

  afterEach(() => {
    axios.defaults.adapter = originalAdapter;
  });

  it("encodes graph values in checkPatternExistence", async () => {
    await checkPatternExistence("http://localhost/sparql")({graphs: [graph]});

    expect(requestUrl).to.not.equal(undefined);
    expect(new URL(requestUrl as string).searchParams.getAll("c")).to.deep.equal([graph]);
  });

  it("encodes graph values in readQuads", async () => {
    await readQuads("http://localhost/sparql")({graphs: [graph]});

    expect(requestUrl).to.not.equal(undefined);
    expect(new URL(requestUrl as string).searchParams.getAll("c")).to.deep.equal([graph]);
  });
});
