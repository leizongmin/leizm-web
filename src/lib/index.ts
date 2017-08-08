import { Server, ServerRequest, ServerResponse } from 'http';
import { parse  as parseUrl } from 'url';
import * as pathToRegExp from 'path-to-regexp';
import * as finalhandler from 'finalhandler';

export type ErrorReason = null | string | Error | Record<any, any>;

export class Context {

  public error: ErrorReason = null;
  public path: string;
  public url: string;
  public queryString: string;
  public query: Record<string, any>;
  public params: Record<string, any>;
  public body: Record<string, any>;
  public files: Record<string, any>;
  public cookies: Record<string, any>;
  public session: Record<string, any>;

  constructor(
    public readonly req: ServerRequest,
    public readonly res: ServerResponse,
    protected readonly _next: (err?: ErrorReason) => void,
  ) {
    const urlInfo = parseUrl(req.url, true);
    this.query = urlInfo.query;
    this.path = urlInfo.pathname;
    this.queryString = urlInfo.search.slice(1);
  }

  public next(err?: ErrorReason) {
    if (err) {
      this.error = err;
    }
  }

}

export type Handle = (ctx: Context) => Promise<void> | void;

export interface Middleware {
  route: string | RegExp;
  handle: Handle;
}

export class Connect {

  protected readonly stack: Middleware[] = [];

  public use(route: string | RegExp, handle: Handle) {
    const info = pathToRegExp(route, { sensitive: true, strict: true, end: true });
    this.stack.push({ route: info, handle });
  }

  public handleRequest(req: ServerRequest, res: ServerResponse, next?: (err?: ErrorReason) => void) {
    next = next || finalhandler(req, res);
    let index = 0;
    const ctx = new Context(req, res, (err?: ErrorReason) => {

    });
  }

}
