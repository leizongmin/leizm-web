/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Application, component } from "../../lib";
import * as request from "supertest";
import { expect } from "chai";
import { IncomingMessage } from "http";

describe("component.cors", function () {
  const appInstances: Application[] = [];
  after(async function () {
    for (const app of appInstances) {
      await app.close();
    }
  });

  describe("any = true", function () {
    it("http", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect(200, "OK");
    });

    it("https", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "https://example.com")
        .expect("Access-Control-Allow-Origin", "https://example.com")
        .expect(200, "OK");
    });
  });

  describe("domain = list", function () {
    it("in list", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ domain: ["example.com"] }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect(200);
    });

    it("not in list", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ domain: ["example.com"] }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://ucdok.com")
        .expect((res: IncomingMessage) => {
          expect(res.headers).to.not.have.property("access-control-allow-origin");
        })
        .expect(200, "OK");
    });
  });

  describe("其他选项", function () {
    it("credentials", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true, credentials: true }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect("Access-Control-Allow-Credentials", "true")
        .expect(200, "OK");
    });

    it("maxAge", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true, maxAge: 100 }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect("Access-Control-Max-Age", "100")
        .expect(200, "OK");
    });

    it("allowHeaders", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true, allowHeaders: ["A", "B"] }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect("Access-Control-Allow-Headers", "A, B")
        .expect(200, "OK");
    });

    it("allowMethods", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true, allowMethods: ["A", "B"] }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect("Access-Control-Allow-Methods", "A, B")
        .expect(200, "OK");
    });

    it("headers", async function () {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.cors({ any: true, headers: { A: "12345", B: "67890" } }));
      app.use("/", function (ctx) {
        ctx.response.end("OK");
      });
      await request(app.server)
        .get("/test")
        .set("Origin", "http://example.com")
        .expect("Access-Control-Allow-Origin", "http://example.com")
        .expect("A", "12345")
        .expect("B", "67890")
        .expect(200, "OK");
    });
  });
});
