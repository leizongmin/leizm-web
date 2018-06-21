/**
 * @leizm/web 中间件基础框架 - 示例代码
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as base from "../lib";

////////////////////////////////////////////////////////////////////////////////
export class Context1 extends base.Context<Request1, Response1> {
  protected requestConstructor: base.RequestConstructor = Request1;
  protected responseConstructor: base.ResponseConstructor = Response1;
  public method1() {}
}

export class Request1 extends base.Request {
  public method1() {}
}

export class Response1 extends base.Response {
  public method1() {}
}

////////////////////////////////////////////////////////////////////////////////
export class Context2 extends base.Context<Request2, Response2> {
  protected requestConstructor: base.RequestConstructor = Request2;
  protected responseConstructor: base.ResponseConstructor = Response2;
  public method2() {}
}

export class Request2 extends base.Request {
  public method2() {}
}

export class Response2 extends base.Response {
  public method2() {}
}

////////////////////////////////////////////////////////////////////////////////
export class Connect extends base.Connect<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Router extends base.Router<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Context extends base.Context<Request, Response> {
  protected requestConstructorList = [Request1, Request2];
  protected responseConstructorList = [Response1, Response2];
  public method1() {}
}

export class Request extends base.Request {
  public method1() {}
}

export class Response extends base.Response {
  public method1() {}
}
