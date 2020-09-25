import * as web from "../lib";

const app = new web.Application();
app.templateEngine.initEjs();

app.router.get("/", async function (ctx) {
  ctx.response.render("index", { msg: "hello, world" });
});

app.listen({ port: 3000 });
