/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import {
  SessionStore,
  SessionDataSerializeFunction,
  SessionDataDeserializeFunction,
  DEFAULT_SESSION_SERIALIZE,
  DEFAULT_SESSION_DESERIALIZE,
} from "./session";
import { SimpleRedisClientOptions, SimpleRedisClient } from "../module/simple.redis";

/** 默认Redis Key前缀 */
export const DEFAULT_REDIS_PREFIX = "sess:";

export interface SessionRedisStoreOptions extends SimpleRedisClientOptions {
  /** key前缀 */
  prefix?: string;
  /** 客户端实例 */
  client?: RedisCompatibleClient;
  /** 数据序列化函数 */
  serialize?: SessionDataSerializeFunction;
  /** 数据反序列化函数 */
  deserialize?: SessionDataDeserializeFunction;
}

/**
 * Redis客户端接口
 */
export interface RedisCompatibleClient {
  get(key: string, callback: (err: Error | null, ret: any) => void): void;
  setex(key: string, ttl: number, data: string, callback: (err: Error | null, ret: any) => void): void;
  expire(key: string, ttl: number, callback: (err: Error | null, ret: any) => void): void;
  del(key: string, callback: (err: Error | null, ret: any) => void): void;
}

/** 将毫秒转换为秒 */
function msToS(ms: number): number {
  return Math.ceil(ms / 1000);
}

export class SessionRedisStore implements SessionStore {
  protected keyPrefix: string;
  protected client: RedisCompatibleClient;
  protected serialize: SessionDataSerializeFunction;
  protected deserialize: SessionDataDeserializeFunction;

  constructor(protected readonly options: SessionRedisStoreOptions) {
    this.keyPrefix = options.prefix || DEFAULT_REDIS_PREFIX;
    this.client = options.client || new SimpleRedisClient(options);
    this.serialize = options.serialize || DEFAULT_SESSION_SERIALIZE;
    this.deserialize = options.deserialize || DEFAULT_SESSION_DESERIALIZE;
  }

  protected getKey(key: string): string {
    return this.keyPrefix + key;
  }

  public get(sid: string): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      this.client.get(this.getKey(sid), (err, ret) => {
        if (err) return reject(err);
        try {
          resolve(this.deserialize(ret));
        } catch (err) {
          return reject(err);
        }
      });
    });
  }

  public set(sid: string, data: Record<string, any>, maxAge: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.setex(this.getKey(sid), msToS(maxAge), this.serialize(data), (err, ret) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  public destroy(sid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.del(this.getKey(sid), (err, ret) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  public touch(sid: string, maxAge: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.expire(this.getKey(sid), msToS(maxAge), (err, ret) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
