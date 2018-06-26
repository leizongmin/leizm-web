/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { ServerResponse } from "http";

export const WRITE_HEAD = Symbol("origin res.writeHead");
export const ON_WRITE_HEAD = Symbol("on writeHead event");

function onWriteHead(res: ServerResponse, callback: () => void) {
  (res as any).once(ON_WRITE_HEAD, callback);
  if (WRITE_HEAD in res) return;
  (res as any)[WRITE_HEAD] = res.writeHead;
  res.writeHead = function(...args: any[]) {
    (this as any).emit(ON_WRITE_HEAD);
    return (this as any)[WRITE_HEAD](...args);
  };
}

export default onWriteHead;
