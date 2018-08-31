# 编写第一个程序

## 运行环境

Node.js v8.9 或更高版本。

## 初始化项目

首先让我们创建一个新项目来编写第一个程序，比如 `study_web`：

```bash
# 创建项目目录
mkdir study_web
cd study_web

# 初始化 package.json
npm init

# 安装 @leizm/web 依赖
npm i @leizm/web@2.x -S

# 创建入口程序文件
mkdir src
touch src/app.js
```

然后编辑 `src/app.js` 文件，输入以下代码：

```javascript
const web = require("@leizm/web");

const app = new web.Application();

app.use("/", ctx => {
  ctx.response.html("<h1>It works!</h1>");
});

app.listen({ port: 3000 });
```

然后运行以下命令启动服务器：

```bash
node src/app.js
```

接着在浏览器打开 http://127.0.0.1:3000/ ，看看页面上是不是这样的文字：

-----

<h1>It works!</h1>

-----

如果是的话，说明它已经正常工作了。接下来我们详细看看每一行代码的含义：

- `new web.Application()` 创建一个 Application 实例，这样我们就可以在此实例上引入各种中间件，监听端口等
- `app.use(path, handler)` 表示引入一个中间件，注册的路径是 `path`（比如：`"/hello"`)，`handler` 是中间件的处理函数，其格式为 `function (ctx: web.Context) {}`
- `ctx.response.html(str)` 表示输出一段 HTML
- `app.listen({ port })` 表示监听指定的端口

需要注意到是，`app.use(path, handler)` 中的 `path` 参数是不可省略的（即使注册的路径是 `/`）。 `handler` 函数可以写成 `async function` 方式。
