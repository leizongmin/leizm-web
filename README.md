[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@leizm/web.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@leizm/web
[travis-image]: https://img.shields.io/travis/leizongmin/leizm-web.svg?style=flat-square
[travis-url]: https://travis-ci.org/leizongmin/leizm-web
[coveralls-image]: https://img.shields.io/coveralls/leizongmin/leizm-web.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/leizongmin/leizm-web?branch=master
[david-image]: https://img.shields.io/david/leizongmin/leizm-web.svg?style=flat-square
[david-url]: https://david-dm.org/leizongmin/leizm-web
[node-image]: https://img.shields.io/badge/node.js-%3E=_8.9-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@leizm/web.svg?style=flat-square
[download-url]: https://npmjs.org/package/@leizm/web
[license-image]: https://img.shields.io/npm/l/@leizm/web.svg

# @leizm/web

[![Greenkeeper badge](https://badges.greenkeeper.io/leizongmin/leizm-web.svg)](https://greenkeeper.io/)

现代的 Web 中间件基础框架，完美支持 TypeScript，构建可维护的大型 Web 项目。

本框架参考了 connect、express 和 koa 等主流框架，具有以下特点：

* 兼容 connect 中间件，可以通过内置的函数转换 connect 中间件，使用 NPM 上大量的模块资源
* 可将本框架的实例转换为 connect 中间件，与其他项目模块紧密合作
* 支持直接操作原生 req 和 res 对象
* 简单没有歧义的接口参数，内置 TypeScript 支持，强大的代码自动提示支持
* 内置路由功能及众多常用的中间件，无需借助第三方模块
* 性能由于主流框架 koa 和 express
* 代码库轻盈，依赖模块少

内置中间件列表：

* `bodyParser` 请求体解析：
  * `json` 解析 application/json，由 [body-parser](https://www.npmjs.com/package/body-parser) 模块提供
  * `text` 解析 text/plain，由 [body-parser](https://www.npmjs.com/package/body-parser) 模块提供
  * `urlencoded` 解析 application/x-www-form-urlencoded，由 [body-parser](https://www.npmjs.com/package/body-parser) 模块提供
  * `raw` 解析 application/octet-stream，由 [body-parser](https://www.npmjs.com/package/body-parser) 模块提供
* `cookieParser` 解析 Cookie，由 [cookie-parser](https://www.npmjs.com/package/cookie-parser) 模块提供
* `serveStatic` 静态文件服务，由 [serve-static](https://www.npmjs.com/package/serve-static) 模块提供
* `cors` 设置 CORS
* `session` 提供多存储引擎的 Session 支持：
  * `SessiionMemoryStore` 内存存储引擎
  * `SessiionRedisStore` Redis 存储引擎，通过传入 Redis 客户端实例实现存储，支持 [ioredis](https://www.npmjs.com/package/ioredis) 和 [redis](https://www.npmjs.com/package/redis) 模块
  * `SimpleRedisClientOptions` 简单 Redis 客户端，可以不依赖第三方模块的情况下实现 Redis 存储

详细使用说明可阅读 [Wiki](https://github.com/leizongmin/leizm-web/wiki)

## 安装

```bash
npm i @leizm/web -S
```

## 基本使用方法

```typescript
import { Connect, Router, component } from "@leizm/web";

const app = new Connect();
const router = new Router();

// 使用内置中间件
app.use("/", component.cookieParser());

// 基本的中间件
app.use("/", function(ctx) {
  console.log("hello, world");
  ctx.next();
});

// 支持 async function
app.use("/", async function(ctx) {
  console.log("async function");
  await sleep(1000);
  ctx.next();
});

// 路由中间件
router.get("/hello/:a/:b", function(ctx) {
  console.log("a=%s, b=%s", ctx.request.params.a, ctx.request.params.b);
  ctx.response.html("it works");
});
app.use("/", router);

// 错误处理
app.use("/", function(ctx, err) {
  ctx.response.json({ message: err.message });
});

// 监听端口
app.listen({ port: 3000 }, () => {
  console.log("server started");
});
```

## 扩展

扩展 Request 与 Response 对象的方法：[参考单元测试程序](https://github.com/leizongmin/leizm-web/blob/master/src/test/extends.test.ts)

模板文件 `web.ts`（自己的项目中引用此文件中的 `Connect` 和 `Router`，而不是来自 `@leizm/web` 的）：

```typescript
import * as base from "@leizm/web";

export type MiddlewareHandle = (ctx: Context, err?: base.ErrorReason) => Promise<void> | void;

export class Connect extends base.Connect<Context> {
  protected contextConstructor = Context;
}

export class Router extends base.Router<Context> {
  protected contextConstructor = Context;
}

export class Context extends base.Context<Request, Response> {
  protected requestConstructor = Request;
  protected responseConstructor = Response;
}

export class Request extends base.Request {
  // 扩展 Request
  public get remoteIP() {
    return String(this.req.headers["x-real-ip"] || this.req.headers["x-forwarded-for"] || this.req.socket.remoteAddress);
  }
}

export class Response extends base.Response {
  // 扩展 Response
  public ok(data: any) {
    this.json({ data });
  }
  public error(error: string) {
    this.json({ error });
  }
}
```

## 性能

[性能测试程序](https://github.com/leizongmin/leizm-web-benchmark) 结果（性能优于主流框架 **koa** 的 13%，**express** 的 43%）：

```text
------------------------------------------------------------------------
connection: close 方式请求：

8390.82 Requests/sec - restify.js
6983.61 Requests/sec - micro.js
6905.93 Requests/sec - leizm-web.js
6578.84 Requests/sec - http.js
6415.45 Requests/sec - rawnode.js
5414.55 Requests/sec - koa.js
5263.68 Requests/sec - total/total.js
4926.65 Requests/sec - feathers.js
4829.53 Requests/sec - express.js
4401.81 Requests/sec - hapi.js
1640.84 Requests/sec - sails/sails.js

------------------------------------------------------------------------
connection: keep-alive 方式请求：

12279.14 Requests/sec - restify.js
11630.27 Requests/sec - micro.js
11584.45 Requests/sec - leizm-web.js
11298.82 Requests/sec - http.js
10730.96 Requests/sec - rawnode.js
9415.69 Requests/sec - koa.js
9178.14 Requests/sec - total/total.js
7024.93 Requests/sec - express.js
6038.25 Requests/sec - hapi.js
4772.14 Requests/sec - feathers.js
1640.60 Requests/sec - sails/sails.js
```

## 授权协议

```text
MIT License

Copyright (c) 2017-2018 老雷 <leizongmin@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
