/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage, ServerResponse } from "http";
import { Context } from "./context";
import {
  Middleware,
  MiddlewareHandle,
  ErrorReason,
  NextFunction,
  ContextConstructor,
  ParsedRoutePathResult,
  RegExpOptions,
  SYMBOL_PUSH_NEXT_HANDLE,
  SYMBOL_POP_NEXT_HANDLE,
} from "./define";
import {
  testRoutePath,
  parseRoutePath,
  getRouteParams,
  isMiddlewareErrorHandle,
  execMiddlewareHandle,
  getRouteMatchPath,
} from "./utils";
import { Request } from "./request";
import { Response } from "./response";

export class Core<C extends Context = Context<Request, Response>> {
  /** 中间件堆栈 */
  protected readonly stack: Middleware<C>[] = [];
  /** Context对象构造函数 */
  protected contextConstructor: ContextConstructor = Context;
  /** 解析路由选项 */
  protected readonly routeOptions: RegExpOptions = {
    sensitive: true,
    strict: true,
    end: true,
    delimiter: "/",
  };
  /** use()当前中间件时的路由规则 */
  protected route?: ParsedRoutePathResult;

  /**
   * 创建Context对象
   *
   * @param req 原始ServerRequest对象
   * @param res 原始ServerResponse对象
   */
  protected createContext(req: IncomingMessage, res: ServerResponse): C {
    return new this.contextConstructor().init(req, res) as C;
  }

  /**
   * 解析路由规则
   *
   * @param isPrefix 是否为前缀模式
   * @param route 路由规则
   */
  protected parseRoutePath(isPrefix: boolean, route: string | RegExp): ParsedRoutePathResult | undefined {
    if (isPrefix && (!route || route === "/")) {
      return;
    }
    return parseRoutePath(route, {
      ...this.routeOptions,
      end: !isPrefix,
    });
  }

  /**
   * 生成中间件
   */
  public toMiddleware() {
    const self = this;
    return function(ctx: C) {
      let removedPath = "";
      if (self.route) {
        removedPath = getRouteMatchPath(ctx.request.path, self.route);
        if (removedPath) {
          ctx.request.url = ctx.request.url.slice(removedPath.length);
          ctx.request.path = ctx.request.path.slice(removedPath.length);
        }
      }
      self.handleRequestByContext(ctx, function(err) {
        if (removedPath) {
          ctx.request.url = removedPath + ctx.request.url;
          ctx.request.path = removedPath + ctx.request.path;
        }
        ctx.next(err);
      });
    };
  }

  /**
   * 注册中间件
   *
   * @param route 路由规则
   * @param handles 中间件对象或处理函数
   */
  public use(route: string | RegExp, ...handles: Array<MiddlewareHandle<C> | Core<C>>) {
    const parsedRoute = this.parseRoutePath(true, route);
    this.add(
      parsedRoute,
      ...handles.map(item => {
        if (item instanceof Core) {
          item.route = parsedRoute;
          return item.toMiddleware();
        }
        item.route = parsedRoute;
        return item;
      }),
    );
  }

  /**
   * 注册中间件
   *
   * @param route 路由
   * @param handles 中间件对象或处理函数
   */
  protected add(route: ParsedRoutePathResult | undefined, ...handles: MiddlewareHandle<C>[]) {
    for (const handle of handles) {
      const item: Middleware<C> = {
        route,
        handle,
        handleError: isMiddlewareErrorHandle(handle),
        atEnd: false,
      };
      const i = this.stack.findIndex(v => v.atEnd);
      if (i === -1) {
        this.stack.push(item);
      } else {
        this.stack.splice(i, -1, item);
      }
    }
  }

  /**
   * 添加中间件到末尾
   *
   * @param route 路由
   * @param handles 中间件对象或处理函数
   */
  protected addToEnd(route: ParsedRoutePathResult | undefined, ...handles: MiddlewareHandle<C>[]) {
    for (const handle of handles) {
      const item: Middleware<C> = {
        route,
        handle,
        handleError: isMiddlewareErrorHandle(handle),
        atEnd: true,
      };
      this.stack.push(item);
    }
  }

  /**
   * 通过原始ServerRequest和ServerResponse对象处理请求
   * @param req 原始ServerRequest对象
   * @param res 原始ServerResponse对象
   * @param done 未处理请求回调函数
   */
  protected handleRequestByRequestResponse(
    req: IncomingMessage,
    res: ServerResponse,
    done: (err?: ErrorReason) => void,
  ) {
    this.handleRequestByContext(this.createContext(req, res), done);
  }

  /**
   * 通过Context对象处理请求
   *
   * @param ctx Context对象
   * @param done 未处理请求回调函数
   */
  protected handleRequestByContext(ctx: C, done: (err?: ErrorReason) => void) {
    let index = 0;
    type GetMiddlewareHandle = () => void | Middleware<C>;

    const getNextHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (handle.handleError) return getNextHandle();
      return handle;
    };

    const getNextErrorHandle: GetMiddlewareHandle = () => {
      const handle = this.stack[index++];
      if (!handle) return;
      if (!handle.handleError) return getNextErrorHandle();
      return handle;
    };

    const next: NextFunction = err => {
      const handle = err ? getNextErrorHandle() : getNextHandle();
      err = err || null;
      if (err && ctx.listenerCount("error") > 0) {
        ctx.emit("error", err);
      }
      if (!handle) {
        ctx[SYMBOL_POP_NEXT_HANDLE]();
        return done(err || null);
      }
      if (!testRoutePath(ctx.request.path, handle.route)) {
        return next(err);
      }
      ctx.request.params = getRouteParams(ctx.request.path, handle.route);
      execMiddlewareHandle(handle.handle, ctx, err, next);
    };

    ctx[SYMBOL_PUSH_NEXT_HANDLE](next);
    ctx.next();
  }
}
