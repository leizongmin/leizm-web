import { ServerRequest, ServerResponse } from 'http';
import { Context } from './context';
import { Request } from './request';
import { Response } from './response';

export { PathRegExp, RegExpOptions } from 'path-to-regexp';

export type ErrorReason = null | string | Error | Record<any, any>;

export type MiddlewareHandle = (ctx: Context, err?: ErrorReason) => Promise<void> | void;

export interface Middleware {
  handleError: boolean;
  route: RegExp;
  handle: MiddlewareHandle;
}

export type NextFunction = (err?: ErrorReason) => void;

export interface ListenOptions {
  port?: number;
  host?: string;
  backlog?: number;
  path?: string;
  exclusive?: boolean;
}

export type ClassicalMiddlewareHandle = (req: ServerRequest, res: ServerResponse, next?: NextFunction) => void;
export type ClassicalMiddlewareErrorHandle = (err: ErrorReason, req: ServerRequest, res: ServerResponse, next?: NextFunction) => void;

export interface ContextConstructor {
  new(): Context;
}

export interface RequestConstructor {
  new(req: ServerRequest): Request;
}

export interface ResponseConstructor {
  new(res: ServerResponse): Response;
}

export interface Headers {
  [name: string]: string | string[] | number;
}

export interface ServerRequestEx extends ServerRequest {
  originalUrl?: string;
}
