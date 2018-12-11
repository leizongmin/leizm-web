/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Application, component } from "../../lib";
import * as request from "supertest";
import { expect } from "chai";
// import { IncomingMessage } from "http";

describe("component.proxy", function() {
  const appInstances: Application[] = [];
  const remoteApp = new Application();
  let remoteUrl = "";
  let remoteHost = "";
  before(function(done) {
    remoteApp.listen({ port: 0 }, () => {
      const addr = remoteApp.server.address();
      remoteHost = typeof addr === "string" ? addr : "127.0.0.1:" + addr.port;
      remoteUrl = "http://" + remoteHost;
      appInstances.push(remoteApp);
      done();
    });
  });
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  remoteApp.router.get("/path/to/some", async function(ctx) {
    ctx.response.setHeader("x-proxy", "on");
    ctx.response.json({ headers: ctx.request.headers, url: ctx.request.url });
  });

  it("component.proxy success", async function() {
    const app = new Application();
    appInstances.push(app);
    app.use("/", component.proxy({ target: remoteUrl + "/path/to", removeHeaderNames: ["host", "user-agent"] }));
    app.use("/", function(ctx) {
      ctx.response.end("OK");
    });

    await request(app.server)
      .get("/some")
      .expect(200)
      .expect("x-proxy", "on")
      .expect({
        headers: {
          "accept-encoding": "gzip, deflate",
          host: remoteHost,
          connection: "close",
        },
        url: "/path/to/some",
      });
    await request(app.server)
      .get("/some")
      .set("x-aaa-bbb", "ccc")
      .expect(200)
      .expect("x-proxy", "on")
      .expect({
        headers: {
          "accept-encoding": "gzip, deflate",
          host: remoteHost,
          connection: "close",
          "x-aaa-bbb": "ccc",
        },
        url: "/path/to/some",
      });
  });

  it("ctx.proxy success", async function() {
    const app = new Application();
    appInstances.push(app);
    let some1Done = false;
    let some2Done = false;
    app.router.get("/some1", async function(ctx) {
      await ctx.proxy(remoteUrl + "/path/to/some");
      some1Done = true;
    });
    app.router.get("/some2", async function(ctx) {
      await ctx.proxy({
        hostname: "127.0.0.1",
        port: remoteHost.split(":")[1],
        path: "/path/to/some",
        headers: {
          "x-abc": "12345678",
        },
      });
      some2Done = true;
    });
    app.router.get("/some3", function(ctx) {
      return ctx.proxyWithHeaders(ctx.request.query!.url);
    });
    app.use("/", function(ctx) {
      ctx.response.end("OK");
    });

    await request(app.server)
      .get("/some1")
      .expect(200)
      .expect("x-proxy", "on")
      .expect({
        headers: {
          host: remoteHost,
          connection: "close",
        },
        url: "/path/to/some",
      });
    expect(some1Done).to.equal(true);
    await request(app.server)
      .get("/some2")
      .set("x-aaa-bbb", "ccc")
      .expect(200)
      .expect("x-proxy", "on")
      .expect({
        headers: {
          host: remoteHost,
          connection: "close",
          "x-abc": "12345678",
        },
        url: "/path/to/some",
      });
    expect(some2Done).to.equal(true);
    await request(app.server)
      .get("/some3")
      .set("user-agent", "haha")
      .query({
        url: remoteUrl + "/path/to/some",
      })
      .expect(200)
      .expect("x-proxy", "on")
      .expect({
        headers: {
          "accept-encoding": "gzip, deflate",
          host: remoteHost,
          connection: "close",
          "user-agent": "haha",
        },
        url: "/path/to/some",
      });
  });
});
