import * as fs from "fs";
import * as path from "path";
import { expect } from "chai";
import { Connect, component } from "../lib";
import * as request from "supertest";
import { sign as signCookie } from "cookie-signature";

function readFile(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, ret) => {
      if (err) return reject(err);
      resolve(ret);
    });
  });
}

describe("component.static", function() {
  it("作为根路径", async function() {
    const file1 = path.resolve(__dirname, "../../package.json");
    const file1data = (await readFile(file1)).toString();
    const file2 = path.resolve(__dirname, "../../README.md");
    const file2data = (await readFile(file2)).toString();
    const app = new Connect();
    app.use("/", component.serveStatic({ root: path.resolve(__dirname, "../..") }));
    await request(app.server)
      .get("/package.json")
      .expect("content-type", "application/json; charset=UTF-8")
      .expect(200, file1data);
    await request(app.server)
      .get("/README.md")
      .expect("content-type", "text/markdown; charset=UTF-8")
      .expect(200, file2data);
  });

  // it("作为二级字路径", async function() {
  //   const file1 = path.resolve(__dirname, "../../package.json");
  //   const file1data = (await readFile(file1)).toString();
  //   const file2 = path.resolve(__dirname, "../../README.md");
  //   const file2data = (await readFile(file2)).toString();
  //   const app = new Connect();
  //   app.use("/public", component.serveStatic({ root: path.resolve(__dirname, "../..") }));
  //   await request(app.server)
  //     .get("/public/package.json")
  //     .expect(200, file1data)
  //     .expect("content-type", "application/json; charset=UTF-8");
  //   await request(app.server)
  //     .get("/public/README.md")
  //     .expect(200, file2data)
  //     .expect("content-type", "text/markdown; charset=UTF-8");
  // });
});
