import * as pathToRegExp from 'path-to-regexp';
import {
  MiddlewareHandle, ClassicalMiddlewareHandle, ClassicalMiddlewareErrorHandle, ErrorReason, NextFunction,
  RegExpOptions,
} from './define';
import { Context } from './context';

export function isPromise(p: Promise<void>): boolean {
  return p && typeof p.then === 'function' && typeof p.catch === 'function';
}

export function parseRoutePath(route: string | RegExp, options: RegExpOptions): RegExp {
  if (route instanceof RegExp) return route;
  return pathToRegExp(route, options);
}

export function testRoutePath(pathname: string, route: RegExp): boolean {
  route.lastIndex = 0;
  return route.test(pathname);
}

export function getRouteParams(pathname: string, route: pathToRegExp.PathRegExp): Record<string, string> {
  const params: Record<string, string> = {};
  route.lastIndex = 0;
  const values = route.exec(pathname);
  if (values && route.keys) {
    route.keys.forEach((k, i) => {
      params[k.name] = values[i + 1];
    });
  }
  return params;
}

export function fromClassicalHandle(fn: ClassicalMiddlewareHandle): MiddlewareHandle {
  return function (ctx: Context) {
    fn(ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
  };
}

export function fromClassicalErrorHandle(fn: ClassicalMiddlewareErrorHandle): MiddlewareHandle {
  return function (ctx: Context, err?: ErrorReason) {
    fn(err, ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
  };
}

export function isMiddlewareErrorHandle(handle: MiddlewareHandle): boolean {
  return handle.length > 1;
}

export function wrapMiddlewareHandleWithMethod(method: string, handle: MiddlewareHandle): MiddlewareHandle {
  function handleRequest(ctx: Context, err?: ErrorReason) {
    if (ctx.request.method !== method) return ctx.next(err);
    handle(ctx, err);
  }
  if (isMiddlewareErrorHandle(handle)) {
    return function (ctx: Context, err?: ErrorReason) {
      handleRequest(ctx, err);
    };
  }
  return function (ctx: Context) {
    handleRequest(ctx);
  };
}

export function execMiddlewareHandle(handle: MiddlewareHandle, ctx: Context, err: ErrorReason, callback: NextFunction) {
  process.nextTick(function () {
    let p: Promise<void> | void;
    try {
      p = handle(ctx, err);
    } catch (err) {
      return callback(err);
    }
    if (p && isPromise(p)) {
      p.catch(callback);
    }
  });
}
