/**
 * @leizm/web 中间件基础框架 - 单元测试
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Application, component } from "../../lib";
import * as request from "supertest";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

function readFile(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, ret) => {
      if (err) return reject(err);
      resolve(ret);
    });
  });
}

// const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("component.body", function() {
  const appInstances: Application[] = [];
  after(async function() {
    for (const app of appInstances) {
      await app.close();
    }
  });

  it("json", async function() {
    const app = new Application();
    appInstances.push(app);
    app.use("/", component.bodyParser.json());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
      .post("/")
      .send({
        a: 111,
        b: 222,
        c: 333,
      })
      .expect(200)
      .expect({
        a: 111,
        b: 222,
        c: 333,
      });
  });

  describe("fast json parser", function() {
    it("json", async function() {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.bodyParser.json());
      app.use("/", function(ctx) {
        ctx.response.setHeader("content-type", "application/json");
        ctx.response.end(JSON.stringify(ctx.request.body));
      });
      await request(app.server)
        .post("/")
        .send({
          a: 111,
          b: 222,
          c: 333,
        })
        .expect(200)
        .expect({
          a: 111,
          b: 222,
          c: 333,
        });
    });

    it("out of limit", async function() {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.bodyParser.json({ limit: 1024 }));
      app.use("/", function(ctx) {
        ctx.response.setHeader("content-type", "application/json");
        ctx.response.end(JSON.stringify(ctx.request.body));
      });
      const data = {
        a: "a".repeat(1024),
        b: "b".repeat(1024),
        c: "c".repeat(1024),
      };
      await request(app.server)
        .post("/")
        .send(data)
        .expect(413)
        .expect(/out of max body size limit/);
    });
  });

  it("urlencoded", async function() {
    const app = new Application();
    appInstances.push(app);
    app.use("/", component.bodyParser.urlencoded({}));
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        a: "111",
        b: "222",
        c: "333",
      })
      .expect(200)
      .expect({
        a: "111",
        b: "222",
        c: "333",
      });
  });

  it("text", async function() {
    const app = new Application();
    appInstances.push(app);
    app.use("/", component.bodyParser.text());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify(ctx.request.body));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "text/plain")
      .send("hello, world")
      .expect(200)
      .expect(`"hello, world"`);
  });

  it("raw", async function() {
    const app = new Application();
    appInstances.push(app);
    app.use("/", component.bodyParser.raw());
    app.use("/", function(ctx) {
      ctx.response.setHeader("content-type", "application/json");
      ctx.response.end(JSON.stringify((ctx.request.body as Buffer).toJSON()));
    });
    await request(app.server)
      .post("/")
      .set("content-type", "application/octet-stream")
      .send("hello, world")
      .expect(200)
      .expect(JSON.stringify(Buffer.from("hello, world").toJSON()));
  });

  describe("multipart", function() {
    it("smallFileSize=Infinity 文件存储于内存中", async function() {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.bodyParser.multipart({ smallFileSize: Infinity }));
      app.use("/", function(ctx) {
        ctx.response.json({ ...ctx.request.body, ...ctx.request.files });
      });
      const c = await readFile(__filename);
      const d = Buffer.from("456");
      await request(app.server)
        .post("/")
        .field("a", 123)
        .field("b", __dirname)
        .attach("c", __filename)
        .field("d", d)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.a).to.equal("123");
          expect(res.body.b).to.equal(__dirname);
          expect(res.body.c).includes({
            originalName: path.basename(__filename),
            size: c.length,
          });
          expect(res.body.c.buffer).to.deep.equal(JSON.parse(JSON.stringify(c)));
          expect(res.body.d).include({ originalName: "", size: d.length });
          expect(res.body.d.buffer).to.deep.equal(JSON.parse(JSON.stringify(d)));
        });
    });

    it("smallFileSize=100 文件存储于临时文件中", async function() {
      const app = new Application();
      appInstances.push(app);
      app.use("/", component.bodyParser.multipart({ smallFileSize: 100 }));
      app.use("/", function(ctx) {
        ctx.response.json({ ...ctx.request.body, ...ctx.request.files });
      });
      const c = await readFile(__filename);
      const d = Buffer.from("456");
      await request(app.server)
        .post("/")
        .field("a", 123)
        .field("b", __dirname)
        .attach("c", __filename)
        .field("d", d)
        .expect(200)
        .expect(async (res: any) => {
          expect(res.body.a).to.equal("123");
          expect(res.body.b).to.equal(__dirname);
          expect(res.body.c).includes({
            originalName: path.basename(__filename),
            size: c.length,
          });
          expect(res.body.c.path).to.be.exist;
          expect(await readFile(res.body.c.path)).to.deep.equal(c);
          expect(res.body.d).include({ originalName: "", size: d.length });
          expect(res.body.d.buffer).to.deep.equal(JSON.parse(JSON.stringify(d)));
        });
    });

    it("smallFileSize=0 通过 ctx.request.parseMultipart() 解析", async function() {
      const app = new Application();
      appInstances.push(app);
      app.use("/", async function(ctx) {
        expect(ctx.request.body).to.deep.equal({});
        expect(ctx.request.files).to.deep.equal({});
        const { body, files } = await ctx.request.parseMultipart({ smallFileSize: 0 });
        expect(body).to.equal(ctx.request.body);
        expect(files).to.equal(ctx.request.files);
        ctx.response.json({ ...body, ...files });
      });
      const c = await readFile(__filename);
      const d = Buffer.from("456");
      let res: any;
      await request(app.server)
        .post("/")
        .field("a", 123)
        .field("b", __dirname)
        .attach("c", __filename)
        .field("d", d)
        .expect(200)
        .expect((r: any) => {
          res = r;
        });
      expect(res.body.a).to.equal("123");
      expect(res.body.b).to.equal(__dirname);
      expect(res.body.c).includes({
        originalName: path.basename(__filename),
        size: c.length,
      });
      expect(res.body.c.path).to.be.exist;
      expect(await readFile(res.body.c.path)).to.deep.equal(c);
      expect(res.body.d).include({ originalName: "", size: d.length });
      expect(res.body.d.path).to.be.exist;
      expect(await readFile(res.body.d.path)).to.deep.equal(d);
    });
  });
});
