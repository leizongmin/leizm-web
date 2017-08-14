import { expect } from 'chai';
import * as request from 'supertest';
import * as bodyParser from 'body-parser';
import {
  Connect, Context, ContextConstructor, RequestConstructor, ResponseConstructor,
  Request, Response, fromClassicalHandle,
} from '../lib';

type ErrorReason = null | string | Error | Record<any, any>;
type MiddlewareHandle = (ctx: MyContext, err?: ErrorReason) => Promise<void> | void;

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
  public use(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(true, route, ...handles);
  }
}

describe('Context', function () {

  it('支持扩展 Connect 和 Context 上的方法', function (done) {
    const app = new MyConnect();
    app.use('/', fromClassicalHandle(bodyParser.json()));
    app.use('/', function (ctx) {
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

});
