import { ServerRequest, ServerResponse } from 'http';
import { Request } from './request';
import { Response } from './response';
import { NextFunction, ErrorReason } from './define';

export class Context {

  public readonly request: Request;
  public readonly response: Response;
  protected readonly nextHandleStack: NextFunction[] = [];

  constructor(req: ServerRequest, res: ServerResponse) {
    this.request = new Request(req);
    this.response = new Response(res);
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
