const web = require("@leizm/web");

const app = new web.Application();

app.use("/", ctx => {
  ctx.response.html("<h1>It works!</h1>");
});

app.listen({ port: 3000 });
