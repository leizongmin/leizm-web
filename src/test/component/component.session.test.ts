/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Connect, component } from "../../lib";
import { SimpleRedisClient } from "../../lib/module";
import * as request from "supertest";
import { expect } from "chai";
import * as Redis from "ioredis";
import { createClient } from "redis";

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe("component.session", function() {
  const appInstances: Connect[] = [];
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  describe("多存储引擎", function() {
    it("SessionMemoryStore", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ store: new component.SessiionMemoryStore(), maxAge: 1000 }));
      app.use("/", function(ctx) {
        ctx.session.data.counter = ctx.session.data.counter || 0;
        ctx.session.data.counter++;
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
      await agent.get("/").expect(200, { counter: 3 });
      await agent.get("/").expect(200, { counter: 4 });
      await agent.get("/").expect(200, { counter: 5 });
      await sleep(1500);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
    });

    it("SessionRedisStore 基于 ioredis 模块", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      const client = new Redis();
      const prefix = `test:sess:${Date.now()}:${Math.random()}:`;
      app.use(
        "/",
        component.session({
          store: new component.SessiionRedisStore({ client: client as any, prefix }),
          maxAge: 1000,
        }),
      );
      app.use("/", function(ctx) {
        ctx.session.data.counter = ctx.session.data.counter || 0;
        ctx.session.data.counter++;
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
      await agent.get("/").expect(200, { counter: 3 });
      await agent.get("/").expect(200, { counter: 4 });
      await agent.get("/").expect(200, { counter: 5 });
      await sleep(1500);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
    });

    it("SessionRedisStore 基于 redis 模块", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      const client = createClient();
      const prefix = `test:sess:${Date.now()}:${Math.random()}:`;
      app.use(
        "/",
        component.session({
          store: new component.SessiionRedisStore({ client, prefix }),
          maxAge: 1000,
        }),
      );
      app.use("/", function(ctx) {
        ctx.session.data.counter = ctx.session.data.counter || 0;
        ctx.session.data.counter++;
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
      await agent.get("/").expect(200, { counter: 3 });
      await agent.get("/").expect(200, { counter: 4 });
      await agent.get("/").expect(200, { counter: 5 });
      await sleep(1500);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
    });

    it("SessionRedisStore 基于内置 SimpleRedisClient 模块", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      const client = new SimpleRedisClient();
      const prefix = `test:sess:${Date.now()}:${Math.random()}:`;
      app.use(
        "/",
        component.session({
          store: new component.SessiionRedisStore({ client, prefix }),
          maxAge: 1000,
        }),
      );
      app.use("/", function(ctx) {
        ctx.session.data.counter = ctx.session.data.counter || 0;
        ctx.session.data.counter++;
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
      await agent.get("/").expect(200, { counter: 3 });
      await agent.get("/").expect(200, { counter: 4 });
      await agent.get("/").expect(200, { counter: 5 });
      await sleep(1500);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
    });

    it("SessionRedisStore 不指定 Redis 客户端，使用内置 SimpleRedisClient 模块", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      const prefix = `test:sess:${Date.now()}:${Math.random()}:`;
      app.use(
        "/",
        component.session({
          store: new component.SessiionRedisStore({ prefix }),
          maxAge: 1000,
        }),
      );
      app.use("/", function(ctx) {
        ctx.session.data.counter = ctx.session.data.counter || 0;
        ctx.session.data.counter++;
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
      await agent.get("/").expect(200, { counter: 3 });
      await agent.get("/").expect(200, { counter: 4 });
      await agent.get("/").expect(200, { counter: 5 });
      await sleep(1500);
      await agent.get("/").expect(200, { counter: 1 });
      await agent.get("/").expect(200, { counter: 2 });
    });
  });

  describe("session操作相关方法", function() {
    it("session.reload()", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ maxAge: 1000 }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        await ctx.session.save();
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        expect(ctx.session.data).to.deep.equal({ yes: false });
        ctx.session.data.yes = true;
        expect(ctx.session.data).to.deep.equal({ yes: true });
        await ctx.session.reload();
        expect(ctx.session.data).to.deep.equal({ yes: false });
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, { yes: false });
    });

    it("session.regenerate()", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ maxAge: 1000 }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        await ctx.session.save();
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        expect(ctx.session.data).to.deep.equal({ yes: false });
        ctx.session.data.yes = true;
        expect(ctx.session.data).to.deep.equal({ yes: true });
        await ctx.session.regenerate();
        expect(ctx.session.data).to.deep.equal({});
        ctx.session.data.no = true;
        ctx.response.json(ctx.session.data);
      });
      app.use("/c", async function(ctx) {
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, { no: true });
      await agent.get("/c").expect(200, { no: true });
    });

    it("session.destroy()", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ maxAge: 1000 }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        await ctx.session.save();
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        expect(ctx.session.data).to.deep.equal({ yes: false });
        await ctx.session.destroy();
        expect(ctx.session.data).to.deep.equal({});
        ctx.response.json(ctx.session.data);
      });
      app.use("/c", async function(ctx) {
        expect(ctx.session.data).to.deep.equal({});
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, {});
      await agent.get("/c").expect(200, {});
    });

    it("session.touch()", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ maxAge: 2000 }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        await ctx.session.save();
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, { yes: false });
      await sleep(800);
      await agent.get("/b").expect(200, { yes: false });
      await sleep(800);
      await agent.get("/b").expect(200, { yes: false });
      await sleep(2000);
      await agent.get("/b").expect(200, {});
    }).timeout(5000);
  });

  describe("其他选项", function() {
    it("自定义Cookie名称", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser());
      app.use("/", component.session({ maxAge: 1000, name: "hello" }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        expect(ctx.session.id).to.equal(ctx.request.cookies.hello);
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, { yes: false });
    });

    it("自定义Cookie选项：{ signed: true }", async function() {
      const app = new Connect();
      appInstances.push(app);
      app.use("/", component.cookieParser("secret key"));
      app.use("/", component.session({ maxAge: 1000, name: "hello", cookie: { signed: true } }));
      app.use("/a", async function(ctx) {
        ctx.session.data.yes = false;
        ctx.response.json(ctx.session.data);
      });
      app.use("/b", async function(ctx) {
        expect(ctx.session.id).to.equal(ctx.request.signedCookies.hello);
        ctx.response.json(ctx.session.data);
      });
      const agent = request.agent(app.server);
      await agent.get("/a").expect(200, { yes: false });
      await agent.get("/b").expect(200, { yes: false });
    });
  });
});
