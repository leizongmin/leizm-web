/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage } from "http";
import * as qs from "qs";

export interface ParsedUrl {
  hash: string;
  host: string;
  hostname: string;
  password: string;
  path: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  query: Record<string, any> | null;
  username: string;
}

const relativeUrlBase = "http://relative-url";

export interface IParseUrlOptions {
  /** request instance */
  req?: IncomingMessage;
  /** the input url is absolute, defaults to false */
  absolute?: boolean;
  /** parse query string, defaults to false */
  query?: boolean;
}

export function parseUrl(url: string, options: IParseUrlOptions = {}): ParsedUrl {
  const absolute = !!(options.absolute || options.req);
  const base =
    options.req && options.req.headers && options.req.headers.host
      ? `http://${options.req.headers.host}`
      : relativeUrlBase;
  const info = new URL(url, base);
  return {
    protocol: absolute ? info.protocol : "",
    host: absolute ? info.host : "",
    hostname: absolute ? info.hostname : "",
    port: absolute ? info.port : "",
    username: info.username,
    password: info.password,
    path: info.pathname + info.search,
    pathname: info.pathname,
    search: info.search,
    query: options.query ? (info.search ? qs.parse(info.search.slice(1)) : {}) : null,
    hash: info.hash,
  };
}
