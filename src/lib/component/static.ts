/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import { fromClassicalHandle } from "../utils";
import * as originServeStatic from "serve-static";

export interface ServeStaticOptions extends originServeStatic.ServeStaticOptions {}

export function serveStatic(root: string, options: ServeStaticOptions = {}): MiddlewareHandle<Context> {
  return fromClassicalHandle(originServeStatic(root, options) as any);
}
