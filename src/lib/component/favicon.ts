/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as path from "path";
import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import { ISendOptions } from "@modernjs/send";

export function favicon(filePath: string, options?: ISendOptions): MiddlewareHandle<Context> {
  filePath = path.resolve(filePath);
  return function(ctx: Context) {
    if (ctx.request.path === "/favicon.ico") {
      ctx.response.file(filePath, options);
      return;
    }
    ctx.next();
  };
}
