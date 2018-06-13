import * as base from "@leizm/web";

export type MiddlewareHandle = (ctx: Context, err?: base.ErrorReason) => Promise<void> | void;

export class Connect extends base.Connect<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Router extends base.Router<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Context extends base.Context<Request, Response> {
  protected requestConstructor: base.RequestConstructor = Request;
  protected responseConstructor: base.ResponseConstructor = Response;
}

export class Request extends base.Request {
  // 扩展 Request
  public get ip() {
    return this.req.headers["x-real-ip"] || this.req.headers["x-forwarded-for"] || this.req.socket.remoteAddress;
  }
}

export class Response extends base.Response {
  // 扩展 Response
  public ok(data: any) {
    this.json({ data });
  }
  public error(error: message) {
    this.json({ error });
  }
}
