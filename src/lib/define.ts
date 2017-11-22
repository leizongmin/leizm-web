import { ServerRequest, ServerResponse } from "http";
import { Request } from "./request";
import { Response } from "./response";
import { Context } from "./context";
export { PathRegExp, RegExpOptions } from "path-to-regexp";

/** 出错原因 */
export type ErrorReason = null | string | Error | Record<any, any>;

/** 中间件处理函数 */
export type MiddlewareHandle<C> = (
  ctx: C,
  err?: ErrorReason
) => Promise<void> | void;

/** 中间件堆栈的元素 */
export interface Middleware<C> {
  /** 是否为错误处理中间件 */
  handleError: boolean;
  /** 路由规则 */
  route: RegExp;
  /** 中间件处理函数 */
  handle: MiddlewareHandle<C>;
  /** 是否排在末尾 */
  atEnd: boolean;
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
export type ClassicalMiddlewareHandle = (
  req: ServerRequest,
  res: ServerResponse,
  next?: NextFunction
) => void;
/** 经典connect错误处理中间件 */
export type ClassicalMiddlewareErrorHandle = (
  err: ErrorReason,
  req: ServerRequest,
  res: ServerResponse,
  next?: NextFunction
) => void;

/** Context对象构造器 */
export interface ContextConstructor {
  new (): Context;
}

/** Request对象构造器 */
export interface RequestConstructor {
  new (req: ServerRequest, ctx: Context): Request;
}

/** Response对象构造器 */
export interface ResponseConstructor {
  new (res: ServerResponse, ctx: Context): Response;
}

/** 请求头 */
export interface Headers {
  [name: string]: string | string[] | number;
}

/** 扩展的ServerRequest对象 */
export interface ServerRequestEx extends ServerRequest {
  originalUrl?: string;
}
