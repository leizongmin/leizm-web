/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as cookie from "@modernjs/cookie";
import { Context } from "../context";
import { MiddlewareHandle } from "../define";

export interface CookieParserOptions extends cookie.ICookieParseOptions {}

export function cookieParser(secret: string = "", options: CookieParserOptions = {}): MiddlewareHandle<Context> {
  const handler = cookie.cookieParser(secret, options);
  return function(ctx: Context) {
    handler(ctx.request.req as any, ctx.response.res as any, (err?: Error) => ctx.next(err));
  };
}
