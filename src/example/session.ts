/**
 * @leizm/web 中间件基础框架 - 示例代码
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Connect, fromClassicalHandle, Router, component } from "../lib";

const app = new Connect();
app.use("/", component.cookieParser(""));
app.use(
  "/",
  component.session({
    store: new component.SessiionMemoryStore(),
    maxAge: 60000,
  }),
);

app.use("/", ctx => {
  // console.log(ctx.session);
  console.log(ctx.request.cookies);
  console.log(ctx.request.signedCookies);
  ctx.session!.data.c = ctx.session!.data.c || 0;
  ctx.session!.data.c++;
  ctx.response.json(ctx.session!.data);
});

app.listen({ port: 3000 }, () => console.log("listening..."));
