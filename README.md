[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]
[![npm license][license-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@leizm/connect.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@leizm/connect
[travis-image]: https://img.shields.io/travis/leizongmin/leizm-connect.svg?style=flat-square
[travis-url]: https://travis-ci.org/leizongmin/leizm-connect
[coveralls-image]: https://img.shields.io/coveralls/leizongmin/leizm-connect.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/leizongmin/leizm-connect?branch=master
[david-image]: https://img.shields.io/david/leizongmin/leizm-connect.svg?style=flat-square
[david-url]: https://david-dm.org/leizongmin/leizm-connect
[node-image]: https://img.shields.io/badge/node.js-%3E=_6.0-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@leizm/connect.svg?style=flat-square
[download-url]: https://npmjs.org/package/@leizm/connect
[license-image]: https://img.shields.io/npm/l/@leizm/connect.svg

# @leizm/connect
现代的 Web 中间件基础框架，完美支持 TypeScript，构建可维护的大型 Web 项目。

## 安装

```bash
npm install @leizm/connect --save
```

## 基本使用方法

```typescript
import { Connect, Router } from '@leizm/connect';

const app = new Connect();
const router = new Router();

// 基本的中间件
app.use('/', function (ctx) {
  console.log('hello, world');
  ctx.next();
});

// 支持 async function
app.use('/', async function (ctx) {
  consoole.log('async function');
  await sleep(1000);
  ctx.next();
});

// 路由中间件
router.get('/hello/:a/:b', function (ctx) {
  console.log('a=%s, b=%s', ctx.request.params.a, ctx.request.params.b);
  ctx.response.writeHead(200, { 'content-type': 'text/html' });
  ctx.response.end('it works');
});
app.use('/', router);

// 错误处理
app.use('/', function (ctx, err) {
  ctx.response.writeHead(500, { 'content-type': 'application/json' });
  ctx.response.end(`Error: ${ err }`);
});

// 监听端口
app.listen({ port: 3000 }, () => {
  console.log('server started');
});
```

## 授权协议

```
MIT License

Copyright (c) 2017 老雷 <leizongmin@gmail.com>

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
