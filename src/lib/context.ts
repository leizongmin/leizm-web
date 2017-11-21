import { ServerRequest, ServerResponse } from "http";
import { Request } from "./request";
import { Response } from "./response";
import {
  NextFunction,
  ErrorReason,
  RequestConstructor,
  ResponseConstructor
} from "./define";

export class Context<
  Req extends Request = Request,
  Res extends Response = Response
> {
  /** 原始ServerRequest对象 */
  protected _request: Req;
  /** 原始ServerResponse对象 */
  protected _response: Res;
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
  protected createRequest(req: ServerRequest) {
    return new this.requestConstructor(req) as Req;
  }

  /**
   * 创建Response对象
   *
   * @param res 原始ServerResponse对象
   */
  protected createResponse(res: ServerResponse) {
    return new this.responseConstructor(res) as Res;
  }

  /**
   * 初始化
   *
   * @param req 原始ServerRequest对象
   * @param res 原始ServerResponse对象
   */
  public init(req: ServerRequest, res: ServerResponse) {
    this._request = this.createRequest(req);
    this._response = this.createResponse(res);
    return this;
  }

  /**
   * 获取Request对象
   */
  public get request() {
    return this._request;
  }

  /**
   * 获取Response对象
   */
  public get response() {
    return this._response;
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
}
