import * as fs from "fs";
import * as path from "path";
import { Connect, component } from "../../lib";
import * as request from "supertest";

function readFile(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, ret) => {
      if (err) return reject(err);
      resolve(ret);
    });
  });
}

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("component.static", function() {
  it("作为根路径", async function() {
    const file1 = path.resolve(ROOT_DIR, "package.json");
    const file1data = (await readFile(file1)).toString();
    const file2 = path.resolve(ROOT_DIR, "README.md");
    const file2data = (await readFile(file2)).toString();
    const app = new Connect();
    app.use("/", component.serveStatic(ROOT_DIR));
    await request(app.server)
      .get("/package.json")
      .expect("content-type", "application/json; charset=UTF-8")
      .expect(200, file1data);
    await request(app.server)
      .get("/README.md")
      .expect("content-type", "text/markdown; charset=UTF-8")
      .expect(200, file2data);
  });

  it("作为二级子路径", async function() {
    const file1 = path.resolve(ROOT_DIR, "package.json");
    const file1data = (await readFile(file1)).toString();
    const file2 = path.resolve(ROOT_DIR, "README.md");
    const file2data = (await readFile(file2)).toString();
    const app = new Connect();
    app.use("/public", component.serveStatic(ROOT_DIR));
    await request(app.server)
      .get("/public/package.json")
      .expect(200, file1data)
      .expect("content-type", "application/json; charset=UTF-8");
    await request(app.server)
      .get("/public/README.md")
      .expect(200, file2data)
      .expect("content-type", "text/markdown; charset=UTF-8");
  });

  it("作为三级子路径", async function() {
    const file1 = path.resolve(ROOT_DIR, "package.json");
    const file1data = (await readFile(file1)).toString();
    const file2 = path.resolve(ROOT_DIR, "README.md");
    const file2data = (await readFile(file2)).toString();
    const app = new Connect();
    app.use("/public/assets", component.serveStatic(ROOT_DIR));
    await request(app.server)
      .get("/public/assets/package.json")
      .expect(200, file1data)
      .expect("content-type", "application/json; charset=UTF-8");
    await request(app.server)
      .get("/public/assets/README.md")
      .expect(200, file2data)
      .expect("content-type", "text/markdown; charset=UTF-8");
  });
});
