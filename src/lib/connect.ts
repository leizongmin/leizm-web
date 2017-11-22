import { Server, ServerRequest, ServerResponse } from "http";
import * as finalhandler from "finalhandler";
import { Core } from "./core";
import { ListenOptions, ErrorReason } from "./define";
import { Context } from "./context";
import { Request } from "./request";
import { Response } from "./response";

export class Connect<
  C extends Context = Context<Request, Response>
> extends Core<C> {
  /** http.Server实例 */
  protected _server: Server;

  /** 获取当前http.Server实例 */
  public get server() {
    if (!this._server) this._server = new Server(this.handleRequest.bind(this));
    return this._server;
  }

  /**
   * 监听端口
   *
   * @param options 监听地址信息
   * @param listeningListener 回调函数
   */
  public listen(options: ListenOptions, listeningListener?: () => void) {
    this.server.listen(options, listeningListener);
  }

  /**
   * 附加到一个http.Server实例
   *
   * @param server http.Server实例
   */
  public attach(server: Server) {
    server.on("request", this.handleRequest.bind(this));
  }

  /**
   * 关闭服务器
   */
  public async close() {
    return new Promise((resolve, reject) => {
      if (this._server) {
        this._server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * 处理请求
   *
   * @param req ServerRequest对象
   * @param res ServerResponse对象
   * @param done 未处理请求的回调函数
   */
  public handleRequest = (
    req: ServerRequest,
    res: ServerResponse,
    done?: (err?: ErrorReason) => void
  ) => {
    this.handleRequestByRequestResponse(
      req,
      res,
      done || finalhandler(req, res)
    );
  };
}
