import { ServerResponse } from 'http';

export class Response {

  constructor(public readonly res: ServerResponse) {}

  public set status(value: number) {
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

  }

}
