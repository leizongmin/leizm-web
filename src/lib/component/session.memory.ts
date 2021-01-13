/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import {
  SessionStore,
  DEFAULT_SESSION_SERIALIZE as serialize,
  DEFAULT_SESSION_DESERIALIZE as deserialize,
} from "./session";

export class SessionMemoryStore implements SessionStore {
  protected data: Map<
    string,
    {
      expires: Date;
      value: string;
    }
  > = new Map();

  protected isExpired(expires: Date): boolean {
    return expires.getTime() < Date.now();
  }

  public get(sid: string): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const data = this.data.get(sid);
      if (!data) return resolve({});
      if (this.isExpired(data.expires)) {
        this.data.delete(sid);
        return resolve({});
      }
      resolve(deserialize(data.value));
    });
  }

  public set(sid: string, data: Record<string, any>, maxAge: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const expires = new Date(Date.now() + maxAge);
      this.data.set(sid, { expires, value: serialize(data) });
      resolve();
    });
  }

  public destroy(sid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.data.delete(sid);
      resolve();
    });
  }

  public touch(sid: string, maxAge: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = this.data.get(sid);
      if (data) {
        data.expires = new Date(data.expires.getTime() + maxAge);
        this.data.set(sid, data);
      }
      resolve();
    });
  }
}
