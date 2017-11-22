import { ServerResponse } from "http";
import { Context } from "./context";

export class Response {
  constructor(
    public readonly res: ServerResponse,
    public readonly ctx: Context
  ) {}

  /**
   * 初始化完成
   */
  public inited() {}

  /**
   * 设置响应状态码
   *
   * @param statusCode 响应状态码
   */
  public setStatus(statusCode: number) {
    this.res.statusCode = statusCode;
  }

  /**
   * 获取响应头
   *
   * @param name 名称
   */
  public getHeader(name: string): string | string[] | number {
    return this.res.getHeader(name);
  }

  /**
   * 获取所有响应头
   *
   * @param name 名称
   */
  public getHeaders(): Record<string, string | string[] | number> {
    return this.res.getHeaders();
  }

  /**
   * 设置响应头
   *
   * @param name 名称
   * @param value 值
   */
  public setHeader(name: string, value: string | string[] | number) {
    this.res.setHeader(name, value);
  }

  /**
   * 添加响应头
   *
   * @param name 名称
   * @param value 值
   */
  public appendHeader(name: string, value: string | string[] | number) {
    let header = this.getHeader(name) as any[];
    if (!header) {
      header = [];
    } else if (!Array.isArray(header)) {
      header = [header];
    }
    if (Array.isArray(value)) {
      header = header.concat(value);
    } else {
      header.push(value);
    }
    this.setHeader(name, header);
  }

  /**
   * 设置响应头
   *
   * @param headers 响应头
   */
  public setHeaders(headers: Record<string, string | string[] | number>) {
    for (const name in headers) {
      this.setHeader(name, headers[name]);
    }
  }

  /**
   * 删除响应头
   *
   * @param name 名称
   */
  public removeHeader(name: string) {
    this.res.removeHeader(name);
  }

  /**
   * 写响应头
   *
   * @param statusCode 响应状态码
   * @param headers 响应头
   */
  public writeHead(
    statusCode: number,
    headers: Record<string, string | string[] | number>
  ) {
    this.res.writeHead(statusCode, headers);
  }

  /**
   * 输出数据
   *
   * @param data 要输出的数据
   * @param encoding 字符编码
   * @param callback 回调函数
   */
  public write(
    data: string | Buffer | Uint8Array,
    encoding?: string,
    callback?: () => void
  ): boolean {
    return this.res.write.apply(this.res, arguments);
  }

  /**
   * 输出数据并结束
   *
   * @param data 要输出的数据
   * @param encoding 字符编码
   * @param callback 回调函数
   */
  public end(
    data: string | Buffer | Uint8Array,
    encoding?: string,
    callback?: () => void
  ): boolean {
    return this.res.end.apply(this.res, arguments);
  }
}
