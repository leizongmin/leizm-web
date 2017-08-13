import { ServerRequest } from 'http';
import { EventEmitter } from 'events';
import * as parseUrl from 'parseurl';

export class Request extends EventEmitter {

  public readonly path: string;
  public readonly search: string;
  public readonly query: Record<string, any>;

  constructor(public readonly req: ServerRequest) {
    super();
    const info = parseUrl(req);
    this.query = info.query;
    this.path = info.pathname;
    this.search = info.search;
  }

  public get method() {
    return this.req.method;
  }

  public get url() {
    return this.req.url;
  }

  public get httpVersion() {
    return this.req.httpVersion;
  }

  public get headers() {
    return this.req.headers;
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
