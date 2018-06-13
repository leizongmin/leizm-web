/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import * as send from "send";

export interface ServeStaticOptions extends send.SendOptions {
  /** 根目录 */
  root: string;
  /** 首页文件名，如果访问的是一个目录，则自动尝试返回该文件列表中的文件 */
  index?: string[];
  /** 文件缓存时间 */
  maxAge?: number | string;
}

export function serveStatic(options: ServeStaticOptions) {
  return function(ctx: Context) {
    console.log(ctx.request.url);
    const file = ctx.request.url.slice(1);
    send(ctx.request.req, file, options)
      .on("error", err => {
        ctx.response.res.statusCode = err.status || 500;
        ctx.response.res.end(err.message);
      })
      .pipe(ctx.response.res);
  };
}
