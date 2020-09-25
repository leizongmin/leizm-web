/**
 * @leizm/web 中间件基础框架 - 性能测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Application, Router } from "../lib";

const app = new Application();
const router = new Router();
router.get("/params/:a", function (ctx) {
  ctx.response.end(`params: ${ctx.request.params.a}`);
});
router.get("/url", function (ctx) {
  ctx.response.end(`url: ${ctx.request.url}`);
});
router.get("/", function (ctx) {
  ctx.response.end("default");
});

app.use("/", router);
app.listen({ port: 3000 }, () => {
  console.log("listen on http://localhost:3000");
});
