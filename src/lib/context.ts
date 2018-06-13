/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { ServerRequest, ServerResponse } from "http";
import { EventEmitter } from "events";
import { Request } from "./request";
import { Response } from "./response";
import { NextFunction, ErrorReason, RequestConstructor, ResponseConstructor } from "./define";

export class Context<Q extends Request = Request, S extends Response = Response> extends EventEmitter {
  /** 原始ServerRequest对象 */
  protected _request?: Q;
  /** 原始ServerResponse对象 */
  protected _response?: S;
  /** 用于存储next函数的堆栈 */
  protected readonly nextHandleStack: NextFunction[] = [];
  /** Request对象的构造函数 */
  protected requestConstructor: RequestConstructor = Request;
  /** Response对象的构造函数 */
  protected responseConstructor: ResponseConstructor = Response;

  /**
   * 创建Request对象
   *
   * @param req 原始ServerRequest对象
   */
  protected createRequest(req: ServerRequest): Q {
    return new this.requestConstructor(req, this) as Q;
  }

  /**
   * 创建Response对象
   *
   * @param res 原始ServerResponse对象
   */
  protected createResponse(res: ServerResponse): S {
    return new this.responseConstructor(res, this) as S;
  }

  /**
   * 初始化
   *
   * @param req 原始ServerRequest对象
   * @param res 原始ServerResponse对象
   */
  public init(req: ServerRequest, res: ServerResponse) {
    this._request = this.createRequest(req);
    this._request.inited();
    this._response = this.createResponse(res);
    this._response.inited();
    res.once("finish", () => this.emit("finish"));
    this.inited();
    return this;
  }

  /**
   * 初始化完成
   */
  public inited() {}

  /**
   * 获取Request对象
   */
  public get request(): Q {
    return this._request as Q;
  }

  /**
   * 获取Response对象
   */
  public get response(): S {
    return this._response as S;
  }

  /**
   * 转到下一个中间件
   *
   * @param err 出错信息
   */
  public next(err?: ErrorReason) {
    const next = this.nextHandleStack[this.nextHandleStack.length - 1];
    if (next) {
      next(err);
    }
  }

  /**
   * next函数堆栈入栈
   *
   * @param next 回调函数
   */
  public pushNextHandle(next: NextFunction) {
    this.nextHandleStack.push(next);
  }

  /**
   * next函数出栈
   */
  public popNextHandle(): NextFunction | void {
    return this.nextHandleStack.pop();
  }

  /**
   * 注册中间件执行出错时的事件监听
   *
   * @param callback 回调函数
   */
  public onError(callback: (err: ErrorReason) => void) {
    this.on("error", callback);
  }

  /**
   * 注册响应结束时的事件监听
   *
   * @param callback 回调函数
   */
  public onFinish(callback: () => void) {
    this.on("finish", callback);
  }
}
