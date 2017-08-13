import { expect } from 'chai';
import { Connect } from '../lib';
import * as request from 'supertest';

describe('Request', function () {

  it('正确解析 query, url, path, search, httpVersion 等基本信息', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      expect(ctx.request.query).to.deep.equal({
        a: '123',
        b: '456',
      });
      expect(ctx.request.url).to.equal('/hello?a=123&b=456');
      expect(ctx.request.method).to.equal('GET');
      expect(ctx.request.path).to.equal('/hello');
      expect(ctx.request.search).to.equal('?a=123&b=456');
      expect(ctx.request.httpVersion).to.be.oneOf([ '1.0', '1.1', '2.0' ]);
      ctx.response.end('ok');
    });
    request(app.server)
      .get('/hello?a=123&b=456')
      .expect(200)
      .expect('ok', done);
  });

  it('正确获取 params 信息', function (done) {
    const app = new Connect();
    app.use('/:a/:b/ccc', function (ctx) {
      expect(ctx.request.hasParams()).to.equal(true);
      expect(ctx.request.params).to.deep.equal({
        a: 'aaa',
        b: 'bbb',
      });
      ctx.response.end('ok');
    });
    request(app.server)
      .get('/aaa/bbb/ccc')
      .expect(200)
      .expect('ok', done);
  });

  it('正确获取 headers, getHeader', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      expect(ctx.request.headers).property('user-agent').includes('superagent');
      expect(ctx.request.getHeader('USER-agent')).includes('superagent');
      ctx.response.end('ok');
    });
    request(app.server)
      .get('/hello')
      .expect(200)
      .expect('ok', done);
  });

  it('可以设置、获取、判断 body, files, cookies, session 等可选数据', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      {
        expect(ctx.request.body).to.deep.equal({});
        expect(ctx.request.hasBody()).to.equal(false);
        ctx.request.body = { a: 111 };
        expect(ctx.request.body).to.deep.equal({ a: 111 });
        expect(ctx.request.hasBody()).to.equal(true);
      }
      {
        expect(ctx.request.files).to.deep.equal({});
        expect(ctx.request.hasFiles()).to.equal(false);
        ctx.request.files = { a: 111 };
        expect(ctx.request.files).to.deep.equal({ a: 111 });
        expect(ctx.request.hasFiles()).to.equal(true);
      }
      {
        expect(ctx.request.cookies).to.deep.equal({});
        expect(ctx.request.hasCookies()).to.equal(false);
        ctx.request.cookies = { a: '111' };
        expect(ctx.request.cookies).to.deep.equal({ a: '111' });
        expect(ctx.request.hasCookies()).to.equal(true);
      }
      {
        expect(ctx.request.session).to.deep.equal({});
        expect(ctx.request.hasSession()).to.equal(false);
        ctx.request.session = { a: 111 };
        expect(ctx.request.session).to.deep.equal({ a: 111 });
        expect(ctx.request.hasSession()).to.equal(true);
      }
      ctx.response.end('ok');
    });
    request(app.server)
      .get('/hello')
      .expect(200)
      .expect('ok', done);
  });

});

describe('Response', function () {

  it('正确响应 setStatus, setHeader, setHeaders, writeHead, write, end', function (done) {
    const app = new Connect();
    app.use('/', function (ctx) {
      {
        ctx.response.setStatus(100);
        expect(ctx.response.res.statusCode).to.equal(100);
      }
      ctx.response.setHeader('aaa', 'hello aaa');
      ctx.response.setHeaders({
        bbb: 'hello bbb',
        ccc: 'hello ccc',
      });
      ctx.response.writeHead(500, {
        bbb: 'xxx',
        ddd: 'xxxx',
      });
      ctx.response.write('123');
      ctx.response.end('456');
    });
    request(app.server)
      .get('/hello')
      .expect(500)
      .expect('aaa', 'hello aaa')
      .expect('bbb', 'xxx')
      .expect('ccc', 'hello ccc')
      .expect('ddd', 'xxxx')
      .expect('123456', done);
  });

});
