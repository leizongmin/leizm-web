# 编写第一个程序

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

如果是的话，说明它已经正常工作了。

