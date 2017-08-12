import { Connect } from '../lib';

const app = new Connect();
app.use('/', async function (ctx) {
  console.log(ctx.request.query);
  ctx.next();
});
app.listen({ port: 3000 }, () => console.log('listening...'));

