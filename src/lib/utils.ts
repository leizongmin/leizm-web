/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as pathToRegExp from "path-to-regexp";
import {
  MiddlewareHandle,
  ClassicalMiddlewareHandle,
  ClassicalMiddlewareErrorHandle,
  ErrorReason,
  RegExpOptions,
  RegExpKey,
  ParsedRoutePathResult,
  ContextConstructor,
  SYMBOL_PUSH_NEXT_HANDLE,
} from "./define";
import { Context } from "./context";
import { IncomingMessage, ServerResponse } from "http";
import * as finalhandler from "finalhandler";

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
export function parseRoutePath(route: string | RegExp, options: RegExpOptions): ParsedRoutePathResult {
  if (route instanceof RegExp) {
    return { regexp: route, keys: [] };
  }
  const keys: RegExpKey[] = [];
  const regexp = pathToRegExp(route, keys, options);
  return { regexp, keys };
}

/**
 * 判断路由规则是否匹配
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function testRoutePath(pathname: string, route: ParsedRoutePathResult | undefined): boolean {
  if (!route) {
    return true;
  }
  route.regexp.lastIndex = 0;
  return route.regexp.test(pathname);
}

/**
 * 获取当前匹配路由规则对应的URL参数
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function getRouteParams(pathname: string, route: ParsedRoutePathResult | undefined): Record<string, string> {
  const params: Record<string, string> = {};
  if (route) {
    route.regexp.lastIndex = 0;
    const values = route.regexp.exec(pathname);
    if (values && route.keys) {
      route.keys.forEach((k, i) => {
        params[k.name] = values[i + 1];
      });
    }
  }
  return params;
}

/**
 * 获取当前匹配路由规则对应的URL前缀
 *
 * @param pathname 当前路径
 * @param route 当前路由规则
 */
export function getRouteMatchPath(pathname: string, route: ParsedRoutePathResult | null): string {
  if (!route) return "";
  route.regexp.lastIndex = 0;
  const values = route.regexp.exec(pathname);
  return (values && values[0]) || "";
}

/**
 * 转换经典的connect中间件
 *
 * @param fn 处理函数
 */
export function fromClassicalHandle<C extends Context>(fn: ClassicalMiddlewareHandle): MiddlewareHandle<C> {
  const handle: MiddlewareHandle<C> = function(ctx: C) {
    let removedPath = "";
    if (handle.route) {
      removedPath = getRouteMatchPath(ctx.request.path, handle.route);
      if (removedPath) {
        ctx.request.url = ctx.request.url.slice(removedPath.length);
        ctx.request.path = ctx.request.path.slice(removedPath.length);
      }
    }
    fn(ctx.request.req, ctx.response.res, (err?: ErrorReason) => {
      if (removedPath) {
        ctx.request.url = removedPath + ctx.request.url;
        ctx.request.path = removedPath + ctx.request.path;
      }
      ctx.next(err);
    });
  };
  handle.classical = true;
  return handle;
}

/**
 * 转换为经典的connect中间件
 *
 * @param fn 处理函数
 */
export function toClassicalHandle(
  fn: MiddlewareHandle<Context>,
  contextConstructor: ContextConstructor = Context,
): ClassicalMiddlewareHandle {
  return function(req: IncomingMessage, res: ServerResponse, next: (err: ErrorReason) => void) {
    const ctx = new contextConstructor().init(req, res);
    if (typeof next !== "function") next = finalhandler(req, res);
    ctx[SYMBOL_PUSH_NEXT_HANDLE](next);
    const ret = fn(ctx) as any;
    if (isPromise(ret)) {
      (ret as Promise<any>).catch(next);
    }
  };
}

/**
 * 转换经典的connect错误处理中间件
 *
 * @param fn 处理函数
 */
export function fromClassicalErrorHandle<C extends Context>(fn: ClassicalMiddlewareErrorHandle): MiddlewareHandle<C> {
  const handle: MiddlewareHandle<C> = function(ctx: Context, err?: ErrorReason) {
    let removedPath = "";
    if (handle.route) {
      removedPath = getRouteMatchPath(ctx.request.path, handle.route);
      if (removedPath) {
        ctx.request.url = ctx.request.url.slice(removedPath.length);
        ctx.request.path = ctx.request.path.slice(removedPath.length);
      }
    }
    fn(err, ctx.request.req, ctx.response.res, (err?: ErrorReason) => {
      if (removedPath) {
        ctx.request.url = removedPath + ctx.request.url;
        ctx.request.path = removedPath + ctx.request.path;
      }
      ctx.next(err);
    });
  };
  handle.classical = true;
  return handle;
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
  handle: MiddlewareHandle<C>,
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
  onError: (err: ErrorReason) => void,
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

/**
 * 提示接口更改
 * @param old 旧方法
 * @param current 新方法
 * @param since 开始完全弃用的版本
 */
export function nofigyDeprecated(old: string, current: string, since: string): void {
  console.error(
    `[deprecated] @leizm/web模块：%s已更改为%s，旧的使用方法将会在v%s版本之后弃用，请及时更新您的代码。`,
    old,
    current,
    since,
  );
}
