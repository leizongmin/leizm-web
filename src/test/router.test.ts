// import { expect } from 'chai';
import { Connect, Router } from '../lib';
import * as request from 'supertest';

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

});
