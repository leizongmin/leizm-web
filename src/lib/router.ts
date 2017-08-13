import { BaseConnect } from './base';
import { Context } from './context';
import { MiddlewareHandle } from './define';
import { wrapMiddlewareHandleWithMethod } from './utils';

export class Router extends BaseConnect {

  public toMiddleware() {
    const router = this;
    return function (ctx: Context) {
      router.handleRequestByContext(ctx, function (err) {
        ctx.next(err);
      });
    };
  }

  public use(route: string | RegExp, ...handles: Array<MiddlewareHandle | Router>) {
    this.useMiddleware(route, ...handles.map(item => item instanceof Router ? item.toMiddleware() : item));
  }

  public all(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles);
  }

  public get(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('GET', item)));
  }

  public head(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('HEAD', item)));
  }

  public post(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('POST', item)));
  }

  public put(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('PUT', item)));
  }

  public delete(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('DELETE', item)));
  }

  public connect(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('CONNECT', item)));
  }

  public options(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('OPTIONS', item)));
  }

  public trace(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('TRACE', item)));
  }

  public patch(route: string | RegExp, ...handles: MiddlewareHandle[]) {
    this.useMiddleware(route, ...handles.map(item => wrapMiddlewareHandleWithMethod('PATCH', item)));
  }

}
