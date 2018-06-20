/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Connect, component } from "../lib";
import * as request from "supertest";
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

  it("SessionMemoryStore", async function() {
    const app = new Connect();
    appInstances.push(app);
    app.use("/", component.cookieParser());
    app.use("/", component.session({ store: new component.SessiionMemoryStore(), maxAge: 1000 }));
    app.use("/", function(ctx) {
      ctx.session!.data.counter = ctx.session!.data.counter || 0;
      ctx.session!.data.counter++;
      ctx.response.json(ctx.session!.data);
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

  it("SessionRedisStore with ioredis module", async function() {
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
      ctx.session!.data.counter = ctx.session!.data.counter || 0;
      ctx.session!.data.counter++;
      ctx.response.json(ctx.session!.data);
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

  it("SessionRedisStore with redis module", async function() {
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
      ctx.session!.data.counter = ctx.session!.data.counter || 0;
      ctx.session!.data.counter++;
      ctx.response.json(ctx.session!.data);
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
