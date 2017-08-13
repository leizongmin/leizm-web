import { expect } from 'chai';
import { Connect, Router, Context } from '../lib';
import * as request from 'supertest';

const METHODS = [ 'get', 'head', 'post', 'put', 'delete', 'connect', 'options', 'trace', 'patch' ];

describe('Router', function () {

  it('可以在 Connect.use 中直接使用', function (done) {
    const app = new Connect();
    const router = new Router();
    router.post('/ok', function (ctx) {
      ctx.response.end('yes');
    });
    app.use('/', router);
    request(app.server)
      .post('/ok')
      .expect(200)
      .expect('yes', done);
  });

  it('可以通过 Router.use 嵌套 Router', function (done) {
    const status: any = {};
    const app = new Connect();
    const router = new Router();
    const router2 = new Router();
    router2.post('/haha', function (ctx) {
      status.a = true;
      ctx.next();
    });
    router.use('/', router2);
    router.get('/haha', function (ctx) {
      status.b = true;
      ctx.next();
    });
    app.use('/', router);
    app.use('/', function (ctx) {
      ctx.response.end('ok');
    });
    request(app.server)
      .post('/haha')
      .expect(200)
      .expect('ok', function () {
        expect(status).to.deep.equal({
          a: true,
        });
        done();
      });
  });

  it('all 响应所有请求', async function () {
    const app = new Connect();
    const router = new Router();
    router.get('/', function (ctx) {
      throw new Error('不应该执行到此处');
    });
    router.all('/ok', function (ctx) {
      ctx.response.end('yes');
    });
    app.use('/', router);
    for (const method of METHODS) {
      if (method === 'connect') continue;
      await (request(app.server) as any)
        [method]('/ok')
        .expect(200)
        .expect(method === 'head' ? undefined : 'yes');
    }
  });

  it('注册各种请求方法', async function () {
    const app = new Connect();
    const router = new Router();
    function generateHandle(msg: string) {
      return function (ctx: Context) {
        ctx.response.end(msg);
      };
    }
    for (const method of METHODS) {
      (router as any)[method]('/xyz', generateHandle(`this is not ${ method }`));
    }
    for (const method of METHODS) {
      (router as any)[method]('/abc', generateHandle(`this is ${ method }`));
    }
    app.use('/', router);
    for (const method of METHODS) {
      if (method === 'connect') continue;
      await (request(app.server) as any)
        [method]('/abc')
        .expect(200)
        .expect(method === 'head' ? undefined : `this is ${ method }`);
    }
  });

});
