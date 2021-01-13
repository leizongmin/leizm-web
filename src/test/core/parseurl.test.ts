/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { parseUrl, ParsedUrl } from "../../lib/parse_url";
import { expect } from "chai";

describe("parseUrl", function () {
  it("relative url, query=false", function () {
    expect(parseUrl("/abc/efg?a=1&b=2#345")).to.deep.eq({
      hash: "#345",
      host: "",
      hostname: "",
      password: "",
      path: "/abc/efg?a=1&b=2",
      pathname: "/abc/efg",
      port: "",
      protocol: "",
      query: null,
      search: "?a=1&b=2",
      username: "",
    } as ParsedUrl);
  });

  it("relative url, query=true", function () {
    expect(parseUrl("/abc/efg?a=1&b=2#345", { query: true })).to.deep.eq({
      hash: "#345",
      host: "",
      hostname: "",
      password: "",
      path: "/abc/efg?a=1&b=2",
      pathname: "/abc/efg",
      port: "",
      protocol: "",
      query: { a: "1", b: "2" },
      search: "?a=1&b=2",
      username: "",
    } as ParsedUrl);
  });

  it("absolute url", function () {
    expect(parseUrl("http://example.com:8080/abc/efg?a=1&b=2#345", { absolute: true })).to.deep.eq({
      hash: "#345",
      host: "example.com:8080",
      hostname: "example.com",
      password: "",
      path: "/abc/efg?a=1&b=2",
      pathname: "/abc/efg",
      port: "8080",
      protocol: "http:",
      query: null,
      search: "?a=1&b=2",
      username: "",
    } as ParsedUrl);
  });
});
