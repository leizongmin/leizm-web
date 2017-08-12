import { ServerRequest } from 'http';
import { parse  as parseUrl } from 'url';
import * as parseCookies from 'cookie-parser';

export class Request {

  public readonly pathname: string;
  public readonly search: string;
  public readonly query: Record<string, any>;

  constructor(public readonly req: ServerRequest) {
    const urlInfo = parseUrl(req.url, true);
    this.query = urlInfo.query;
    this.pathname = urlInfo.pathname;
    this.search = urlInfo.search;
  }

  public get method() {
    return this.req.method;
  }

  public get url() {
    return this.req.url;
  }

  public get headers() {
    return this.req.headers;
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
