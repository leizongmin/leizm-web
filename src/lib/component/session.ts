/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle, CookieOptions } from "../define";
import { SessiionMemoryStore } from "./session.memory";
import * as uuid from "uuid";
import { crc32 } from "crc";

/**
 * Session中间件
 * 注意：需要依赖cookieParser中间件，否则无法正确取得sessionId
 */
export function session(options: SessionOptions = {}): MiddlewareHandle<Context> {
  const opts: Required<SessionOptions> = { ...DEFAULT_SESSION_OPTIONS, ...options };
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
      ctx.response.cookie(sess.cookieName, sess.id, opts.cookie);
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
  store?: SessionStore;
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
  protected _data: Record<string, any> = {};
  protected _hash: string = "";
  protected _isDestroy: boolean = false;

  constructor(public readonly ctx: Context, public readonly id: string, options: Required<SessionOptions>) {
    this.store = options.store;
    this.cookieName = options.name;
    this.maxAge = options.maxAge;
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
      this._isDestroy = false;
    });
  }

  public destroy(): Promise<void> {
    return this.store.destroy(this.id).then(() => {
      this.data = {};
      this._hash = "";
      this._isDestroy = true;
    });
  }

  public reload(): Promise<void> {
    return this.store.get(this.id).then(data => {
      this.data = data;
      this._hash = getDataHash(this.data);
    });
  }

  public save(): Promise<void> {
    if (this._isDestroy) return Promise.resolve();
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

/** 默认生成SessionId的函数 */
export const DEFAULT_SESSION_GENID: GenerateSessionIdFunction = (ctx: Context) => uuid.v4().replace(/-/g, "");

/** 默认SessionId存储于Cookie的名称 */
export const DEFAULT_SESSION_NAME = "web.sid";

/** 默认Cookie选项 */
export const DEFAULT_SESSION_COOKIE: CookieOptions = { path: "/", httpOnly: true };

/** 默认Session MaxAge */
export const DEFAULT_SESSION_MAX_AGE = 0;

/** 默认Session中间件选项 */
export const DEFAULT_SESSION_OPTIONS: Required<SessionOptions> = {
  cookie: DEFAULT_SESSION_COOKIE,
  genid: DEFAULT_SESSION_GENID,
  name: DEFAULT_SESSION_NAME,
  store: new SessiionMemoryStore(),
  maxAge: DEFAULT_SESSION_MAX_AGE,
};

/** Session数据序列化函数 */
export type SessionDataSerializeFunction = (data: any) => string;

/** Session数据反序列化函数 */
export type SessionDataUnSerializeFunction = (data: string) => any;

/** 默认Session数据序列化函数 */
export const DEFAULT_SESSION_SERIALIZE = (data: any) => JSON.stringify(data || {});

/** 默认Session数据反序列化函数 */
export const DEFAULT_SESSION_UNSERIALIZE = (data: string) => JSON.parse(data) || {};
