import { ServerResponse } from 'http';

export class Response {

  constructor(public readonly res: ServerResponse) {}

  public setStatus(statusCode: number) {
    this.res.statusCode = statusCode;
  }

  public getHeader(name: string): string | string[] | number {
    return this.res.getHeader(name);
  }

  public setHeader(name: string, value: string | string[] | number) {
    this.res.setHeader(name, value);
  }

  public setHeaders(headers: Record<string, string | string[] | number>) {
    for (const name in headers) {
      this.setHeader(name, headers[name]);
    }
  }

  public removeHeader(name: string) {
    this.res.removeHeader(name);
  }

  public writeHead(statusCode: number, headers: Record<string, string | string[] | number>) {
    this.res.writeHead(statusCode, headers);
  }

  public write(data: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.write.apply(this.res, arguments);
  }

  public end(data: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.end.apply(this.res, arguments);
  }

}
