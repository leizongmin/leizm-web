/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle, CookieOptions } from "../define";
import * as uuid from "uuid";
import { crc32 } from "crc";

/** Session中间件 */
export function session(options: SessionOptions): MiddlewareHandle<Context> {
  const opts: Required<SessionOptions> = { ...DEFAULT_OPTIONS, ...options };
  const isSigned = !!(opts.cookie && opts.cookie.signed);
  const cookieName = opts.name;
  opts.cookie.maxAge = opts.maxAge;

  return async function(ctx: Context) {
    const currentSid: string = (isSigned ? ctx.request.signedCookies : ctx.request.cookies)[cookieName];
    const sid = currentSid || opts.genid(ctx);
    const sess = ((ctx as any).session = new SessionInstance(ctx, sid, opts));
    ctx.request.session = sess.data;
    if (currentSid) {
      // 旧的session，需要载入其数据
      await sess.reload();
    }
    ctx.onWriteHead(() => {
      ctx.response.cookie(sess.cookieName, sess.id, sess.cookie.options);
      sess.save();
    });
    ctx.next();
  };
}

/** 用于生成SessionId的函数 */
export type GenerateSessionIdFunction = (ctx: Context) => string;

/** Session中间件初始化选项 */
export interface SessionOptions {
  /** 存储引擎实例 */
  store: SessionStore;
  /** Cookie名称 */
  name?: string;
  /** Cookie选项 */
  cookie?: CookieOptions;
  /** 生成SessionId的函数 */
  genid?: GenerateSessionIdFunction;
  /** Session有效时间（单位：毫秒），此参数会覆盖cookie中的maxAge */
  maxAge?: number;
}

export interface SessionStore {
  /**
   * 获取session
   * @param sid
   */
  get(sid: string): Promise<Record<string, any>>;

  /**
   * 设置session
   * @param sid
   * @param data
   * @param maxAge
   */
  set(sid: string, data: Record<string, any>, maxAge: number): Promise<void>;

  /**
   * 销毁Session
   * @param sid
   */
  destroy(sid: string): Promise<void>;

  /**
   * 保持session激活
   * @param sid
   * @param maxAge
   */
  touch(sid: string, maxAge: number): Promise<void>;
}

export class SessionInstance {
  public readonly cookieName: string;
  public readonly store: Required<SessionStore>;
  public readonly maxAge: number;
  public cookie: Cookie;
  protected _data: Record<string, any> = {};
  protected _hash: string = "";

  constructor(public readonly ctx: Context, public readonly id: string, options: Required<SessionOptions>) {
    this.store = options.store;
    this.cookieName = options.name;
    this.maxAge = options.maxAge;
    this.cookie = new Cookie(options.cookie);
  }

  public get data() {
    return this._data;
  }

  public set data(v) {
    this._data = this.ctx.request.session = v;
  }

  public regenerate(): Promise<void> {
    return this.destroy().then(() => {
      this.data = {};
    });
  }

  public destroy(): Promise<void> {
    return this.store.destroy(this.id);
  }

  public reload(): Promise<void> {
    return this.store.get(this.id).then(data => {
      this.data = data;
      this._hash = getDataHash(this.data);
    });
  }

  public save(): Promise<void> {
    const hash = getDataHash(this.data);
    if (hash === this._hash) {
      // 如果内容没有改变，则只执行touch
      return this.touch();
    }
    return this.forceSave();
  }

  public forceSave(): Promise<void> {
    return this.store.set(this.id, this.data, this.maxAge);
  }

  public touch(): Promise<void> {
    return this.store.touch(this.id, this.maxAge);
  }
}

export function getDataHash(data: any): string {
  return crc32(JSON.stringify(data)).toString(16);
}

export class Cookie {
  constructor(public readonly options: CookieOptions = {}) {
    this.options = { ...this.options, ...DEFAULT_COOKIE };
  }

  public get path() {
    return this.options.path;
  }
  public get domain() {
    return this.options.domain;
  }
  public get maxAge() {
    return this.options.maxAge;
  }
  public get httpOnly() {
    return this.options.httpOnly;
  }
  public get secure() {
    return this.options.secure;
  }
  public get expires() {
    return this.options.expires;
  }

  public set path(v) {
    this.options.path = v;
  }
  public set domain(v) {
    this.options.domain = v;
  }
  public set maxAge(v) {
    this.options.maxAge = v;
  }
  public set httpOnly(v) {
    this.options.httpOnly = v;
  }
  public set secure(v) {
    this.options.secure = v;
  }
  public set expires(v) {
    this.options.expires = v;
  }
}

export class SessiionMemoryStore implements SessionStore {
  protected data: Map<
    string,
    {
      expires: Date;
      value: Record<string, any>;
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
      resolve(data.value);
    });
  }

  public set(sid: string, data: Record<string, any>, maxAge: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const expires = new Date(Date.now() + maxAge);
      this.data.set(sid, { expires, value: data });
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

/** 默认生成SessionId的函数 */
export const DEFAULT_GENID = (ctx: Context) => uuid.v4().replace(/-/g, "");

/** 默认SessionId存储于Cookie的名称 */
export const DEFAULT_NAME = "web.sid";

/** 默认Cookie选项 */
export const DEFAULT_COOKIE: CookieOptions = { path: "/", httpOnly: true };

/** 默认Session MaxAge */
export const DEFAULT_MAX_AGE = 0;

export const DEFAULT_OPTIONS: Required<SessionOptions> = {
  cookie: DEFAULT_COOKIE,
  genid: DEFAULT_GENID,
  name: DEFAULT_NAME,
  store: new SessiionMemoryStore(),
  maxAge: DEFAULT_MAX_AGE,
};
