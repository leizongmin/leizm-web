import * as web from "../lib";

const app = new web.Connect();
app.templateEngine.initEjs();

app.router.get("/", async function(ctx) {
  ctx.response.render("index", { msg: "hello, world" });
});

app.router.get("/err", async function(ctx) {
  throw new Error(`haha ${new Date()}`);
});

app.listen({ port: 3000 });
