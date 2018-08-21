/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as path from "path";
import { ServerResponse } from "http";
import { Context } from "./context";
import { sign as signCookie } from "cookie-signature";
import * as cookie from "cookie";
import * as send from "send";
import * as mime from "mime";
import { CookieOptions, TemplateRenderData, SYMBOL_CONNECT } from "./define";
import { notifyDeprecated } from "./utils";

export class Response {
  constructor(public readonly res: ServerResponse, public readonly ctx: Context) {}

  /**
   * 初始化完成，由 `Context.init()` 自动调用
   * 一般用于自定义扩展 Response 时，在此方法中加上自己的祝时候完成的代码
   */
  public inited() {}

  /**
   * 响应状态码
   */
  get statusCode(): number {
    return this.res.statusCode;
  }

  /**
   * 响应状态消息
   */
  get statusMessage(): string {
    return this.res.statusMessage;
  }

  /**
   * 响应头是否已发送
   */
  get headersSent(): boolean {
    return this.res.headersSent;
  }

  /**
   * 是否已响应完成
   */
  get finished(): boolean {
    return this.res.finished;
  }

  /**
   * 设置响应状态码（弃用，请使用 status 代替）
   *
   * @param statusCode 响应状态码
   */
  public setStatus(statusCode: number): this {
    notifyDeprecated("response.setStatus(code)", "response.status(code)", "3.0.0");
    return this.status(statusCode);
  }

  /**
   * 设置响应状态码
   *
   * @param statusCode 响应状态码
   */
  public status(statusCode: number): this {
    this.res.statusCode = statusCode;
    return this;
  }

  /**
   * 获取响应头
   *
   * @param name 名称
   */
  public getHeader(name: string): string | string[] | number | undefined {
    return this.res.getHeader(name);
  }

  /**
   * 获取所有响应头
   *
   * @param name 名称
   */
  public getHeaders(): Record<string, string | string[] | number> {
    return (this.res.getHeaders ? this.res.getHeaders() : (this.res as any)._headers) || {};
  }

  /**
   * 设置响应头
   *
   * @param name 名称
   * @param value 值
   */
  public setHeader(name: string, value: string | string[] | number): this {
    this.res.setHeader(name, value);
    return this;
  }

  /**
   * 添加响应头
   *
   * @param name 名称
   * @param value 值
   */
  public appendHeader(name: string, value: string | string[] | number): this {
    let header = this.getHeader(name) as any[];
    if (!header) {
      header = [];
    } else if (!Array.isArray(header)) {
      header = [header];
    }
    if (Array.isArray(value)) {
      header = header.concat(value);
    } else {
      header.push(value);
    }
    this.setHeader(name, header);
    return this;
  }

  /**
   * 设置响应头
   *
   * @param headers 响应头
   */
  public setHeaders(headers: Record<string, string | string[] | number>): this {
    for (const name in headers) {
      this.setHeader(name, headers[name]);
    }
    return this;
  }

  /**
   * 删除响应头
   *
   * @param name 名称
   */
  public removeHeader(name: string): this {
    this.res.removeHeader(name);
    return this;
  }

  /**
   * 写响应头
   *
   * @param statusCode 响应状态码
   * @param headers 响应头
   */
  public writeHead(statusCode: number, headers: Record<string, string | string[] | number>): this {
    this.res.writeHead(statusCode, headers);
    return this;
  }

  /**
   * 根据文件名或文件后缀设置 Content-Type
   *
   * @param fileName
   */
  public type(fileName: string): this {
    const type = mime.getType(fileName);
    if (type) {
      this.setHeader("Content-Type", type);
    }
    return this;
  }

  /**
   * 输出数据
   *
   * @param data 要输出的数据
   * @param encoding 字符编码
   * @param callback 回调函数
   */
  public write(data: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.write.apply(this.res, arguments);
  }

  /**
   * 输出数据并结束
   *
   * @param data 要输出的数据
   * @param encoding 字符编码
   * @param callback 回调函数
   */
  public end(data?: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.end.apply(this.res, arguments);
  }

  /**
   * 响应JSON
   * @param data 数据
   */
  public json(data: any): void {
    this.setHeader("Content-Type", "application/json");
    this.end(JSON.stringify(data));
  }

  /**
   * 响应HTML页面
   * @param str 内容
   */
  public html(str: Buffer | string): void {
    this.setHeader("Content-Type", "text/html; charset=utf-8");
    this.end(str);
  }

  /**
   * 响应文件内容
   * @param file 文件名
   * @param options
   */
  public file(file: string, options?: send.SendOptions) {
    send(this.ctx.request.req, path.resolve(file), options)
      .on("error", err => {
        this.res.statusCode = err.status || 500;
        this.res.end(err.message);
      })
      .pipe(this.res);
  }

  /**
   * HTTP 302 临时重定向（弃用，请使用 redirectTemporary 代替）
   * @param url 网址
   * @param content 内容
   */
  public temporaryRedirect(url: string, content: string = ""): void {
    notifyDeprecated("response.temporaryRedirect()", "response.redirectTemporary()", "3.0.0");
    return this.redirectTemporary(url, content);
  }

  /**
   * HTTP 302 临时重定向
   * @param url 网址
   * @param content 内容
   */
  public redirectTemporary(url: string, content: string = ""): void {
    this.writeHead(302, { Location: url });
    this.end(content);
  }

  /**
   * HTTP 301 永久重定向（弃用，请使用 redirectPermanent 代替）
   * @param url 网址
   * @param content 内容
   */
  public permanentRedirect(url: string, content: string = ""): void {
    notifyDeprecated("response.permanentRedirect()", "response.redirectPermanent()", "3.0.0");
    return this.redirectPermanent(url, content);
  }

  /**
   * HTTP 301 永久重定向
   * @param url 网址
   * @param content 内容
   */
  public redirectPermanent(url: string, content: string = ""): void {
    this.writeHead(301, { Location: url });
    this.end(content);
  }

  /**
   * 删除Cookie
   * @param name 名称
   * @param options 选项
   */
  public clearCookie(name: string, options: CookieOptions = {}) {
    this.cookie(name, "", { expires: new Date(1), path: "/", ...options });
  }

  /**
   * 设置Cookie
   * @param name 名称
   * @param value 值
   * @param options 选项
   */
  public cookie(name: string, value: any, options: CookieOptions = {}) {
    const opts = { ...options };
    const secret = (this.ctx.request.req as any).secret;
    if (opts.signed && !secret) {
      throw new Error('cookieParser("secret") required for signed cookies');
    }
    let val = typeof value === "object" ? "j:" + JSON.stringify(value) : String(value);
    if (opts.signed) {
      val = "s:" + signCookie(val, secret);
    }
    if ("maxAge" in opts && opts.maxAge) {
      opts.expires = new Date(Date.now() + opts.maxAge);
      opts.maxAge /= 1000;
    }
    if (opts.path == null) {
      opts.path = "/";
    }
    this.appendHeader("Set-Cookie", cookie.serialize(name, String(val), opts));
  }

  /**
   * 渲染模板
   * @param name 模板名称
   * @param data 模板数据
   */
  public async render(name: string, data: TemplateRenderData = {}): Promise<void> {
    try {
      const html = await this.ctx[SYMBOL_CONNECT]!.templateEngine.render(name, data);
      if (!this.getHeader("Content-Type")) {
        this.setHeader("Content-Type", "text/html; charset=utf-8");
      }
      this.end(html);
    } catch (err) {
      this.ctx.next(err);
    }
  }
}
