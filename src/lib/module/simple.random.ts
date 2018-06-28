/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as crypto from "crypto";

export function randomString(len: number = 16): string {
  return crypto.randomBytes(len / 2).toString("hex");
}

export function generateSessionId(): string {
  return randomString(32);
}
