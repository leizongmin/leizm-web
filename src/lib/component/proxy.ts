/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as path from "path";
import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import { proxyRequest, ProxyTarget, parseProxyTarget } from "../module/proxy.request";

/**
 * 代理中间件选项
 */
export interface ProxyOptions {
  /** 目标地址 */
  target: string | ProxyTarget;
  /** 要删除的请求头，默认是 ["host"] */
  removeHeaderNames?: string[];
}

/** 默认要删除的代理请求头 */
export const DEFAULT_PROXY_REMOVE_HEADER_NAMES = ["host"];

/**
 * proxy 中间件
 *
 * @param options
 */
export function proxy(options: ProxyOptions): MiddlewareHandle<Context> {
  const baseTarget = typeof options.target === "string" ? parseProxyTarget(options.target) : { ...options.target };
  const removeHeaderNames = options.removeHeaderNames || DEFAULT_PROXY_REMOVE_HEADER_NAMES;
  return function (ctx: Context) {
    const originalHeaders = { ...ctx.request.headers };
    for (const n of removeHeaderNames) {
      delete originalHeaders[n];
    }
    const target: ProxyTarget = {
      ...baseTarget,
      path: path.join(baseTarget.path, ctx.request.url),
      headers: { ...originalHeaders, ...baseTarget.headers },
    };
    proxyRequest(ctx.request.req, ctx.response.res, target).catch((err) => {
      ctx.next(err);
    });
  };
}
