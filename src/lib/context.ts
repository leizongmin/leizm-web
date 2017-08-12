import { ServerRequest, ServerResponse } from 'http';
import { Request } from './request';
import { Response } from './response';
import { NextFunction, ErrorReason } from './define';

export class Context {

  public readonly request: Request;
  public readonly response: Response;
  protected readonly _nextHandle: NextFunction;

  constructor(req: ServerRequest, res: ServerResponse, next: NextFunction) {
    this.request = new Request(req);
    this.response = new Response(res);
    this._nextHandle = next;
  }

  public next(err?: ErrorReason) {
    this._nextHandle(err);
  }

}
