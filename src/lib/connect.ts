import { Server, ServerRequest, ServerResponse } from 'http';
import * as finalhandler from 'finalhandler';
import { BaseConnect } from './base';
import { ListenOptions, ErrorReason, MiddlewareHandle } from './define';
import { Router } from './router';

export class Connect extends BaseConnect {

  protected _server: Server;

  public get server() {
    if (!this._server) this._server = new Server(this.handleRequest.bind(this));
    return this._server;
  }

  public listen(options: ListenOptions, listeningListener?: () => void) {
    this.server.listen(options, listeningListener);
  }

  public handleRequest(req: ServerRequest, res: ServerResponse, done: (err?: ErrorReason) => void) {
    this.handleRequestByRequestResponse(req, res, done || finalhandler(req, res));
  }

  public use(route: string | RegExp, ...handles: Array<MiddlewareHandle | Router>) {
    this.useMiddleware(route, ...handles.map(item => item instanceof Router ? item.toMiddleware() : item));
  }

}
