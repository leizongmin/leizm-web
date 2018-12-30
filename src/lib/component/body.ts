/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as querystring from "querystring";
import { Busboy } from "@modernjs/multipart";
import { randomString } from "../module/simple.random";
import { getContentStream, readAllBody } from "../module/body.parser";

export interface MultipartParserOptions {
  /** 字段名称长度，默认 100 */
  fieldNameSize?: number;
  /** 字段值长度，默认 100KB */
  fieldSize?: number;
  /** 字段数量，默认 Infinity */
  fields?: number;
  /** 文件大小，默认 Infinity */
  fileSize?: number;
  /** 文件数量，默认 Infinity */
  files?: number;
  /** 字段和文件总数，默认 Infinity */
  parts?: number;
  /** 字段属性对数量，默认 2000 */
  headerPairs?: number;
  /** 小文件尺寸，当文件尺寸小于此尺寸时则只保存到内存中，默认 0 */
  smallFileSize?: number;
}

export const DEFAULT_MULTIPART_PARSER_OPTIONS: Required<MultipartParserOptions> = {
  fieldNameSize: 100,
  fieldSize: 1024 * 100,
  fields: Infinity,
  fileSize: Infinity,
  files: Infinity,
  parts: Infinity,
  headerPairs: 2000,
  smallFileSize: 0,
};

export interface FileField {
  /** 原始文件名 */
  originalName: string;
  /** 编码 */
  encoding: string;
  /** MIME 类型 */
  mimeType: string;
  /** 文件大小 */
  size: number;
  /** 临时文件路径 */
  path?: string;
  /** 文件内容 */
  buffer?: Buffer;
}

export interface BodyParserOptions {
  /**
   * 允许的最大body字节，当超过此值时将停止解析，并返回错误
   */
  limit?: number;
}

export const DEFAULT_BODY_PARSER_OPTIONS: Required<BodyParserOptions> = {
  limit: 100 * 1024,
};

function wrapBodyParser(
  options: BodyParserOptions,
  contentType: string,
  decoder: (data: Buffer) => any,
): MiddlewareHandle<Context> {
  const opts = { ...DEFAULT_BODY_PARSER_OPTIONS, ...options };
  return async function(ctx: Context) {
    const t = String(ctx.request.headers["content-type"]).toLowerCase();
    if (t === contentType || t.indexOf(contentType + ";") === 0) {
      const { status, error, length, stream } = getContentStream(ctx.request.req);
      if (error) {
        ctx.response.status(status || 400);
        ctx.response.html(`<h1>${error.message}</h1>`);
        return;
      }
      if (length && Number(length) > opts.limit) {
        ctx.response.status(413);
        ctx.response.html(`<pre>out of max body size limit</pre>`);
        return;
      }
      try {
        const { status, error, data } = await readAllBody(stream!, opts.limit);
        if (error) {
          ctx.response.status(status || 400);
          ctx.response.html(`<h1>${error.message}</h1>`);
        } else {
          ctx.request.body = decoder(data!);
          ctx.next();
        }
      } catch (err) {
        ctx.response.status(status || 400);
        ctx.response.html(`<h1>${err.message}</h1>`);
      }
    } else {
      ctx.next();
    }
  };
}

export function json(options: BodyParserOptions = {}) {
  return wrapBodyParser(options, "application/json", data => JSON.parse(data.toString()));
}

export function text(options: BodyParserOptions = {}) {
  return wrapBodyParser(options, "text/plain", data => data.toString());
}

export function urlencoded(options: BodyParserOptions = {}) {
  return wrapBodyParser(options, "application/x-www-form-urlencoded", data => querystring.parse(data.toString()));
}

export function raw(options: BodyParserOptions = {}) {
  return wrapBodyParser(options, "application/octet-stream", data => data);
}

export function multipart(options: MultipartParserOptions = {}): MiddlewareHandle<Context> {
  return async function(ctx: Context) {
    await parseMultipart(ctx, options);
    ctx.next();
  };
}

export function parseMultipart(ctx: Context, options: MultipartParserOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const method = ctx.request.method;
    if (method === "GET" || method === "HEAD") return resolve();
    const contentType = ctx.request.headers["content-type"];
    if (!contentType) return resolve();
    if (contentType.indexOf("multipart/form-data") === -1) return resolve();

    const opts: Required<MultipartParserOptions> = { ...DEFAULT_MULTIPART_PARSER_OPTIONS, ...options };

    const busboy = new Busboy({ headers: ctx.request.headers, limits: opts });
    const fields: Record<string, string> = {};
    const files: Record<string, FileField> = {};
    const asyncTasks: Promise<void>[] = [];

    busboy.on("file", (fieldName, file, originalName, encoding, mimeType) => {
      asyncTasks.push(
        new Promise((resolve, reject) => {
          let buf: Buffer[] = [];
          let size = 0;
          let fileStream: fs.WriteStream | null = null;
          let filePath = "";
          file.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (fileStream) {
              fileStream.write(chunk);
            } else {
              buf.push(chunk);
              if (size > opts.smallFileSize) {
                filePath = path.resolve(os.tmpdir(), `multipart-tmp-${randomString(32)}`);
                fileStream = fs.createWriteStream(filePath);
                fileStream.on("error", err => reject(err));
                fileStream.write(Buffer.concat(buf));
                buf = [];
              }
            }
          });
          file.on("end", () => {
            files[fieldName] = {
              originalName: originalName || "",
              encoding: encoding || "",
              mimeType: mimeType || "",
              size,
            };
            if (fileStream) {
              fileStream!.end(() => resolve());
              files[fieldName].path = filePath;
            } else {
              files[fieldName].buffer = Buffer.concat(buf);
              resolve();
            }
          });
        }),
      );
    });
    busboy.on("field", (fieldname, val, fieldnameTruncated, valTruncated) => {
      fields[fieldname] = val;
    });
    busboy.on("finish", () => {
      Promise.all(asyncTasks)
        .then(() => {
          ctx.request.body = fields;
          ctx.request.files = files;
          resolve();
        })
        .catch(reject);
    });
    busboy.on("error", (err: Error) => reject(err));
    ctx.request.req.pipe(busboy);
  });
}
