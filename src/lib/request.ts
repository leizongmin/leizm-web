/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage } from "http";
import { parse as parseUrl, Url } from "url";
import { Headers, ServerRequestEx } from "./define";
import { Context } from "./context";
import { Socket } from "net";
import { parseMultipart, MultipartParserOptions, FileField } from "./component/body";

/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

export class Request {
  /** 已解析的URL信息 */
  protected parsedUrlInfo: Url;

  constructor(public readonly req: IncomingMessage, public readonly ctx: Context) {
    const req2 = req as ServerRequestEx;
    req2.originalUrl = req2.originalUrl || req.url;
    this.parsedUrlInfo = parseUrl(req.url || "", true);
    req2.query = this.parsedUrlInfo.query as any;
  }

  /**
   * 初始化完成，由 `Context.init()` 自动调用
   * 一般用于自定义扩展 Request 时，在此方法中加上自己的祝时候完成的代码
   */
  public inited() {}

  /** 获取请求方法 */
  public get method() {
    return this.req.method;
  }

  /** 获取URL */
  public get url(): string {
    return (this.req as ServerRequestEx).url || "";
  }

  /** 更新URL */
  public set url(value: string) {
    (this.req as ServerRequestEx).url = this.parsedUrlInfo.path = value;
  }

  /** 获取Path（URL不包含查询字符串部分）*/
  public get path(): string {
    return this.parsedUrlInfo.pathname || "";
  }

  /** 设置Path（URL不包含查询字符串部分）*/
  public set path(value: string) {
    this.parsedUrlInfo.pathname = value;
  }

  /** 获取URL查询字符串部分 */
  public get search() {
    return this.parsedUrlInfo.search;
  }

  /** 获取已解析的URL查询字符串参数 */
  public get query() {
    return (this.req as ServerRequestEx).query;
  }

  /** 获取当前HTTP版本 */
  public get httpVersion() {
    return this.req.httpVersion;
  }

  /** 获取所有请求头 */
  public get headers() {
    return this.req.headers as Headers;
  }

  /**
   * 获取请求头
   *
   * @param name 名称
   */
  public getHeader(name: string) {
    return this.req.headers[name.toLowerCase()];
  }

  /** 获取URL参数 */
  public get params(): Record<string, string> {
    return (this.req as any).prams || {};
  }

  /** 设置URL参数 */
  public set params(value: Record<string, string>) {
    (this.req as any).prams = value;
  }

  /** 判断是否有URL参数 */
  public hasParams() {
    return !!(this.req as any).prams;
  }

  /** 获取请求Body参数 */
  public get body(): Record<string, any> {
    return (this.req as any).body || {};
  }

  /** 设置请求Body参数 */
  public set body(value: Record<string, any>) {
    (this.req as any).body = value;
  }

  /** 判断是否有请求Body参数 */
  public hasBody() {
    return !!(this.req as any).body;
  }

  /** 获取请求文件参数 */
  public get files(): Record<string, any> {
    return (this.req as any).files || {};
  }

  /** 设置请求文件参数 */
  public set files(value: Record<string, any>) {
    (this.req as any).files = value;
  }

  /** 判断是否有请求文件参数 */
  public hasFiles() {
    return !!(this.req as any).files;
  }

  /** 获取请求Cookies信息 */
  public get cookies(): Record<string, string> {
    return (this.req as any).cookies || {};
  }

  /** 设置请求Cookies信息 */
  public set cookies(value: Record<string, string>) {
    (this.req as any).cookies = value;
  }

  /** 判断是否有请求Cookie信息 */
  public hasCookies() {
    return !!(this.req as any).cookies;
  }

  /** 获取请求signedCookies信息 */
  public get signedCookies(): Record<string, string> {
    return (this.req as any).signedCookies || {};
  }

  /** 设置请求signedCookies信息 */
  public set signedCookies(value: Record<string, string>) {
    (this.req as any).signedCookies = value;
  }

  /** 判断是否有请求signedCookies信息 */
  public hasSignedCookies() {
    return !!(this.req as any).signedCookies;
  }

  /** 获取请求Session信息 */
  public get session(): Record<string, any> {
    return (this.req as any).session || {};
  }

  /** 设置请求Session信息 */
  public set session(value: Record<string, any>) {
    (this.req as any).session = value;
  }

  /** 判断是否有请求Session信息 */
  public hasSession() {
    return !!(this.req as any).session;
  }

  /** 客户端IP地址，来源于req.socket.remoteAddress */
  public get ip() {
    return this.req.socket.remoteAddress;
  }

  /** 请求的socket对象 */
  public get socket(): Socket {
    return this.req.socket;
  }

  /** 解析multipart内容 */
  public async parseMultipart(
    options: MultipartParserOptions = {},
  ): Promise<{
    body: Record<string, any>;
    files: Record<string, FileField>;
  }> {
    await parseMultipart(this.ctx, options);
    return { body: this.body, files: this.files };
  }
}
