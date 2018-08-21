/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { Application, fromClassicalHandle, Router, toClassicalHandle } from "../../lib";
import * as request from "supertest";
import * as connect from "connect";
import * as bodyParser from "body-parser";
import * as serveStatic from "serve-static";

export function readFile(file: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.toString());
      }
    });
  });
}

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("兼容 connect 模块", function() {
  const appInstances: Application[] = [];
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  it("作为 connect 的中间件", async function() {
    const app = connect();
    const app2 = new Application();
    appInstances.push(app2);
    app.use(bodyParser.json() as any);
    let isCalled = false;
    app.use(function(req: IncomingMessage, res: ServerResponse, next: Function) {
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
        c: 333,
      })
      .expect(200)
      .expect({
        a: 111,
        b: 222,
        c: 333,
      });
    expect(isCalled).to.equal(true);
  });

  it("转换 connect app 为中间件", async function() {
    const app = connect();
    const app2 = new Application();
    appInstances.push(app2);
    app.use(bodyParser.json() as any);
    let isCalled = false;
    app.use(function(req: IncomingMessage, res: ServerResponse, next: Function) {
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
        c: 333,
      })
      .expect(200)
      .expect({
        a: 111,
        b: 222,
        c: 333,
      });
    expect(isCalled).to.equal(true);
  });

  it("Router 作为 connect 中间件", async function() {
    const app = connect();
    const app2 = new Application();
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

  it("兼容 serve-static 模块", async function() {
    const app = new Application();
    appInstances.push(app);
    const app2 = new Application();
    app.use("/public", fromClassicalHandle(serveStatic(ROOT_DIR) as any));
    app.use("/a", app2);
    app2.use("/static", fromClassicalHandle(serveStatic(ROOT_DIR) as any));
    await request(app.server)
      .get("/public/package.json")
      .expect(200)
      .expect(await readFile(path.resolve(ROOT_DIR, "package.json")));
    await request(app.server)
      .get("/a/static/package.json")
      .expect(200)
      .expect(await readFile(path.resolve(ROOT_DIR, "package.json")));
  });

  it("@leizm/web 格式的中间件作为 connect 中间件", async function() {
    const app = connect();
    let counter = 0;
    app.use(
      toClassicalHandle(function(ctx) {
        counter++;
        ctx.next();
      }),
    );
    app.use(
      "/a",
      toClassicalHandle(function(ctx) {
        ctx.response.end("this is a");
      }),
    );
    app.use(
      "/b",
      toClassicalHandle(function(ctx) {
        ctx.response.end("this is b");
      }),
    );
    await request(app)
      .get("/a")
      .expect(200)
      .expect("this is a");
    await request(app)
      .post("/b")
      .expect(200)
      .expect("this is b");
    expect(counter).to.equal(2);
  });
});
