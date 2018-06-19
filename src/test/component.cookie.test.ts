import { expect } from "chai";
import { Connect, component } from "../lib";
import * as request from "supertest";
import { sign as signCookie } from "cookie-signature";

describe("component.cookie", function() {
  it("解析一般的Cookie", function(done) {
    const app = new Connect();
    app.use("/", component.cookieParser("test"));
    app.use("/", function(ctx) {
      expect(ctx.request.cookies).to.deep.equal({
        a: "123",
        b: "今天的天气真好",
      });
      expect(ctx.request.signedCookies).to.deep.equal({});
      ctx.response.cookie("c", { x: 1, y: 2 });
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .set("cookie", `a=${encodeURIComponent("123")}; b=${encodeURIComponent("今天的天气真好")}`)
      .expect(200)
      .expect("Set-Cookie", "c=j%3A%7B%22x%22%3A1%2C%22y%22%3A2%7D; Path=/")
      .expect("ok", done);
  });

  it("解析签名的Cookie", function(done) {
    const app = new Connect();
    app.use("/", component.cookieParser("test"));
    app.use("/", function(ctx) {
      // console.log(ctx.request.cookies, ctx.request.signedCookies);
      expect(ctx.request.cookies).to.deep.equal({});
      expect(ctx.request.signedCookies).to.deep.equal({
        a: "123",
        b: "今天的天气真好",
      });
      ctx.response.cookie("c", { x: 1, y: 2 }, { signed: true });
      ctx.response.end("ok");
    });
    request(app.server)
      .get("/hello")
      .set(
        "cookie",
        `a=s:${encodeURIComponent(signCookie("123", "test"))}; b=s:${encodeURIComponent(
          signCookie("今天的天气真好", "test"),
        )}`,
      )
      .expect(200)
      .expect(
        "Set-Cookie",
        `c=${encodeURIComponent(`s:${signCookie(`j:${JSON.stringify({ x: 1, y: 2 })}`, "test")}`)}; Path=/`,
      )
      .expect("ok", done);
  });
});
