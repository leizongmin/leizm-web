/**
 * @leizm/web 中间件基础框架 - 示例代码
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as base from "../lib";
export * from "../lib";

export type MiddlewareHandle = (ctx: Context, err?: base.ErrorReason) => Promise<void> | void;

export class Application extends base.Application<Context> {
  protected contextConstructor = Context;
}

export class Router extends base.Router<Context> {
  protected contextConstructor = Context;
}

export class Context extends base.Context<Request, Response> {
  protected requestConstructor = Request;
  protected responseConstructor = Response;
}

export class Request extends base.Request {
  // 扩展 Request
  public get remoteIP() {
    return String(
      this.req.headers["x-real-ip"] || this.req.headers["x-forwarded-for"] || this.req.socket.remoteAddress,
    );
  }
}

export class Response extends base.Response {
  // 扩展 Response
  public ok(data: any) {
    this.json({ data });
  }
  public error(error: string) {
    this.json({ error });
  }
}
