# @leizm/web 框架入门

## 为什么编写此框架

从 2011 年接触 Node.js 开始接触 Node.js 至今已有七个年头，期间也写过好几个 Web 框架，比如最早的 [QuickWeb](https://github.com/leizongmin/QuickWeb)。在不断造轮子的过程中，我基本上实现过一个 Web 框架的所有基本部件，也深知要实现一个功能完善的 Web 框架并非易事。如今两个主流的框架 Express 和 Koa 已经经过千锤百炼，为什么还要再写一个 @leizm/web 出来呢？

- Koa 框架的洋葱模型给理解代码和调试带来不必要的复杂性
- Express 的中间件格式过于”灵活“，不适合使用 TypeScript 编写的项目
- Koa 和 Express 没有原生支持 TypeScript
- Koa 和 Express 作为一个基础 Web 框架，依赖模块过多
- 作为一个基础 Web 框架，除了中间件机制之外，还应该包含静态文件服务、Body 解析、Session 等基础模块

所以，基于以上考虑，我决定按照自己的想法，从头实现一个”完美“的框架：

- 原生支持 TypeScript
- 更规范的 API 接口设计
- 基于流水线式的中间件机制
- 尽量少的模块依赖
- 包含 Web 开发所必须的基础模块
- 兼容众多的 connect 中间件
