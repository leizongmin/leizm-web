import { expect } from "chai";
import { ServerRequest, ServerResponse } from "http";
import { Connect, fromClassicalHandle, Router } from "../lib";
import * as request from "supertest";
import * as connect from "connect";
import * as bodyParser from "body-parser";

describe("兼容 connect 模块", function() {
  const appInstances: Connect[] = [];
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  it("作为 connect 的中间件", async function() {
    const app = connect();
    const app2 = new Connect();
    appInstances.push(app2);
    app.use(bodyParser.json());
    let isCalled = false;
    app.use(function(req: ServerRequest, res: ServerResponse, next: Function) {
      isCalled = true;
      next();
    });
    app.use(app2.handleRequest);
    app2.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app)
      .post("/")
      .send({
        a: 111,
        b: 222,
        c: 333
      })
      .expect(200)
      .expect({
        a: 111,
        b: 222,
        c: 333
      });
    expect(isCalled).to.equal(true);
  });

  it("转换 connect app 为中间件", async function() {
    const app = connect();
    const app2 = new Connect();
    appInstances.push(app2);
    app.use(bodyParser.json());
    let isCalled = false;
    app.use(function(req: ServerRequest, res: ServerResponse, next: Function) {
      isCalled = true;
      next();
    });
    app2.use("/", fromClassicalHandle(app));
    app2.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app2.server)
      .post("/")
      .send({
        a: 111,
        b: 222,
        c: 333
      })
      .expect(200)
      .expect({
        a: 111,
        b: 222,
        c: 333
      });
    expect(isCalled).to.equal(true);
  });

  it("Router 作为 connect 中间件", async function() {
    const app = connect();
    const app2 = new Connect();
    const router = new Router();
    app2.use("/", router);
    app.use(app2.handleRequest);
    router.get("/a", function(ctx) {
      ctx.response.end("this is a");
    });
    router.post("/b", function(ctx) {
      ctx.response.end("this is b");
    });
    await request(app2.server)
      .get("/a")
      .expect(200)
      .expect("this is a");
    await request(app2.server)
      .post("/b")
      .expect(200)
      .expect("this is b");
  });
});
