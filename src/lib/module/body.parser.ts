/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage } from "http";
import { Readable } from "stream";
import { createInflate, createGunzip } from "zlib";

/**
 * 读取指定 Stream 的所有内容
 * @param stream
 * @param limit
 */
export function readAllBody(
  stream: Readable,
  limit: number,
): Promise<{ status?: number; error?: Error; data?: Buffer }> {
  return new Promise((resolve, reject) => {
    const list: Buffer[] = [];
    let length = 0;
    let isBreak = false;
    stream.on("data", (chunk: Buffer) => {
      if (isBreak) {
        stream.pause();
        return;
      }
      list.push(chunk);
      length += chunk.length;
      checkLength();
    });
    stream.on("end", () => {
      if (isBreak) return;
      checkLength();
      resolve({ data: Buffer.concat(list) });
    });
    function checkLength() {
      if (length > limit) {
        isBreak = true;
        return resolve({ status: 413, error: new Error(`out of max body size limit`) });
      }
    }
  });
}

/**
 * 获得 Request 的 Stream
 * @param req
 */
export function getContentStream(req: IncomingMessage) {
  const encoding = (req.headers["content-encoding"] || "identity").toLowerCase();
  const length = req.headers["content-length"];
  switch (encoding) {
    case "deflate":
      return { stream: req.pipe(createInflate()), length };
    case "gzip":
      return { stream: req.pipe(createGunzip()), length };
    case "identity":
      return { stream: req, length };
    default:
      return { status: 415, error: new Error(`unsupported content encoding ${encoding}`) };
  }
}
