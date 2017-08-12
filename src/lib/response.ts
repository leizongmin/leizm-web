import { ServerResponse } from 'http';

export class Response {

  constructor(public readonly res: ServerResponse) {}

  public status(value: number) {
    this.res.statusCode = value;
  }

  public setHeader(name: string, value: string | string[] | number) {
    this.res.setHeader(name, value);
  }

  public setHeaders(headers: Record<string, string | string[] | number>) {
    for (const name in headers) {
      this.setHeader(name, headers[name]);
    }
  }

  public setCookie(name: string, value: string) {

  }

  public sendFile(filename: string) {

  }

  public sendJSON(data: any) {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.end(JSON.stringify(data));
  }

  public send(data: any) {
    if (Buffer.isBuffer(data) || typeof data === 'string') {
      return this.res.end(data);
    }
    this.sendJSON(data);
  }

}
