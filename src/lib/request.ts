import { ServerRequest } from 'http';
import { parse  as parseUrl } from 'url';
import * as parseCookies from 'cookie-parser';

export class Request {

  public readonly path: string;
  public readonly queryString: string;
  public readonly query: Record<string, any>;

  constructor(public readonly req: ServerRequest) {
    const urlInfo = parseUrl(req.url, true);
    this.query = urlInfo.query;
    this.path = urlInfo.pathname;
    this.queryString = urlInfo.search.slice(1);
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

  public get params(): Record<string, any> {
    return (this.req as any).prams || {};
  }

  public hasParams() {
    return !!(this.req as any).prams;
  }

  public get body(): Record<string, any> {
    return (this.req as any).body || {};
  }

  public hasBody() {
    return !!(this.req as any).body;
  }

  public get files(): Record<string, any> {
    return (this.req as any).files || {};
  }

  public hasFiles() {
    return !!(this.req as any).files;
  }

  public get cookies(): Record<string, any> {
    return (this.req as any).cookies || {};
  }

  public hasCookies() {
    return !!(this.req as any).cookies;
  }

  public get session(): Record<string, any> {
    return (this.req as any).session || {};
  }

  public hasSession() {
    return !!(this.req as any).session;
  }

}
