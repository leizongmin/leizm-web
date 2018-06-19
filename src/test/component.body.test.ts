/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

// import { expect } from "chai";
import { Connect, component } from "../lib";
import * as request from "supertest";

describe("component.body", function() {
  const appInstances: Connect[] = [];
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  it("json", async function() {
    const app = new Connect();
    appInstances.push(app);
    app.use("/", component.bodyParser.json());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
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
  });

  it("urlencoded", async function() {
    const app = new Connect();
    appInstances.push(app);
    app.use("/", component.bodyParser.urlencoded({ extended: false }));
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "application/x-www-form-urlencoded")
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
  });

  it("text", async function() {
    const app = new Connect();
    appInstances.push(app);
    app.use("/", component.bodyParser.text());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "text/plain")
      .send("hello, world")
      .expect(200)
      .expect(`"hello, world"`);
  });

  it("raw", async function() {
    const app = new Connect();
    appInstances.push(app);
    app.use("/", component.bodyParser.raw());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify((ctx.request.body as Buffer).toJSON()));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "application/octet-stream")
      .send("hello, world")
      .expect(200)
      .expect(JSON.stringify(Buffer.from("hello, world").toJSON()));
  });
});
