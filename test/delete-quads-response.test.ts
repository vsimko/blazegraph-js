import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {expect, use as chaiUse} from "chai";
import chaiAsPromised from "chai-as-promised";
import {deleteQuads} from "../src/middleware";

chaiUse(chaiAsPromised);

describe("deleteQuads response parsing", () => {
  const originalAdapter = axios.defaults.adapter;
  let responseBody = "";

  beforeEach(() => {
    responseBody = "";
    axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => ({
      data: responseBody,
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });
  });

  afterEach(() => {
    axios.defaults.adapter = originalAdapter;
  });

  const runDelete = () => deleteQuads("http://localhost/sparql")({
    subject: "<http://example.org/subject>"
  });

  it("parses the standard response", async () => {
    responseBody = '<?xml version="1.0"?><data modified="2" milliseconds="15"/>';
    expect(await runDelete()).to.deep.equal({modified: 2, milliseconds: 15});
  });

  it("parses reordered attributes and insignificant whitespace", async () => {
    responseBody = '\n  <?xml version="1.0"?>\n<data milliseconds="15" modified="2" />\n';
    expect(await runDelete()).to.deep.equal({modified: 2, milliseconds: 15});
  });

  it("rejects an empty response", async () => {
    responseBody = "";
    await expect(runDelete()).to.be.rejectedWith("nonempty");
  });

  it("rejects missing statistics", async () => {
    responseBody = '<data modified="2"/>';
    await expect(runDelete()).to.be.rejectedWith("numeric modified and milliseconds");
  });

  it("rejects non-numeric statistics", async () => {
    responseBody = '<data modified="many" milliseconds="15"/>';
    await expect(runDelete()).to.be.rejectedWith("numeric modified and milliseconds");
  });
});
