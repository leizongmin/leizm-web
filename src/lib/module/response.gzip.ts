import { IncomingMessage, ServerResponse } from "http";
import { createGzip, createDeflate, createDeflateRaw, Gzip, Deflate, DeflateRaw } from "zlib";
import { Readable } from "stream";

/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

/**
 * 响应压缩的内容
 *
 * @param req
 * @param res
 * @param data
 * @param contentType
 */
export function responseGzip(
  req: IncomingMessage,
  res: ServerResponse,
  data: string | Buffer | Readable,
  contentType?: string,
) {
  let zlibStream: Gzip | Deflate | DeflateRaw;
  let encoding = req.headers["content-encoding"];
  switch (encoding) {
    case "gzip":
      zlibStream = createGzip();
      break;
    case "deflate":
      zlibStream = createDeflate();
      break;
    case "deflate-raw":
      zlibStream = createDeflateRaw();
      break;
    default:
      encoding = "gzip";
      zlibStream = createGzip();
  }
  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }
  res.setHeader("Content-Encoding", encoding);
  zlibStream.pipe(res);
  if (typeof data === "string") {
    zlibStream.end(data);
  } else if (Buffer.isBuffer(data)) {
    zlibStream.end(data);
  } else {
    data.pipe(zlibStream);
  }
  zlibStream.on("error", err => {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end(`ctx.response.gzip(): ${err.message}`);
  });
}
