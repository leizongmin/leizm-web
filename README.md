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
[node-image]: https://img.shields.io/badge/node.js-%3E=_6.0-green.svg?style=flat-square
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
* 简单没有歧义的接口参数，内置 TypeScript 支持
* 更好的性能

## 安装

```bash
npm install @leizm/web --save
```

## 基本使用方法

```typescript
import { Connect, Router } from "@leizm/web";

const app = new Connect();
const router = new Router();

// 基本的中间件
app.use("/", function(ctx) {
  console.log("hello, world");
  ctx.next();
});

// 支持 async function
app.use("/", async function(ctx) {
  consoole.log("async function");
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

模板文件 `connect.ts`（自己的项目中引用此文件中的 `Connect` 和 `Router`，而不是来自 `@leizm/web` 的）：

```typescript
import * as base from "@leizm/web";

export type MiddlewareHandle = (
  ctx: Context,
  err?: base.ErrorReason
) => Promise<void> | void;

export class Connect extends base.Connect<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Router extends base.Router<Context> {
  protected contextConstructor: base.ContextConstructor = Context;
}

export class Context extends base.Context<Request, Response> {
  protected requestConstructor: base.RequestConstructor = Request;
  protected responseConstructor: base.ResponseConstructor = Response;
}

export class Request extends base.Request {}

export class Response extends base.Response {
  // 扩展方法
  public ok(data: any) {
    this.json({ data });
  }
  public error(error: message) {
    this.json({ error });
  }
}
```

## 性能

[性能测试程序](https://github.com/leizongmin/leizm-web-benchmark) 结果（性能优于主流框架 **koa** 和 **express.js**）：

```text
------------------------------------------------------------------------
connection: close 方式请求：

26882.24 Requests/sec - ukoa.js
14892.25 Requests/sec - ufeathers.js
13657.59 Requests/sec - uexpress.js
5853.36 Requests/sec - micro.js
5040.39 Requests/sec - leizm-web.js
5002.74 Requests/sec - rawnode.js
4279.85 Requests/sec - koa.js
3784.59 Requests/sec - total/total.js
3509.53 Requests/sec - express.js
3469.05 Requests/sec - feathers.js
3025.51 Requests/sec - restify.js
1261.24 Requests/sec - hapi.js
1097.77 Requests/sec - sails/sails.js
156.60 Requests/sec - uws.js

------------------------------------------------------------------------
connection: keep-alive 方式请求：

31348.44 Requests/sec - uws.js
27884.30 Requests/sec - ukoa.js
14129.84 Requests/sec - uexpress.js
14047.04 Requests/sec - ufeathers.js
13352.23 Requests/sec - micro.js
11644.37 Requests/sec - rawnode.js
11088.41 Requests/sec - leizm-web.js
8334.33 Requests/sec - koa.js
7588.25 Requests/sec - total/total.js
6026.16 Requests/sec - express.js
5370.37 Requests/sec - restify.js
3443.71 Requests/sec - feathers.js
1617.57 Requests/sec - hapi.js
1508.43 Requests/sec - sails/sails.js
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
