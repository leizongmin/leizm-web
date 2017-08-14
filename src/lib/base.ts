import { ServerRequest, ServerResponse } from 'http';
import { Context } from './context';
import {
  Middleware, MiddlewareHandle, ErrorReason, NextFunction, PathRegExp, ContextConstructor, RegExpOptions,
} from './define';
import {
  testRoutePath, parseRoutePath, getRouteParams, isMiddlewareErrorHandle, execMiddlewareHandle,
} from './utils';

export class BaseConnect {

  protected readonly stack: Middleware[] = [];
  protected contextConstructor: ContextConstructor = Context;
  protected readonly routeOptions: RegExpOptions = {
    sensitive: true,
    strict: true,
    end: true,
    delimiter: '/',
  };

  protected createContext(req: ServerRequest, res: ServerResponse) {
    return new this.contextConstructor(req, res);
  }

  public toMiddleware() {
    const router = this;
    return function (ctx: Context) {
      router.handleRequestByContext(ctx, function (err) {
        ctx.next(err);
      });
    };
  }

  protected useMiddleware(isPrefix: boolean, route: string | RegExp, ...handles: MiddlewareHandle[]) {
    for (const handle of handles) {
      this.stack.push({
        route: parseRoutePath(route, {
          ...this.routeOptions,
          end: !isPrefix,
        }),
        handle,
        handleError: isMiddlewareErrorHandle(handle),
      });
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
      if (!testRoutePath(ctx.request.path, handle.route)) return next(err);
      ctx.request.params = getRouteParams(ctx.request.path, handle.route as PathRegExp);
      execMiddlewareHandle(handle.handle, ctx, err, next);
    };
    ctx.pushNextHandle(next);
    ctx.next();
  }

  protected handleRequestByRequestResponse(req: ServerRequest, res: ServerResponse, done: (err?: ErrorReason) => void) {
    this.handleRequestByContext(this.createContext(req, res), done);
  }

}
