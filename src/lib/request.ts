import { ServerRequest } from "http";
import { parse as parseQueryString } from "querystring";
import * as parseUrl from "parseurl";
import { Headers, ServerRequestEx } from "./define";
import { Context } from "./context";

export class Request {
  /** 当前中间件的URL前缀 */
  protected _pathPrefix: string = "";
  /** 已解析的URL信息 */
  protected parsedUrlInfo: {
    path: string;
    search: string;
    query: Record<string, any>;
  };

  constructor(
    public readonly req: ServerRequest,
    public readonly ctx: Context
  ) {
    const req2 = req as ServerRequestEx;
    req2.originalUrl = req2.originalUrl || req.url;
    const info = parseUrl(req);
    this.parsedUrlInfo = {
      query: parseQueryString(info.query),
      path: info.pathname,
      search: info.search
    };
    (req as any).query = this.query;
  }

  /**
   * 初始化完成
   */
  public inited() {}

  /** 设置当前中间件的URL前缀 */
  public set pathPrefix(str: string) {
    this._pathPrefix = str.slice(-1) === "/" ? str.slice(0, -1) : str;
  }

  /** 获取当前中间件的URL前缀 */
  public get pathPrefix() {
    return this._pathPrefix ? this._pathPrefix : "/";
  }

  /**
   * 重置当前中间件的URL前缀和URL参数信息
   *
   * @param url 前中间件的URL前缀
   * @param params URL参数信息
   */
  public reset(url: string, params: Record<string, string>) {
    this.pathPrefix = url;
    this.params = params;
  }

  /** 获取请求方法 */
  public get method() {
    return this.req.method;
  }

  /** 获取相对URL */
  public get url() {
    return this.req.url.slice(this._pathPrefix.length);
  }

  /** 获取相对Path（URL不包含查询字符串部分） */
  public get path() {
    return this.parsedUrlInfo.path.slice(this._pathPrefix.length);
  }

  /** 获取URL查询字符串部分 */
  public get search() {
    return this.parsedUrlInfo.search;
  }

  /** 获取已解析的URL查询字符串参数 */
  public get query() {
    return this.parsedUrlInfo.query;
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
}
