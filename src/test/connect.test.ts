import { expect } from 'chai';
import { Server } from 'http';
import { Connect } from '../lib';
import * as request from 'supertest';

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

});
