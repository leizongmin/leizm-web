import { Connect } from '../lib';

function sleep(ms = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

const app = new Connect();
app.use('/sleep', async function (ctx) {
  console.log(ctx.request.query, ctx.request.hasBody(), ctx.request.body);
  await sleep(1000);
  ctx.next();
});
app.use('/', app.fromClassicalHandle(function (req, res, next) {
  console.log(req.headers);
  next();
}));
app.use('/hello/:a/:b', function (ctx) {
  ctx.response.send(ctx.request.params);
});
console.log(app);
app.listen({ port: 3000 }, () => console.log('listening...'));

