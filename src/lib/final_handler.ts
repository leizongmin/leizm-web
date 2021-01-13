/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as http from "http";
import { parseUrl } from "./parse_url";

export default function finalHandler(req: http.IncomingMessage, res: http.ServerResponse) {
  return function (err: any) {
    if (err) {
      writeHead(res, getErrorStatusCode(err) || 500, getErrorHeaders(err));
      if (err instanceof Error) {
        writeBody(req, res, createHtmlDocument(err.stack || err.message));
      } else {
        writeBody(req, res, createHtmlDocument(String(err)));
      }
    } else {
      writeHead(res, 404);
      writeBody(req, res, createHtmlDocument(`Cannot ${req.method} ${getResourceName(req)}`));
    }
  };
}

const DOUBLE_SPACE_REGEXP = /\x20{2}/g;
const NEWLINE_REGEXP = /\n/g;
const MATCH_HTML_REGEXP = /["'&<>]/;

function escapeHtml(str: string): string {
  const match = MATCH_HTML_REGEXP.exec(str);
  if (!match) {
    return str;
  }
  let escape;
  let html = "";
  let index = 0;
  let lastIndex = 0;
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = "&quot;";
        break;
      case 38: // &
        escape = "&amp;";
        break;
      case 39: // '
        escape = "&#39;";
        break;
      case 60: // <
        escape = "&lt;";
        break;
      case 62: // >
        escape = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escape;
  }
  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

function createHtmlDocument(message: string): string {
  const body = escapeHtml(message).replace(NEWLINE_REGEXP, "<br>").replace(DOUBLE_SPACE_REGEXP, " &nbsp;");
  return (
    "<!DOCTYPE html>\n" +
    '<html lang="en">\n' +
    "<head>\n" +
    '<meta charset="utf-8">\n' +
    "<title>Error</title>\n" +
    "</head>\n" +
    "<body>\n" +
    "<pre>" +
    body +
    "</pre>\n" +
    "</body>\n" +
    "</html>\n"
  );
}

function writeHead(res: http.ServerResponse, statusCode: number, headers?: http.OutgoingHttpHeaders): void {
  if (res.headersSent) return;
  res.writeHead(statusCode, {
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "Content-Type": "text/html; charset=utf-8",
    ...headers,
  });
}

function writeBody(req: http.IncomingMessage, res: http.ServerResponse, body: string): void {
  if (req.method === "HEAD") return;
  if (res.finished) return;
  res.end(body);
}

function getErrorStatusCode(err: any): number | undefined {
  if (typeof err.status === "number" && err.status >= 400 && err.status < 600) {
    return err.status;
  }
  if (typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 600) {
    return err.statusCode;
  }
  return undefined;
}

function getErrorHeaders(err: any): http.OutgoingHttpHeaders {
  if (!err.headers || typeof err.headers !== "object") {
    return {};
  }
  const headers = Object.create(null);
  const keys = Object.keys(err.headers);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    headers[key] = err.headers[key];
  }
  return headers;
}

function getResourceName(req: http.IncomingMessage): string {
  return parseUrl((req as any).originalUrl || req.url).pathname || "/";
}
