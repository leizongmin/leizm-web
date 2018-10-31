/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Core } from "./core";
import { MiddlewareHandle } from "./define";
import { wrapMiddlewareHandleWithMethod } from "./utils";
import { Context } from "./context";
import { Request } from "./request";
import { Response } from "./response";

export class Router<C extends Context = Context<Request, Response>> extends Core<C> {
  /**
   * 处理所有请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public all(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd({ method: "ALL", path: route.toString() }, this.parseRoutePath(false, route), ...handles);
  }

  /**
   * 处理GET请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public get(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "GET", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("GET", item)),
    );
  }

  /**
   * 处理HEAD请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public head(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "HEAD", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("HEAD", item)),
    );
  }

  /**
   * 处理POST请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public post(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "POST", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("POST", item)),
    );
  }

  /**
   * 处理PUT请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public put(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "PUT", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("PUT", item)),
    );
  }

  /**
   * 处理DELETE请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public delete(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "DELETE", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("DELETE", item)),
    );
  }

  /**
   * 处理CONNECT请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public connect(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "CONNECT", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("CONNECT", item)),
    );
  }

  /**
   * 处理OPTIONS请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public options(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "OPTIONS", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("OPTIONS", item)),
    );
  }

  /**
   * 处理TRACE请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public trace(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "TRACE", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("TRACE", item)),
    );
  }

  /**
   * 处理PATCH请求方法的请求
   *
   * @param route 路由规则
   * @param handles 处理函数
   */
  public patch(route: string | RegExp, ...handles: MiddlewareHandle<C>[]) {
    this.addToEnd(
      { method: "PATCH", path: route.toString() },
      this.parseRoutePath(false, route),
      ...handles.map(item => wrapMiddlewareHandleWithMethod("PATCH", item)),
    );
  }
}
