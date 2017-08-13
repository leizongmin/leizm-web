import { ServerResponse } from 'http';
import { EventEmitter } from 'events';

export class Response extends EventEmitter {

  constructor(public readonly res: ServerResponse) {
    super();
  }

  public setStatus(value: number) {
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

  public write(data: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.write.apply(this.res, arguments);
  }

  public end(data: string | Buffer | Uint8Array, encoding?: string, callback?: () => void): boolean {
    return this.res.end.apply(this.res, arguments);
  }

}
