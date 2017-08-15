import { ServerRequest } from 'http';
import { parse as parseQueryString } from 'querystring';
import * as parseUrl from 'parseurl';
import { Headers, ServerRequestEx } from './define';

export class Request {

  protected _pathPrefix: string = '';
  protected parsedUrlInfo: {
    path: string;
    search: string;
    query: Record<string, any>,
  };

  constructor(public readonly req: ServerRequest) {
    const req2 = req as ServerRequestEx;
    req2.originalUrl = req2.originalUrl || req.url;
    const info = parseUrl(req);
    this.parsedUrlInfo = {
      query: parseQueryString(info.query),
      path: info.pathname,
      search: info.search,
    };
  }

  public set pathPrefix(str: string) {
    this._pathPrefix = str.slice(-1) === '/' ? str.slice(0, -1) : str;
  }

  public reset(url: string, params: Record<string, string>) {
    this.pathPrefix = url;
    this.params = params;
  }

  public get method() {
    return this.req.method;
  }

  public get url() {
    return this.req.url.slice(this._pathPrefix.length);
  }

  public get path() {
    return this.parsedUrlInfo.path.slice(this._pathPrefix.length);
  }

  public get search() {
    return this.parsedUrlInfo.search;
  }

  public get query() {
    return this.parsedUrlInfo.query;
  }

  public get httpVersion() {
    return this.req.httpVersion;
  }

  public get headers() {
    return this.req.headers as Headers;
  }

  public getHeader(name: string) {
    return this.req.headers[name.toLowerCase()];
  }

  public get params(): Record<string, string> {
    return (this.req as any).prams || {};
  }

  public set params(value: Record<string, string>) {
    (this.req as any).prams = value;
  }

  public hasParams() {
    return !!(this.req as any).prams;
  }

  public get body(): Record<string, any> {
    return (this.req as any).body || {};
  }

  public set body(value: Record<string, any>) {
    (this.req as any).body = value;
  }

  public hasBody() {
    return !!(this.req as any).body;
  }

  public get files(): Record<string, any> {
    return (this.req as any).files || {};
  }

  public set files(value: Record<string, any>) {
    (this.req as any).files = value;
  }

  public hasFiles() {
    return !!(this.req as any).files;
  }

  public get cookies(): Record<string, string> {
    return (this.req as any).cookies || {};
  }

  public set cookies(value: Record<string, string>) {
    (this.req as any).cookies = value;
  }

  public hasCookies() {
    return !!(this.req as any).cookies;
  }

  public get session(): Record<string, any> {
    return (this.req as any).session || {};
  }

  public set session(value: Record<string, any>) {
    (this.req as any).session = value;
  }

  public hasSession() {
    return !!(this.req as any).session;
  }

}
