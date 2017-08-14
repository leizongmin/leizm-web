import { expect } from 'chai';
import * as request from 'supertest';
import * as bodyParser from 'body-parser';
import {
  Connect, Router, Context, Request, Response,
  ContextConstructor, RequestConstructor, ResponseConstructor, fromClassicalHandle,
} from '../lib';

class MyRequest extends Request {
  public getBody() {
    return this.body;
  }
}

class MyResponse extends Response {
  public sendJSON(data: any) {
    this.setHeader('content-type', 'application/json');
    this.end(JSON.stringify(data));
  }
}

class MyContext extends Context {
  protected requestConstructor: RequestConstructor = MyRequest;
  protected responseConstructor: ResponseConstructor = MyResponse;
  public request: MyRequest;
  public response: MyResponse;
  public getHello(msg: string) {
    return `hello ${ msg }`;
  }
}

class MyConnect extends Connect {
  protected contextConstructor: ContextConstructor = MyContext;
}

class MyRouter extends Router {
  protected contextConstructor: ContextConstructor = MyContext;
}

describe('可扩展性', function () {

  it('支持扩展 Connect', function (done) {
    const app = new MyConnect();
    app.use('/', fromClassicalHandle(bodyParser.json()));
    app.use('/', function (ctx: MyContext) {
      expect(ctx.getHello('aa')).to.equal('hello aa');
      expect(ctx.request.getBody()).to.deep.equal({ a: 111, b: 222 });
      ctx.response.sendJSON({ hello: 'world' });
    });
    request(app.server)
      .post('/')
      .send({ a: 111, b: 222})
      .expect(200)
      .expect({ hello: 'world' }, done);
  });

  it('支持扩展 Router', function (done) {
    const app = new MyConnect();
    const router = new MyRouter();
    app.use('/', fromClassicalHandle(bodyParser.json()));
    router.post('/', function (ctx: MyContext) {
      expect(ctx.getHello('aa')).to.equal('hello aa');
      expect(ctx.request.getBody()).to.deep.equal({ a: 111, b: 222 });
      ctx.response.sendJSON({ hello: 'world' });
    });
    app.use('/', router);
    request(app.server)
      .post('/')
      .send({ a: 111, b: 222})
      .expect(200)
      .expect({ hello: 'world' }, done);
  });

});
