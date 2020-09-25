/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle } from "../define";

export interface JsonParserOptions {
  /**
   * 允许的最大body字节，当超过此值时将停止解析，并返回错误
   */
  limit: number;
}

export const DEFAULT_JSON_PARSER_OPTIONS: JsonParserOptions = {
  /* 默认100k */
  limit: 102400,
};

/**
 * 快速的 JSON Body 解析中间件
 * @param options 选项
 */
export function jsonParser(options: Partial<JsonParserOptions> = {}): MiddlewareHandle<Context> {
  const opts: JsonParserOptions = { ...DEFAULT_JSON_PARSER_OPTIONS, ...options };

  return function (ctx) {
    if (ctx.request.method === "GET" || ctx.request.method === "HEAD") return ctx.next();
    if (String(ctx.request.headers["content-type"]).indexOf("application/json") === -1) return ctx.next();

    const list: Buffer[] = [];
    let size = 0;
    let isAborted = false;

    function checkLimit() {
      if (size > opts.limit) {
        ctx.request.req.pause();
        isAborted = true;
        ctx.next(new Error(`jsonParser: out of max body size limit`));
      }
    }

    ctx.request.req.on("data", (chunk: Buffer) => {
      list.push(chunk);
      size += chunk.length;
      checkLimit();
    });

    ctx.request.req.on("end", () => {
      checkLimit();
      if (isAborted) return;

      const buf = Buffer.concat(list);
      try {
        const json = JSON.parse(buf.toString());
        ctx.request.body = json;
        return ctx.next();
      } catch (err) {
        return ctx.next(new Error(`jsonParser: ${err.message}`));
      }
    });
  };
}
