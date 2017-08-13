import { Server, ServerRequest, ServerResponse } from 'http';
import { Context } from './context';
import {
  Middleware, MiddlewareHandle, ErrorReason, NextFunction, ListenOptions,
  ClassicalMiddlewareHandle, ClassicalMiddlewareErrorHandle, PathRegExp,
} from './define';
import {
  isPromise, testRoute, parseRoute, getRouteParams,
} from './utils';

export class BaseConnect {

  protected readonly stack: Middleware[] = [];

  public use(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    const info = parseRoute(route);
    for (const handle of handles) {
      this.stack.push({ route: info, handle, handleError: handle.length > 1 });
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
      if (!testRoute(ctx.request.pathname, handle.route)) return next(err);
      if (handle.route instanceof RegExp) {
        ctx.request.params = getRouteParams(ctx.request.pathname, handle.route as PathRegExp);
      } else {
        ctx.request.params = {};
      }
      let p;
      try {
        p = handle.handle(ctx, err);
      } catch (err) {
        return next(err);
      }
      if (p && isPromise(p)) {
        p.then(() => next()).catch(next);
      }
    };
    ctx.setNextHandle(next);
    ctx.next();
  }

  protected handleRequestByRequestResponse(req: ServerRequest, res: ServerResponse, done: (err?: ErrorReason) => void) {
    this.handleRequestByContext(new Context(req, res), done);
  }

}
