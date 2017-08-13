import { ServerRequest, ServerResponse } from 'http';
import { Context } from './context';
import {
  Middleware, MiddlewareHandle, ErrorReason, NextFunction, PathRegExp, ContextConstructor,
} from './define';
import {
  testRoute, parseRoute, getRouteParams, isMiddlewareErrorHandle, execMiddlewareHandle,
} from './utils';

export class BaseConnect {

  protected readonly stack: Middleware[] = [];
  protected contextConstructor: ContextConstructor = Context;

  protected createContext(req: ServerRequest, res: ServerResponse) {
    return new this.contextConstructor(req, res);
  }

  protected useMiddleware(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    const info = parseRoute(route);
    for (const handle of handles) {
      this.stack.push({ route: info, handle, handleError: isMiddlewareErrorHandle(handle) });
    }
  }

  protected handleRequestByContext(ctx: Context, done: (err?: ErrorReason) => void) {
    let index = 0;
    type GetMiddlewareHandle = () => (void | Middleware);
    const getNextHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (handle.handleError) return getNextHandle();
      return handle;
    };
    const getNextErrorHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (!handle.handleError) return getNextErrorHandle();
      return handle;
    };
    const next: NextFunction = (err) => {
      const handle = err ? getNextErrorHandle() : getNextHandle();
      err = err || null;
      if (!handle) {
        ctx.popNextHandle();
        return done(err || null);
      }
      if (!testRoute(ctx.request.path, handle.route)) return next(err);
      if (handle.route instanceof RegExp) {
        ctx.request.params = getRouteParams(ctx.request.path, handle.route as PathRegExp);
      } else {
        ctx.request.params = {};
      }
      execMiddlewareHandle(handle.handle, ctx, err, next);
    };
    ctx.pushNextHandle(next);
    ctx.next();
  }

  protected handleRequestByRequestResponse(req: ServerRequest, res: ServerResponse, done: (err?: ErrorReason) => void) {
    this.handleRequestByContext(this.createContext(req, res), done);
  }

}
