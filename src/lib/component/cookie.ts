/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as originCookieParser from "cookie-parser";
import { Context } from "../context";
import { MiddlewareHandle } from "../define";

export interface CookieParserOptions extends originCookieParser.CookieParseOptions {}

export function cookieParser(secret?: string, options: CookieParserOptions = {}): MiddlewareHandle<Context> {
  const handler = originCookieParser(secret, options);
  return function(ctx: Context) {
    handler(ctx.request.req as any, ctx.response.res as any, (err?: Error) => ctx.next(err));
  };
}
