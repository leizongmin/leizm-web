/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import { fromClassicalHandle } from "../utils";
import { serveStatic as originServeStatic, IServeStaticOptions } from "@modernjs/send";

export interface ServeStaticOptions extends IServeStaticOptions {}

export function serveStatic(root: string, options: ServeStaticOptions = {}): MiddlewareHandle<Context> {
  return fromClassicalHandle(originServeStatic(root, options) as any);
}
