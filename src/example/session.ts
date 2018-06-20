/**
 * @leizm/web 中间件基础框架 - 示例代码
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Connect, fromClassicalHandle, Router, component } from "../lib";
import * as Redis from "ioredis";
import { createClient } from "redis";

const redis1 = new Redis();
const redis2 = createClient();

const app = new Connect();
app.use("/", component.cookieParser(""));
app.use(
  "/a",
  component.session({
    store: new component.SessiionRedisStore({ client: redis1 as any }),
    maxAge: 60000,
  }),
);
app.use(
  "/b",
  component.session({
    store: new component.SessiionRedisStore({ client: redis2 }),
    maxAge: 60000,
  }),
);

app.use("/", async ctx => {
  // console.log(ctx.session);
  console.log(ctx.request.cookies);
  console.log(ctx.request.signedCookies);
  ctx.session!.data.c = ctx.session!.data.c || 0;
  ctx.session!.data.c++;
  // await ctx.session!.reload();
  ctx.response.json(ctx.session!.data);
});

app.listen({ port: 3000 }, () => console.log("listening..."));
