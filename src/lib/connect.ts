import { Server, ServerRequest, ServerResponse } from 'http';
import * as pathToRegExp from 'path-to-regexp';
import * as finalhandler from 'finalhandler';
import { Context } from './context';
import {
  Middleware, MiddlewareHandle, ErrorReason, NextFunction, ListenOptions,
  ClassicalMiddlewareHandle, ClassicalMiddlewareErrorHandle,
} from './define';

export class Connect {

  protected readonly stack: Middleware[] = [];
  public readonly server: Server = new Server();

  public fromClassicalHandle(fn: ClassicalMiddlewareHandle): MiddlewareHandle {
    return function (ctx: Context) {
      fn(ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
    };
  }

  public fromClassicalErrorHandle(fn: ClassicalMiddlewareErrorHandle): MiddlewareHandle {
    return function (ctx: Context, err?: ErrorReason) {
      fn(err, ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
    };
  }

  public use(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    for (const handle of handles) {
      const info = pathToRegExp(route, { sensitive: true, strict: true, end: true });
      this.stack.push({ route: info, handle, handleError: handle.length > 1 });
    }
  }

  public handleRequest(req: ServerRequest, res: ServerResponse, done?: (err?: ErrorReason) => void) {
    done = done || finalhandler(req, res);
    let index = 0;
    let ctx: Context;
    type GetMiddlewareHandle = () => (void | Middleware);
    const getNextHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (handle.handleError) return getNextHandle();
      return handle;
    }
    const getNextErrorHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (!handle.handleError) return getNextErrorHandle();
      return handle;
    };
    const next: NextFunction = (err) => {
      const handle = err ? getNextErrorHandle() : getNextHandle();
      if (!handle) return done(err);
      let p;
      try {
        p = handle.handle(ctx, err);
      } catch (err) {
        return next(err);
      }
      if (p && this.isPromise(p)) {
        p.then(() => next()).catch(next);
      }
    };
    ctx = new Context(req, res, next);
    ctx.next();
  }

  public listen(options: ListenOptions, listeningListener?: () => void) {
    this.server.on('request', this.handleRequest.bind(this));
    this.server.listen(options, listeningListener);
  }

  protected isPromise(p: any) {
    return typeof p.then === 'function' && p.catch === 'function';
  }

}

