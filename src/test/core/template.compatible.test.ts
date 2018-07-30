/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as path from "path";
import { Connect, Router } from "../../lib";
import * as simpleTemplate from "../../lib/module/simple.template";
import * as request from "supertest";
import * as ejs from "ejs";
import * as pug from "pug";
import * as nunjucks from "nunjucks";

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("模板引擎兼容性", function() {
  it("使用 simple 渲染", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .register(".simple", simpleTemplate.renderFile)
      .setDefault(".simple")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("使用 simple 渲染 - initSimple()", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine.initSimple(".simple").setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("使用 ejs 渲染", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .register(".ejs", ejs.renderFile)
      .setDefault(".ejs")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"))
      .setLocals("type", "ejs");
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("ejs<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("使用 ejs 渲染 - initEjs()", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .initEjs(".ejs")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"))
      .setLocals("type", "ejs");
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("ejs<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("使用 pug 渲染", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .register(".pug", pug.renderFile)
      .setDefault(".pug")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p><p>b = 456</p>", done);
  });

  it("使用 pug 渲染 - initPug()", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine.initPug(".pug").setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p><p>b = 456</p>", done);
  });

  it("使用 nunjucks 渲染", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .register(".nunjucks", nunjucks.render)
      .setDefault(".nunjucks")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("使用 nunjucks 渲染 - initNunjucks", function(done) {
    const app = new Connect();
    const router = new Router();
    app.templateEngine.initNunjucks(".nunjucks").setRoot(path.resolve(ROOT_DIR, "test_data/template"));
    app.use("/", router);
    router.use("/", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    request(app.server)
      .get("/")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>", done);
  });

  it("多个模板引擎混合", async function() {
    const app = new Connect();
    const router = new Router();
    app.templateEngine
      .initSimple(".simple")
      .initEjs(".ejs")
      .initPug(".pug")
      .initNunjucks(".nunjucks")
      .setRoot(path.resolve(ROOT_DIR, "test_data/template"))
      .setLocals("type", "mix");
    app.use("/", router);
    router.use("/simple", function(ctx) {
      ctx.response.render("test1", { a: 123, b: 456 });
    });
    router.use("/ejs", function(ctx) {
      ctx.response.render("test1.ejs", { a: 123, b: 456 });
    });
    router.use("/pug", function(ctx) {
      ctx.response.render("test1.pug", { a: 123, b: 456 });
    });
    router.use("/nunjucks", function(ctx) {
      ctx.response.render("test1.nunjucks", { a: 123, b: 456 });
    });
    await request(app.server)
      .get("/simple")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>");
    await request(app.server)
      .get("/ejs")
      .expect(200)
      .expect("mix<p>a = 123</p>\n<p>b = 456</p>");
    await request(app.server)
      .get("/pug")
      .expect(200)
      .expect("<p>a = 123</p><p>b = 456</p>");
    await request(app.server)
      .get("/nunjucks")
      .expect(200)
      .expect("<p>a = 123</p>\n<p>b = 456</p>");
  });
});
