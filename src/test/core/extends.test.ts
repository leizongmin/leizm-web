/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { expect } from "chai";
import * as request from "supertest";
import * as bodyParser from "body-parser";
import { Application, Router, Context, Request, Response, fromClassicalHandle } from "../../lib";

////////////////////////////////////////////////////////////////////////
// 扩展的 Request 对象
class MyRequest extends Request {
  public isInited = false;
  public getBody() {
    return this.body;
  }
  public inited() {
    this.isInited = true;
  }
}

// 扩展的 Response 对象
class MyResponse extends Response {
  public isInited = false;
  public sendJSON(data: any) {
    this.setHeader("content-type", "application/json");
    this.end(JSON.stringify(data));
  }
  public inited() {
    this.isInited = true;
  }
}

// 扩展 Context 对象
class MyContext extends Context<MyRequest, MyResponse> {
  protected requestConstructor = MyRequest;
  protected responseConstructor = MyResponse;
  public isInited = false;
  public getHello(msg: string) {
    return `hello ${msg}`;
  }
  public inited() {
    this.isInited = true;
  }
}

// 扩展 Application 对象
class MyApplication extends Application<MyContext> {
  protected contextConstructor = MyContext;
}

// 扩展 Router 对象
class MyRouter extends Router<MyContext> {
  protected contextConstructor = MyContext;
}
////////////////////////////////////////////////////////////////////////

describe("可扩展性", function () {
  it("支持扩展 Application", function (done) {
    const app = new MyApplication();
    app.use("/", fromClassicalHandle(bodyParser.json() as any));
    app.use("/", function (ctx) {
      expect(ctx.getHello("aa")).to.equal("hello aa");
      expect(ctx.request.getBody()).to.deep.equal({ a: 111, b: 222 });
      expect(ctx.isInited).to.equal(true);
      expect(ctx.request.isInited).to.equal(true);
      expect(ctx.response.isInited).to.equal(true);
      ctx.response.sendJSON({ hello: "world" });
    });
    request(app.server).post("/").send({ a: 111, b: 222 }).expect(200).expect({ hello: "world" }, done);
  });

  it("支持扩展 Router", function (done) {
    const app = new MyApplication();
    const router = new MyRouter();
    app.use("/", fromClassicalHandle(bodyParser.json() as any));
    router.post("/", function (ctx) {
      expect(ctx.getHello("aa")).to.equal("hello aa");
      expect(ctx.request.getBody()).to.deep.equal({ a: 111, b: 222 });
      expect(ctx.isInited).to.equal(true);
      expect(ctx.request.isInited).to.equal(true);
      expect(ctx.response.isInited).to.equal(true);
      ctx.response.sendJSON({ hello: "world" });
    });
    app.use("/", router);
    request(app.server).post("/").send({ a: 111, b: 222 }).expect(200).expect({ hello: "world" }, done);
  });
});
