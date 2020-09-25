/**
 * @leizm/web 中间件基础框架 - 性能测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Application } from "../lib";

const app = new Application();
app.use("/params/:a", function (ctx) {
  ctx.response.end(`params: ${ctx.request.params.a}`);
});
app.use("/url", function (ctx) {
  ctx.response.end(`url: ${ctx.request.url}`);
});
app.use("/", function (ctx) {
  ctx.response.end("default");
});

app.listen({ port: 3000 }, () => {
  console.log("listen on http://localhost:3000");
});
