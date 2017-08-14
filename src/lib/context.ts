import { ServerRequest, ServerResponse } from 'http';
import { Request } from './request';
import { Response } from './response';
import { NextFunction, ErrorReason, RequestConstructor, ResponseConstructor } from './define';

export class Context {

  protected _request: Request;
  protected _response: Response;
  protected readonly nextHandleStack: NextFunction[] = [];
  protected requestConstructor: RequestConstructor = Request;
  protected responseConstructor: ResponseConstructor = Response;

  protected createRequest(req: ServerRequest) {
    return new this.requestConstructor(req);
  }

  protected createResponse(res: ServerResponse) {
    return new this.responseConstructor(res);
  }

  public init(req: ServerRequest, res: ServerResponse) {
    this._request = this.createRequest(req);
    this._response = this.createResponse(res);
    return this;
  }

  public get request() {
    return this._request;
  }

  public get response() {
    return this._response;
  }

  public next(err?: ErrorReason) {
    const next = this.nextHandleStack[this.nextHandleStack.length - 1];
    if (next) {
      next(err);
    }
  }

  public pushNextHandle(next: NextFunction) {
    this.nextHandleStack.push(next);
  }

  public popNextHandle(): NextFunction | void {
    return this.nextHandleStack.pop();
  }

}
