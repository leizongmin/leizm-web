import * as pathToRegExp from "path-to-regexp";
import {
  MiddlewareHandle,
  ClassicalMiddlewareHandle,
  ClassicalMiddlewareErrorHandle,
  ErrorReason,
  RegExpOptions,
  PathRegExp
} from "./define";
import { Context } from "./context";

/**
 * 判断是否为Promise对象
 *
 * @param p 要判断的对象
 */
export function isPromise(p: Promise<void>): boolean {
  return p && typeof p.then === "function" && typeof p.catch === "function";
}

/**
 * 解析路由字符串
 *
 * @param route 路由字符串
 * @param options 选项
 */
export function parseRoutePath(
  route: string | RegExp,
  options: RegExpOptions
): RegExp {
  if (route instanceof RegExp) return route;
  return pathToRegExp(route, options);
}

/**
 * 判断路由规则是否匹配
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function testRoutePath(pathname: string, route: RegExp): boolean {
  route.lastIndex = 0;
  return route.test(pathname);
}

/**
 * 获取当前匹配路由规则对应的URL参数
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function getRouteParams(
  pathname: string,
  route: PathRegExp
): Record<string, string> {
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

/**
 * 获取当前匹配路由规则对应的URL前缀
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function getRouteMatchPath(
  pathname: string,
  route: PathRegExp | null
): string {
  if (!route) return "/";
  route.lastIndex = 0;
  const values = route.exec(pathname);
  return (values && values[0]) || "/";
}

/**
 * 转换经典的connect中间件
 *
 * @param fn 处理函数
 */
export function fromClassicalHandle<C extends Context>(
  fn: ClassicalMiddlewareHandle
): MiddlewareHandle<C> {
  return function(ctx: C) {
    fn(ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
  };
}

/**
 * 转换经典的connect错误处理中间件
 *
 * @param fn 处理函数
 */
export function fromClassicalErrorHandle<C extends Context>(
  fn: ClassicalMiddlewareErrorHandle
): MiddlewareHandle<C> {
  return function(ctx: Context, err?: ErrorReason) {
    fn(err, ctx.request.req, ctx.response.res, ctx.next.bind(ctx));
  };
}

/**
 * 判断是否为错误处理中间件
 *
 * @param handle 处理函数
 */
export function isMiddlewareErrorHandle<C>(handle: MiddlewareHandle<C>): boolean {
  return handle.length > 1;
}

/**
 * 给当前中间件包装请求方法限制
 *
 * @param method 请求方法
 * @param handle 处理函数
 */
export function wrapMiddlewareHandleWithMethod<C extends Context>(
  method: string,
  handle: MiddlewareHandle<C>
): MiddlewareHandle<C> {
  function handleRequest(ctx: C, err?: ErrorReason) {
    if (ctx.request.method !== method) return ctx.next(err);
    execMiddlewareHandle(handle, ctx, err, err2 => ctx.next(err2));
  }
  if (isMiddlewareErrorHandle(handle)) {
    return function(ctx: C, err?: ErrorReason) {
      handleRequest(ctx, err);
    };
  }
  return function(ctx: C) {
    handleRequest(ctx);
  };
}

/**
 * 执行中间件
 *
 * @param handle 处理函数
 * @param ctx 当前Context对象
 * @param err 出错信息
 * @param callback 回调函数
 */
export function execMiddlewareHandle<C>(
  handle: MiddlewareHandle<C>,
  ctx: C,
  err: ErrorReason,
  onError: (err: ErrorReason) => void
) {
  process.nextTick(function() {
    let p: Promise<void> | void;
    try {
      p = handle(ctx, err);
    } catch (err) {
      return onError(err);
    }
    if (p && isPromise(p)) {
      p.catch(onError);
    }
  });
}
