import * as fs from "fs";
import * as path from "path";
import { Application, component } from "../../lib";
import * as request from "supertest";
import { expect } from "chai";

function readFile(file: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, ret) => {
      if (err) return reject(err);
      resolve(ret);
    });
  });
}

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("component.favicon", function() {
  it("favicon", async function() {
    const file = path.resolve(ROOT_DIR, "test_data/favicon.ico");
    const filedata = await readFile(file);
    const app = new Application();
    app.use("/", component.serveStatic(ROOT_DIR));
    app.use("/", component.favicon(file));
    await request(app.server)
      .get("/favicon.ico")
      .expect("content-type", "image/x-icon")
      .expect(200)
      .expect(res => {
        expect(res.body).to.deep.equal(filedata);
      });
  });
});
