/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import { Server } from "http";
import { Application, Router, fromClassicalHandle, fromClassicalErrorHandle } from "../../lib";
import * as request from "supertest";
import * as bodyParser from "body-parser";

function sleep(ms: number): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(ms), ms);
  });
}

describe("Application", function () {
  const appInstances: Application[] = [];
  after(async function () {
    for (const app of appInstances) {
      await app.close();
    }
  });

  it("封装了 http.Server", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.response.end("ok");
    });
    expect(app.server).to.instanceof(Server);
    request(app.server).get("/").expect(200).expect("ok", done);
  });

  it("调用 listen 监听端口成功", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.response.end("ok");
    });
    app.listen({ port: 0 });
    request(app.server).get("/").expect(200).expect("ok", done);
  });

  it("支持在 http.createServer 内使用", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.response.end("ok");
    });
    const server = new Server(function (req, res) {
      app.handleRequest(req, res);
    });
    request(server).get("/").expect(200).expect("ok", done);
  });

  it("支持在 http.createServer 内使用（自动绑定 this）", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.response.end("ok");
    });
    const server = new Server(app.handleRequest);
    request(server).get("/").expect(200).expect("ok", done);
  });

  it("可以 attach http.Server", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.response.end("ok");
    });
    const server = new Server();
    app.attach(server);
    request(server).get("/").expect(200).expect("ok", done);
  });

  it("支持 async function", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", async function (ctx) {
      await sleep(300);
      ctx.response.end("ok");
    });
    const t = process.uptime();
    request(app.server)
      .get("/")
      .expect(200)
      .expect("ok", function () {
        expect(process.uptime() - t).to.greaterThan(0.3);
        done();
      });
  });

  it("如果没有中间件响应结果，调用 done 回调函数", function (done) {
    const app = new Application();
    appInstances.push(app);
    const server = new Server(function (req, res) {
      app.handleRequest(req, res, function (err) {
        expect(err).to.equal(null);
        res.end("hello");
      });
    });
    request(server).get("/").expect(200).expect("hello", done);
  });

  it("如果没有中间件响应 Error 结果，调用 done 回调函数时传递 Error 信息", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.next("test error");
    });
    const server = new Server(function (req, res) {
      app.handleRequest(req, res, function (err) {
        expect(err).to.equal("test error");
        res.end("hello");
      });
    });
    request(server).get("/").expect(200).expect("hello", done);
  });

  it("如果没有中间件响应结果，且不传递 done 回调函数时，返回 404", function (done) {
    const app = new Application();
    appInstances.push(app);
    const server = new Server(function (req, res) {
      app.handleRequest(req, res);
    });
    request(server).get("/").expect(404, done);
  });

  it("如果没有中间件响应 Error 结果，且不传递 done 回调函数时，返回 500", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      ctx.next("test error");
    });
    const server = new Server(function (req, res) {
      app.handleRequest(req, res);
    });
    request(server)
      .get("/")
      .expect(500)
      .expect(/test error/, done);
  });

  it("支持捕捉中间件抛出的异常，并传递给出错处理中间件", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      throw new Error("oh error");
    });
    app.use("/", function (ctx) {
      throw new Error("不可能执行到此处");
    });
    app.use("/", function (ctx, err) {
      expect(err).to.instanceof(Error);
      expect(err).property("message").to.equal("oh error");
      ctx.response.end("no error");
    });
    request(app.server).get("/").expect(200).expect("no error", done);
  });

  it("支持捕捉 async function 中间件抛出的异常，并传递给出错处理中间件", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", async function (ctx) {
      throw new Error("oh error");
    });
    app.use("/", function (ctx, err) {
      expect(err).to.instanceof(Error);
      expect(err).property("message").to.equal("oh error");
      ctx.response.end("no error");
    });
    request(app.server).get("/").expect(200).expect("no error", done);
  });

  it("支持 URL 字符串前缀", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/a", function (ctx) {
      ctx.response.end("this is a");
    });
    app.use("/b", function (ctx) {
      ctx.response.end("this is b");
    });
    request(app.server).get("/b").expect(200).expect("this is b", done);
  });

  it("支持 URL 正则前缀", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use(/a/, function (ctx) {
      ctx.response.end("this is a");
    });
    app.use(/b/, function (ctx) {
      ctx.response.end("this is b");
    });
    request(app.server).get("/b").expect(200).expect("this is b", done);
  });

  it("use 支持多个中间件", function (done) {
    const app = new Application();
    appInstances.push(app);
    const status: any = {};
    app.use(
      "/",
      function (ctx) {
        status.a = true;
        ctx.next();
      },
      function (ctx) {
        status.b = true;
        ctx.response.end("ok");
      },
      function (ctx) {
        status.c = true;
        throw new Error("不应该执行到此处");
      },
    );
    request(app.server)
      .get("/")
      .expect(200)
      .expect("ok", function () {
        expect(status).to.deep.equal({
          a: true,
          b: true,
        });
        done();
      });
  });

  it("use 支持嵌套使用另一个 Application 实例", function (done) {
    const app = new Application();
    const app2 = new Application();
    appInstances.push(app);
    appInstances.push(app2);
    app2.use("/aaa", function (ctx) {
      ctx.response.end("aaa");
    });
    app.use("/", app2);
    app.use("/aaa", function (ctx) {
      throw new Error("不可能执行到此处");
    });
    request(app.server).get("/aaa").expect(200).expect("aaa", done);
  });

  it("所有中间件按照顺序执行，不符合执行条件会被跳过", function (done) {
    const app = new Application();
    appInstances.push(app);
    const status: any = {};
    app.use("/", function (ctx) {
      status.x = true;
      ctx.next();
    });
    app.use("/", function (ctx, err) {
      throw new Error("不可能执行到此处");
    });
    app.use("/a", function (ctx) {
      status.a = true;
      ctx.next();
    });
    app.use("/a/b", function (ctx) {
      status.ab = true;
      ctx.next();
    });
    app.use("/b", function (ctx) {
      status.b = true;
      ctx.next();
    });
    app.use("/b/b", function (ctx) {
      status.bb = true;
      ctx.next();
    });
    app.use("/b/b", function (ctx, err) {
      throw new Error("不可能执行到此处");
    });
    app.use("/c", function (ctx) {
      status.c = true;
      ctx.next();
    });
    app.use("/", function (ctx) {
      status.d = true;
      ctx.response.end("end");
    });
    request(app.server)
      .get("/b/b")
      .expect(200)
      .expect("end", function () {
        expect(status).to.deep.equal({
          x: true,
          b: true,
          bb: true,
          d: true,
        });
        done();
      });
  });

  it("支持 ctx.request.params 参数", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/prefix/:x/:y/:z", function (ctx) {
      expect(ctx.request.params).to.deep.equal({
        x: "hello",
        y: "world",
        z: "ok",
      });
      ctx.next();
    });
    app.use("/prefix/:a/:b/:c", function (ctx) {
      expect(ctx.request.params).to.deep.equal({
        a: "hello",
        b: "world",
        c: "ok",
      });
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.params));
    });
    request(app.server).get("/prefix/hello/world/ok").expect(200).expect(
      {
        a: "hello",
        b: "world",
        c: "ok",
      },
      done,
    );
  });

  it("支持使用 connect/express 中间件", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", fromClassicalHandle(bodyParser.json() as any));
    app.use("/", function (ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    request(app.server)
      .post("/")
      .send({
        a: 111,
        b: 222,
        c: 333,
      })
      .expect(200)
      .expect(
        {
          a: 111,
          b: 222,
          c: 333,
        },
        done,
      );
  });

  it("支持使用 connect/express 错误处理中间件", function (done) {
    const app = new Application();
    appInstances.push(app);
    app.use("/", function (ctx) {
      throw new Error("test error");
    });
    app.use(
      "/",
      fromClassicalErrorHandle(function (err, req, res, next) {
        expect(err).to.instanceof(Error);
        expect(err).property("message").to.equal("test error");
        res.end("no error");
      }),
    );
    request(app.server).get("/").expect(200).expect("no error", done);
  });

  it("use Application 和 Router 实例时，request.url & request.path 的值正确", async function () {
    const app = new Application();
    appInstances.push(app);
    const status = {
      a: false,
      b: false,
      c: false,
    };
    const router = new Router();
    app.use("/abc", function (ctx) {
      expect(ctx.request.path).to.equal("/abc/123/xx");
      expect(ctx.request.url).to.equal("/abc/123/xx?hello=world");
      status.a = true;
      ctx.next();
    });
    router.use("/123", function (ctx) {
      expect(ctx.request.path).to.equal("/123/xx");
      expect(ctx.request.url).to.equal("/123/xx?hello=world");
      status.b = true;
      ctx.next();
    });
    router.get("/123/:code", function (ctx) {
      expect(ctx.request.path).to.equal("/123/xx");
      expect(ctx.request.url).to.equal("/123/xx?hello=world");
      expect(ctx.request.params).to.deep.equal({ code: "xx" });
      expect(ctx.request.query).to.deep.equal({ hello: "world" });
      status.c = true;
      ctx.next();
    });
    app.use("/abc", router);
    app.use("/", function (ctx) {
      expect(ctx.request.path).to.equal("/abc/123/xx");
      expect(ctx.request.url).to.equal("/abc/123/xx?hello=world");
      ctx.response.end("it works");
    });
    await request(app.server).get("/abc/123/xx?hello=world").expect(200).expect("it works");
    expect(status).to.deep.equal({ a: true, b: true, c: true });
  });

  it("默认 Router", async function () {
    const app = new Application();
    appInstances.push(app);
    let isOk = false;
    app.use("/", function (ctx) {
      isOk = true;
      ctx.next();
    });
    app.router.get("/hello", function (ctx) {
      expect(isOk).to.equal(true);
      ctx.response.json({ ok: true });
    });
    await request(app.server).get("/hello").expect(200).expect({ ok: true });
  });
});
