import { expect } from "chai";
import { Connect, fromClassicalHandle } from "../lib";
import * as request from "supertest";
import * as cookieParser from "cookie-parser";
import { sign as signCookie } from "cookie-signature";

describe("Request", function() {
  it("正确解析 query, url, path, search, httpVersion 等基本信息", function(done) {
    const app = new Connect();
    app.use("/", function(ctx) {
      expect(ctx.request.query).to.deep.equal({
        a: "123",
        b: "456"
      });
      expect(ctx.request.url).to.equal("/hello?a=123&b=456");
      expect(ctx.request.method).to.equal("GET");
      expect(ctx.request.path).to.equal("/hello");
      expect(ctx.request.search).to.equal("?a=123&b=456");
      expect(ctx.request.httpVersion).to.be.oneOf(["1.0", "1.1", "2.0"]);
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello?a=123&b=456")
      .expect(200)
      .expect("ok", done);
  });

  it("正确获取 params 信息", function(done) {
    const app = new Connect();
    app.use("/:a/:b/ccc", function(ctx) {
      expect(ctx.request.hasParams()).to.equal(true);
      expect(ctx.request.params).to.deep.equal({
        a: "aaa",
        b: "bbb"
      });
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/aaa/bbb/ccc")
      .expect(200)
      .expect("ok", done);
  });

  it("正确获取 headers, getHeader", function(done) {
    const app = new Connect();
    app.use("/", function(ctx) {
      expect(ctx.request.headers)
        .property("user-agent")
        .includes("superagent");
      expect(ctx.request.getHeader("USER-agent")).includes("superagent");
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .expect(200)
      .expect("ok", done);
  });

  it("可以设置、获取、判断 body, files, cookies, session 等可选数据", function(done) {
    const app = new Connect();
    app.use("/", function(ctx) {
      {
        expect(ctx.request.body).to.deep.equal({});
        expect(ctx.request.hasBody()).to.equal(false);
        ctx.request.body = { a: 111 };
        expect(ctx.request.body).to.deep.equal({ a: 111 });
        expect(ctx.request.hasBody()).to.equal(true);
      }
      {
        expect(ctx.request.files).to.deep.equal({});
        expect(ctx.request.hasFiles()).to.equal(false);
        ctx.request.files = { a: 111 };
        expect(ctx.request.files).to.deep.equal({ a: 111 });
        expect(ctx.request.hasFiles()).to.equal(true);
      }
      {
        expect(ctx.request.cookies).to.deep.equal({});
        expect(ctx.request.hasCookies()).to.equal(false);
        ctx.request.cookies = { a: "111" };
        expect(ctx.request.cookies).to.deep.equal({ a: "111" });
        expect(ctx.request.hasCookies()).to.equal(true);
      }
      {
        expect(ctx.request.session).to.deep.equal({});
        expect(ctx.request.hasSession()).to.equal(false);
        ctx.request.session = { a: 111 };
        expect(ctx.request.session).to.deep.equal({ a: 111 });
        expect(ctx.request.hasSession()).to.equal(true);
      }
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .expect(200)
      .expect("ok", done);
  });
});

describe("Response", function() {
  it("正确响应 setStatus, setHeader, setHeaders, writeHead, write, end", function(done) {
    const app = new Connect();
    app.use("/", function(ctx) {
      {
        ctx.response.setStatus(100);
        expect(ctx.response.res.statusCode).to.equal(100);
      }
      ctx.response.setHeader("aaa", "hello aaa").setHeaders({
        bbb: "hello bbb",
        ccc: "hello ccc"
      });
      {
        ctx.response
          .appendHeader("t111", 1)
          .appendHeader("t111", "hello")
          .appendHeader("t111", ["a", "123"]);
        expect(ctx.response.getHeader("t111")).to.deep.equal([
          1,
          "hello",
          "a",
          "123"
        ]);
        ctx.response.setHeader("t222", ["a", "b"]).appendHeader("t222", "c");
        expect(ctx.response.getHeader("t222")).to.deep.equal(["a", "b", "c"]);
        expect(ctx.response.getHeaders()).to.deep.equal({
          aaa: "hello aaa",
          bbb: "hello bbb",
          ccc: "hello ccc",
          t111: [1, "hello", "a", "123"],
          t222: ["a", "b", "c"]
        });
      }
      {
        ctx.response.setHeader("xxx", 123);
        expect(ctx.response.getHeader("XXX")).to.equal(123);
        ctx.response.removeHeader("xxx");
        expect(ctx.response.getHeader("xxx")).to.equal(undefined);
      }
      ctx.response
        .writeHead(500, {
          bbb: "xxx",
          ddd: "xxxx"
        })
        .write("123");
      ctx.response.end("456");
    });
    request(app.server)
      .get("/hello")
      .expect(500)
      .expect("aaa", "hello aaa")
      .expect("bbb", "xxx")
      .expect("ccc", "hello ccc")
      .expect("ddd", "xxxx")
      .expect("123456", done);
  });

  it("json() 和 html()", async function() {
    const app = new Connect();
    app.use("/json", function(ctx) {
      ctx.response.json({ a: 123, b: 456 });
    });
    app.use("/html", function(ctx) {
      ctx.response.html("hello, world");
    });

    await request(app.server)
      .get("/json")
      .expect(200, { a: 123, b: 456 });
    await request(app.server)
      .get("/html")
      .expect(200, "hello, world");
  });
});

describe("Context", function() {
  it("ctx.request.ctx 和 ctx.response.ctx", function(done) {
    const app = new Connect();
    app.use("/", function(ctx) {
      expect(ctx.request.ctx).to.equal(ctx);
      expect(ctx.response.ctx).to.equal(ctx);
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .expect(200)
      .expect("ok", done);
  });

  it("支持 ctx.onFinsh()", function(done) {
    const app = new Connect();
    let isFinish = false;
    app.use("/", function(ctx) {
      ctx.onFinish(() => (isFinish = true));
      ctx.next();
    });
    app.use("/", function(ctx) {
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .expect(200)
      .expect("ok", err => {
        expect(isFinish).to.equal(true);
        done(err);
      });
  });

  it("支持 ctx.onError() -- throw new Error", function(done) {
    const app = new Connect();
    let isError = false;
    app.use("/", function(ctx) {
      ctx.onError(err => {
        isError = true;
        expect(err).to.instanceof(Error);
        expect((err as any).message).to.equal("haha");
      });
      ctx.next();
    });
    app.use("/", async function(ctx) {
      throw new Error("haha");
    });
    request(app.server)
      .get("/hello")
      .expect(500, err => {
        expect(isError).to.equal(true);
        done(err);
      });
  });

  it("支持 ctx.onError() -- ctx.next(new Error())", function(done) {
    const app = new Connect();
    let isError = false;
    app.use("/", function(ctx) {
      ctx.onError(err => {
        isError = true;
        expect(err).to.instanceof(Error);
        expect((err as any).message).to.equal("haha");
      });
      ctx.next();
    });
    app.use("/", function(ctx) {
      ctx.next(new Error("haha"));
    });
    request(app.server)
      .get("/hello")
      .expect(500, err => {
        expect(isError).to.equal(true);
        done(err);
      });
  });
});

describe("Cookie", function() {
  it("解析一般的Cookie", function(done) {
    const app = new Connect();
    app.use("/", fromClassicalHandle(cookieParser("test")));
    app.use("/", function(ctx) {
      expect(ctx.request.cookies).to.deep.equal({
        a: "123",
        b: "今天的天气真好"
      });
      expect(ctx.request.signedCookies).to.deep.equal({});
      ctx.response.cookie("c", { x: 1, y: 2 });
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .set(
        "cookie",
        `a=${encodeURIComponent("123")}; b=${encodeURIComponent(
          "今天的天气真好"
        )}`
      )
      .expect(200)
      .expect("Set-Cookie", "c=j%3A%7B%22x%22%3A1%2C%22y%22%3A2%7D; Path=/")
      .expect("ok", done);
  });

  it("解析签名的Cookie", function(done) {
    const app = new Connect();
    app.use("/", fromClassicalHandle(cookieParser("test")));
    app.use("/", function(ctx) {
      // console.log(ctx.request.cookies, ctx.request.signedCookies);
      expect(ctx.request.cookies).to.deep.equal({});
      expect(ctx.request.signedCookies).to.deep.equal({
        a: "123",
        b: "今天的天气真好"
      });
      ctx.response.cookie("c", { x: 1, y: 2 }, { signed: true });
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .set(
        "cookie",
        `a=s:${encodeURIComponent(
          signCookie("123", "test")
        )}; b=s:${encodeURIComponent(signCookie("今天的天气真好", "test"))}`
      )
      .expect(200)
      .expect(
        "Set-Cookie",
        `c=${encodeURIComponent(
          `s:${signCookie(`j:${JSON.stringify({ x: 1, y: 2 })}`, "test")}`
        )}; Path=/`
      )
      .expect("ok", done);
  });
});
