/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage, ServerResponse, IncomingHttpHeaders } from "http";
import { Request } from "./request";
import { Response } from "./response";
import { Context } from "./context";
import { Key as RegExpKey } from "path-to-regexp";
export { RegExpOptions, Key as RegExpKey } from "path-to-regexp";
import * as cookie from "cookie";

/** 出错原因 */
export type ErrorReason = undefined | null | string | Error | Record<any, any>;

/** 编译路由字符串的结果 */
export interface ParsedRoutePathResult {
  /** 正则表达式 */
  regexp: RegExp;
  /** 变量信息 */
  keys: RegExpKey[];
}

/** 原始路由信息 */
export interface RawRouteInfo {
  /** 请求方法 */
  method: string;
  /** 路径 */
  path: string;
}

/** 中间件处理函数 */
export interface MiddlewareHandle<C> {
  (ctx: C, err?: ErrorReason): Promise<void> | void;
  /** 是否为connect中间件 */
  classical?: boolean;
  /** 当前中间件注册时的路由前缀 */
  route?: ParsedRoutePathResult;
}

/** 中间件堆栈的元素 */
export interface Middleware<C> {
  /** 是否为错误处理中间件 */
  handleError: boolean;
  /** 路由规则 */
  route?: ParsedRoutePathResult;
  /** 中间件处理函数 */
  handle: MiddlewareHandle<C>;
  /** 是否排在末尾 */
  atEnd: boolean;
  /** 原始路由信息 */
  raw?: RawRouteInfo;
}

/** next回调函数 */
export type NextFunction = (err?: ErrorReason) => void;

/** 监听端口选项 */
export interface ListenOptions {
  /** 端口 */
  port?: number;
  /** 地址 */
  host?: string;
  backlog?: number;
  /** Unix Socket 文件路径 */
  path?: string;
  exclusive?: boolean;
}

/** 经典connect中间件 */
export type ClassicalMiddlewareHandle = (req: IncomingMessage, res: ServerResponse, next: NextFunction) => void;
/** 经典connect错误处理中间件 */
export type ClassicalMiddlewareErrorHandle = (
  err: ErrorReason,
  req: IncomingMessage,
  res: ServerResponse,
  next: NextFunction,
) => void;

/** Context对象构造器 */
export interface ContextConstructor {
  new (): Context;
}

/** Request对象构造器 */
export interface RequestConstructor {
  new (req: IncomingMessage, ctx: Context): Request;
}

/** Response对象构造器 */
export interface ResponseConstructor {
  new (res: ServerResponse, ctx: Context): Response;
}

/** 请求头 */
export interface Headers extends IncomingHttpHeaders {}

/** 扩展的ServerRequest对象 */
export interface ServerRequestEx extends IncomingMessage {
  originalUrl?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  files?: Record<string, any>;
  params?: Record<string, any>;
  session?: Record<string, any>;
  cookies?: Record<string, any>;
  signedCookies?: Record<string, any>;
}

/** 设置Cookie选项 */
export interface CookieOptions extends cookie.CookieSerializeOptions {
  /** 是否签名 */
  signed?: boolean;
}

/** 模板引擎回调函数 */
export type TemplateRenderFileCallback = (err: Error | null, data?: string) => void;

/** 模板引擎渲染文件函数 */
export type TemplateRenderFileFunction = (
  fileName: string,
  data: TemplateRenderData,
  callback: TemplateRenderFileCallback,
) => void;

/** 模板渲染数据 */
export type TemplateRenderData = Record<string, any>;

////////////////////////////////////////////////////////////////////////////////////////////////////

export const SYMBOL_REQUEST = Symbol("request instance");
export const SYMBOL_RESPONSE = Symbol("response instance");
export const SYMBOL_CONNECT = Symbol("parent connect instance");
export const SYMBOL_SERVER = Symbol("http.Server instance");
export const SYMBOL_SESSION = Symbol("context session instance");
export const SYMBOL_PUSH_NEXT_HANDLE = Symbol("context.pushNextHandle");
export const SYMBOL_POP_NEXT_HANDLE = Symbol("context.popNextHandle");
export const SYMBOL_RAW_ROUTE_INFO = Symbol("context.rawRouteInfo");
