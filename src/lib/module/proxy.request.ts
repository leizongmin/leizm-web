/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { IncomingMessage, ServerResponse, OutgoingHttpHeaders, request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { parse as originalParseUrl } from "url";

export interface ProxyTarget {
  /** 协议，默认 http: */
  protocol?: "http:" | "https:";
  /** 端口，默认 80 */
  port?: string | number;
  /** 地址 */
  hostname: string;
  /** 路径 */
  path: string;
  /** 额外的请求头 */
  headers?: OutgoingHttpHeaders;
  /** 请求超时时间 ms */
  timeout?: number;
}

/**
 * 解析 URL
 *
 * @param url
 */
export function parseProxyTarget(url: string): ProxyTarget {
  const a = originalParseUrl(url);
  return {
    protocol: (a.protocol || "http:") as any,
    port: a.port || (a.protocol === "https:" ? 443 : 80),
    hostname: a.hostname!,
    path: a.path!,
  };
}

/**
 * 代理 HTTP 请求
 *
 * @param req
 * @param res
 * @param target
 */
export function proxyRequest(req: IncomingMessage, res: ServerResponse, target: string | ProxyTarget): Promise<void> {
  return new Promise((resolve, reject) => {
    req.on("error", (err) => reject(err));
    res.on("error", (err) => reject(err));
    const formattedTarget: ProxyTarget = typeof target === "string" ? parseProxyTarget(target) : target;
    const remoteReq = (formattedTarget.protocol === "https:" ? httpsRequest : httpRequest)(
      {
        method: req.method,
        ...formattedTarget,
        headers: { ...formattedTarget.headers },
        timeout: formattedTarget.timeout,
      },
      (remoteRes) => {
        remoteRes.on("error", (err) => reject(err));
        res.writeHead(remoteRes.statusCode || 200, remoteRes.headers);
        remoteRes.on("data", (chunk) => res.write(chunk));
        remoteRes.on("end", () => {
          res.end();
          resolve();
        });
      },
    );
    remoteReq.on("error", (err) => reject(err));
    if (req.method === "GET" || req.method === "HEAD") {
      remoteReq.end();
    } else {
      req.pipe(remoteReq);
    }
  });
}
