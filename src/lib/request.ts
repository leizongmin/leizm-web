import { ServerRequest } from 'http';
import { parse  as parseUrl } from 'url';
import * as parseCookies from 'cookie-parser';

export class Request {

  public path: string;
  public queryString: string;
  public query: Record<string, any>;

  public params: Record<string, any>;
  public body: Record<string, any>;
  public files: Record<string, any>;
  public cookies: Record<string, any>;
  public session: Record<string, any>;

  public get method() {
    return this.req.method;
  }

  public get url() {
    return this.req.url;
  }

  public get headers() {
    return this.req.headers;
  }

  constructor(public readonly req: ServerRequest) {
    const urlInfo = parseUrl(req.url, true);
    this.query = urlInfo.query;
    this.path = urlInfo.pathname;
    this.queryString = urlInfo.search.slice(1);
  }

}
