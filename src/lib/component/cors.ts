/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as assert from "assert";
import { parse as parseURL } from "url";
import { Context } from "../context";
import { MiddlewareHandle } from "../define";

export interface CorsOptions {
  /** 允许的域名列表 */
  domain?: string[];
  /** 是否允许任意域名，如果为true则总是允许当前请求来源的域名 */
  any?: boolean;
  /** 增加额外的响应头 */
  headers?: Record<string, string | string[]>;
  /** Access-Control-Max-Age */
  maxAge?: number;
  /** Access-Control-Allow-Credentials */
  credentials?: boolean;
  /** Access-Control-Allow-Headers 允许的请求头 */
  allowHeaders?: string[];
  /** Access-Control-Allow-Methods 允许的请求方法 */
  allowMethods?: string[];
}

export const DEFAULT_CORS_OPTIONS: Required<CorsOptions> = {
  domain: [],
  any: false,
  headers: {},
  maxAge: 0,
  credentials: true,
  allowHeaders: ["PUT", "POST", "GET", "HEAD", "DELETE", "OPTIONS", "TRACE"],
  allowMethods: ["Origin", "X-Requested-With", "Content-Type", "Content-Length", "Accept", "Authorization", "Cookie"],
};

/**
 * CORS中间件
 */
export function cors(options: CorsOptions = {}): MiddlewareHandle<Context> {
  const opts: Required<CorsOptions> = { ...DEFAULT_CORS_OPTIONS, ...options };

  if (opts.any) {
    assert(opts.any === true, `invalid 'any' option: must be true`);
  } else {
    assert(Array.isArray(opts.domain), `invalid 'domain' option: must be an array`);
  }

  if ("maxAge" in opts) {
    opts.headers["Access-Control-Max-Age"] = String(opts.maxAge);
  }
  if ("credentials" in opts) {
    assert(typeof opts.credentials === "boolean", `invalid 'credentials' option: must be true or false`);
    opts.headers["Access-Control-Allow-Credentials"] = String(opts.credentials);
  }
  if ("allowHeaders" in opts) {
    assert(Array.isArray(opts.allowHeaders), `invalid 'allowHeaders' option: must be an array`);
    opts.headers["Access-Control-Allow-Headers"] = opts.allowHeaders.join(", ");
  }
  if ("allowMethods" in opts) {
    assert(Array.isArray(opts.allowMethods), `invalid 'allowMethods' option: must be an array`);
    opts.headers["Access-Control-Allow-Methods"] = opts.allowMethods.join(", ");
  }

  function setAdditionalHeaders(ctx: Context) {
    if (opts.headers) {
      for (const name in opts.headers) {
        ctx.response.setHeader(name, opts.headers[name]);
      }
    }
  }

  if (opts.any) {
    return function (ctx: Context) {
      const origin = ctx.request.headers.origin;
      if (origin) {
        ctx.response.setHeader("Access-Control-Allow-Origin", origin);
        setAdditionalHeaders(ctx);
      }
      ctx.next();
    };
  }

  return function (ctx: Context) {
    const origin = ctx.request.headers.origin;
    const info = parseURL(String(origin));
    if (origin && opts.domain.indexOf(info.host || "") !== -1) {
      ctx.response.setHeader("Access-Control-Allow-Origin", origin);
      setAdditionalHeaders(ctx);
    }
    ctx.next();
  };
}
