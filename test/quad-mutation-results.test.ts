import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {expect} from "chai";
import {createQuads, updateQuad} from "../src/middleware";
import {ZCreateQuadsResult} from "../src/schemas/ZCreateQuadsResult";
import {ZUpdateQuadsResult} from "../src/schemas/ZUpdateQuadsResult";

describe("quad mutation response parsing", () => {
  const originalAdapter = axios.defaults.adapter;
  const response = '<data modified="2" milliseconds="17"/>';

  afterEach(() => {
    axios.defaults.adapter = originalAdapter;
  });

  it("parses createQuads mutation statistics", async () => {
    axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => ({
      data: response,
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });

    const result = await createQuads("http://localhost/sparql")({
      subject: "<http://example.org/s>",
      predicate: "<http://example.org/p>",
      object: "<http://example.org/o>",
      graph: "<http://example.org/g>"
    });

    expect(result).to.deep.equal({modified: 2, milliseconds: 17});
  });

  it("parses updateQuad mutation statistics", async () => {
    axios.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse> => ({
      data: response,
      status: 200,
      statusText: "OK",
      headers: {},
      config
    });

    const result = await updateQuad("http://localhost/sparql")({
      subject: "<http://example.org/s>",
      predicate: "<http://example.org/p>",
      object: "<http://example.org/new>",
      oldObject: "<http://example.org/old>",
      graph: "<http://example.org/g>"
    });

    expect(result).to.deep.equal({modified: 2, milliseconds: 17});
  });

  it("rejects empty createQuads and updateQuad responses", () => {
    expect(() => ZCreateQuadsResult.parse("")).to.throw();
    expect(() => ZUpdateQuadsResult.parse("")).to.throw();
  });

  it("returns null for unexpected non-empty responses", () => {
    expect(ZCreateQuadsResult.parse("unexpected response")).to.equal(null);
    expect(ZUpdateQuadsResult.parse('<data modified="not-a-number" milliseconds="1"/>')).to.equal(null);
  });

  it("supports XML declarations and reordered attributes", () => {
    expect(ZCreateQuadsResult.parse('<?xml version="1.0"?><data milliseconds="8" modified="3"/>'))
      .to.deep.equal({modified: 3, milliseconds: 8});
  });
});
