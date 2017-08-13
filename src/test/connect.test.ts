import { expect } from 'chai';
import { Server } from 'http';
import { Connect } from '../lib';
import * as request from 'supertest';

function sleep(ms: number): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(ms), ms);
  });
}

describe('Connect', function () {

  it('封装了 http.Server', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      ctx.response.end('ok');
    });
    expect(app.server).to.instanceof(Server);
    request(app.server)
      .get('/')
      .expect(200)
      .expect('ok', done);
  });

  it('listen', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      ctx.response.end('ok');
    });
    app.listen({ port: 0 });
    request(app.server)
      .get('/')
      .expect(200)
      .expect('ok', done);
  });

  it('支持在 http.createServer 内使用', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      ctx.response.end('ok');
    });
    const server = new Server(function (req, res) {
      app.handleRequest(req, res);
    });
    request(server)
      .get('/')
      .expect(200)
      .expect('ok', done);
  });

  it('支持 async function', function (done) {
    const app = new Connect();
    app.use('/', async function (ctx) {
      await sleep(500);
      ctx.response.end('ok');
    });
    const t = process.uptime();
    request(app.server)
      .get('/')
      .expect(200)
      .expect('ok', function () {
        expect(process.uptime() - t).to.greaterThan(0.5);
        done();
      });
  });

  it('如果没有中间件响应结果，调用 done 回调函数', function (done) {
    const app = new Connect();
    const server = new Server(function (req, res) {
      app.handleRequest(req, res, function (err) {
        expect(err).to.equal(null);
        res.end('hello');
      });
    });
    request(server)
      .get('/')
      .expect(200)
      .expect('hello', done);
  });

  it('如果没有中间件响应 Error 结果，调用 done 回调函数时传递 Error 信息', function (done) {
    const app = new Connect();
    const server = new Server(function (req, res) {
      app.use('/', function (ctx) {
        ctx.next('test error');
      });
      app.handleRequest(req, res, function (err) {
        expect(err).to.equal('test error');
        res.end('hello');
      });
    });
    request(server)
      .get('/')
      .expect(200)
      .expect('hello', done);
  });

});
