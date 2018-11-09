/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { EventEmitter } from "events";
import { createConnection, Socket } from "net";
import { RedisCompatibleClient } from "../component/session.redis";

class RedisParser {
  /** 已初步解析出来的行 */
  protected _lines: string[] = [];
  /** 剩余不能构成一行的文本 */
  protected _text: string = "";
  /** 解析结果 */
  public result: any;

  /**
   * 将收到的数据添加到缓冲区
   */
  public push(text: string | Buffer) {
    // 将结果按照\r\n 分隔
    const lines = (this._text + text.toString()).split("\r\n");
    // 如果结尾是\r\n，那么数组最后一个元素肯定是一个空字符串
    // 否则，我们应该将剩余的部分跟下一个 data 事件接收到的数据连起来
    this._text = lines.pop() || "";
    this._lines = this._lines.concat(...lines);
  }

  /**
   * 解析下一个结果，如果没有则返回 null
   */
  public next() {
    const lines = this._lines;
    const first = lines[0];

    // 去掉指定数量的行，并且返回结果
    const popResult = (lineNumber: number, result: { data?: any; error?: string }) => {
      this._lines = this._lines.slice(lineNumber);
      return (this.result = result);
    };

    // 返回空结果
    const popEmpty = () => {
      return (this.result = false);
    };

    if (lines.length < 1) return popEmpty();

    switch (first[0]) {
      case "+":
        return popResult(1, { data: first.slice(1) });

      case "-":
        return popResult(1, { error: first.slice(1) });

      case ":":
        return popResult(1, { data: Number(first.slice(1)) });

      case "$": {
        const n = Number(first.slice(1));
        if (n === -1) {
          // 如果是 $-1 表示空结果
          return popResult(1, { data: null });
        } else {
          // 否则取后面一行作为结果
          const second = lines[1];
          if (typeof second !== "undefined") {
            return popResult(2, { data: second });
          } else {
            return popEmpty();
          }
        }
      }

      case "*": {
        const n = Number(first.slice(1));
        if (n === 0) {
          return popResult(1, { data: [] });
        } else {
          const array = [];
          let i = 1;
          for (; i < lines.length && array.length < n; i++) {
            const a = lines[i];
            const b = lines[i + 1];
            if (a.slice(0, 3) === "$-1") {
              array.push(null);
            } else if (a[0] === ":") {
              array.push(Number(a.slice(1)));
            } else {
              if (typeof b !== "undefined") {
                array.push(b);
                i++;
              } else {
                return popEmpty();
              }
            }
          }
          if (array.length === n) {
            return popResult(i, { data: array });
          } else {
            return popEmpty();
          }
        }
      }

      default:
        return popEmpty();
    }
  }
}

export interface SimpleRedisClientOptions {
  /** Redis服务器地址 */
  host?: string;
  /** Redis服务器端口 */
  port?: number;
  /** Redis服务器数据库号 */
  db?: number;
  /** Redis服务器密码 */
  password?: string;
}

export const DEFAULT_REDIS_OPTIONS: Required<SimpleRedisClientOptions> = {
  host: "127.0.0.1",
  port: 6379,
  db: 0,
  password: "",
};

export class SimpleRedisClient extends EventEmitter implements RedisCompatibleClient {
  protected _parser: RedisParser = new RedisParser();
  /** 回调函数列表 */
  protected _callbacks: Array<(err: Error | null, ret: any) => void> = [];
  /** 待发送数据列表 */
  protected _sendBuffers: Array<string | Buffer> = [];
  /** 连接状态 */
  protected _isConnected: boolean = false;
  protected _isConnecting: boolean = false;
  /** 参数 */
  protected readonly options: Required<SimpleRedisClientOptions>;
  /** 连接实例 */
  public socket?: Socket;

  constructor(options: SimpleRedisClientOptions = {}) {
    super();

    this.options = {
      ...DEFAULT_REDIS_OPTIONS,
      ...options,
    };
  }

  public get connected() {
    return this._isConnected;
  }

  /**
   * 接收到数据，循环结果
   */
  protected _pushData(data: Buffer) {
    this._parser.push(data);

    while (this._parser.next()) {
      const result = this._parser.result;
      const cb = this._callbacks.shift();
      if (result.error) {
        cb!(new Error(result.error), null);
      } else {
        cb!(null, result.data);
      }
    }
  }

  /**
   * 连接
   */
  protected _connect() {
    if (this._isConnecting) return;

    this._isConnected = false;
    this.socket = createConnection(this.options.port, this.options.host, () => {
      this._isConnected = true;
      this._isConnecting = false;
      this.emit("connect");
      if (this.options.password) {
        this.preCommand(["AUTH", this.options.password], err => {
          if (err) {
            this.emit("error", new Error(`auth failed: ${err.message}`));
          }
        });
      }
      if (this.options.db > 0) {
        this.preCommand(["SELECT", this.options.db], err => {
          if (err) {
            this.emit("error", new Error(`select database failed: ${err.message}`));
          }
        });
      }
      this._sendBuffers.forEach(data => this.socket!.write(data));
      this._sendBuffers = [];
    });
    this._isConnecting = true;
    this.socket.on("error", err => {
      this._isConnecting = false;
      this.emit("error", err);
    });

    this.socket.on("close", () => {
      this._isConnecting = false;
      delete this.socket;
      // 处理未完成的任务和回调
      const callbacks = this._callbacks.slice();
      this._callbacks = [];
      this._sendBuffers = [];
      this._parser = new RedisParser();
      callbacks.forEach(callback => callback(new Error(`connection has been closed`), null));
      this.emit("close");
    });
    this.socket.on("end", () => {
      this.emit("end");
    });
    this.socket.on("data", data => {
      this._pushData(data);
    });
  }

  /**
   * 发送命令给服务器
   * @param cmd
   * @param callback
   */
  public command(cmd: Array<string | number | boolean>, callback: (err: Error | null, ret: any) => void) {
    setImmediate(() => {
      this._callbacks.push(callback);
      const data = `${cmd.map(stringify).join(" ")}\r\n`;
      if (this.socket) {
        this.socket.write(data);
      } else {
        this._sendBuffers.push(data);
        this._connect();
      }
    });
  }

  protected preCommand(cmd: Array<string | number | boolean>, callback: (err: Error | null, ret: any) => void) {
    this._callbacks.push(callback);
    const data = `${cmd.map(stringify).join(" ")}\r\n`;
    if (this.socket) {
      this.socket.write(data);
    }
  }

  /**
   * 关闭连接
   */
  public end() {
    if (this.socket) {
      this.socket.destroy();
    }
  }

  public get(key: string, callback: (err: Error | null, ret: any) => void): void {
    return this.command(["GET", key], callback);
  }
  public setex(key: string, ttl: number, data: string, callback: (err: Error | null, ret: any) => void): void {
    return this.command(["SETEX", key, ttl, data], callback);
  }
  public expire(key: string, ttl: number, callback: (err: Error | null, ret: any) => void): void {
    return this.command(["EXPIRE", key, ttl], callback);
  }
  public del(key: string, callback: (err: Error | null, ret: any) => void): void {
    return this.command(["DEL", key], callback);
  }
}

function stringify(v: string | number | boolean): string {
  return JSON.stringify(v);
}

// const conn = new SimpleRedisClient({ db: 5 });
// setInterval(() => {
//   console.log(conn);
//   conn.command(["set", "abc", Date.now()], (err, ret) => {
//     console.log(err, ret);
//   });
// }, 2000);
// conn.on("error", err => console.log("redis error", err));
