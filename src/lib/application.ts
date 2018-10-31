/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Server, IncomingMessage, ServerResponse } from "http";
import finalhandler from "./finalhandler";
import { Core } from "./core";
import { Router } from "./router";
import { ListenOptions, ErrorReason, SYMBOL_CONNECT, SYMBOL_SERVER } from "./define";
import { Context } from "./context";
import { Request } from "./request";
import { Response } from "./response";
import { TemplateEngineManager } from "./template";
import { notifyDeprecated } from "./utils";

export class Application<C extends Context = Context<Request, Response>> extends Core<C> {
  /** 默认Router实例，第一次使用时创建并use() */
  protected defaultRouter?: Router<C>;

  /** http.Server实例 */
  public [SYMBOL_SERVER]: Server;

  /** 模板引擎管理器 */
  public templateEngine: TemplateEngineManager = new TemplateEngineManager();

  /** 获取默认Router */
  public get router(): Router<C> {
    if (!this.defaultRouter) {
      this.defaultRouter = new Router();
      this.use("/", this.defaultRouter);
    }
    return this.defaultRouter;
  }

  /** 获取当前http.Server实例 */
  public get server() {
    if (!this[SYMBOL_SERVER]) this[SYMBOL_SERVER] = new Server(this.handleRequest.bind(this));
    return this[SYMBOL_SERVER];
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
    this[SYMBOL_SERVER] = server;
    server.on("request", this.handleRequest.bind(this));
  }

  /**
   * 关闭服务器
   */
  public async close() {
    return new Promise((resolve, reject) => {
      if (this[SYMBOL_SERVER]) {
        this[SYMBOL_SERVER]!.close(() => resolve());
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
  public handleRequest = (req: IncomingMessage, res: ServerResponse, done?: (err?: ErrorReason) => void) => {
    done =
      done ||
      function(err?: ErrorReason) {
        return finalhandler(req, res)(err);
      };
    const ctx = this.createContext(req, res);
    this.handleRequestByContext(ctx, done);
  };

  /**
   * 创建Context对象
   *
   * @param req 原始ServerRequest对象
   * @param res 原始ServerResponse对象
   */
  protected createContext(req: IncomingMessage, res: ServerResponse): C {
    const ctx = super.createContext(req, res);
    ctx[SYMBOL_CONNECT] = this as any;
    return ctx;
  }
}

export class Connect<C extends Context = Context<Request, Response>> extends Application<C> {
  constructor() {
    super();
    notifyDeprecated("new Connect()", "new Application()", "3.0.0");
  }
}
