import { Connect, fromClassicalHandle, Router } from "../lib";

function sleep(ms = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

const app = new Connect();
app.use(
  "/sleep",
  function(ctx) {
    console.log(ctx.request.method, ctx.request.url);
    ctx.next();
  },
  async function(ctx) {
    console.log(ctx.request.query, ctx.request.hasBody(), ctx.request.body);
    await sleep(1000);
    ctx.next();
  },
);
app.use(
  "/",
  fromClassicalHandle(function(req, res, next) {
    console.log(req.headers);
    next();
  }),
);

const router = new Router();
router.use("/", function(ctx) {
  console.log("router", ctx.request.method, ctx.request.url);
  ctx.next();
});
router.get("/hello/:a/:b", function(ctx) {
  ctx.response.setHeader("content-type", "application/json");
  ctx.response.end(JSON.stringify(ctx.request.params));
});
app.use("/", router);

console.log(app);
app.listen({ port: 3000 }, () => console.log("listening..."));
