import { ServerRequest } from 'http';
import { parse as parseQueryString } from 'querystring';
import * as parseUrl from 'parseurl';
import { Headers } from './define';

export class Request {

  public pathPrefix: string = '';
  protected parsedUrlInfo: {
    path: string;
    search: string;
    query: Record<string, any>,
  };

  constructor(public readonly req: ServerRequest) {
    const info = parseUrl(req);
    this.parsedUrlInfo = {
      query: parseQueryString(info.query),
      path: info.pathname,
      search: info.search,
    };
  }

  public get method() {
    return this.req.method;
  }

  public get url() {
    return this.req.url.slice(this.pathPrefix.length);
  }

  public get path() {
    return this.parsedUrlInfo.path.slice(this.pathPrefix.length);
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
