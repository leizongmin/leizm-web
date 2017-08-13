import { ServerRequest, ServerResponse } from 'http';
import { Request } from './request';
import { Response } from './response';
import { NextFunction, ErrorReason } from './define';

export class Context {

  public readonly request: Request;
  public readonly response: Response;
  protected _nextHandle: NextFunction;

  constructor(req: ServerRequest, res: ServerResponse) {
    this.request = new Request(req);
    this.response = new Response(res);
  }

  public next(err?: ErrorReason) {
    this._nextHandle(err);
  }

  public setNextHandle(next: NextFunction) {
    this._nextHandle = next;
  }

}
