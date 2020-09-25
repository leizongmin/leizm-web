/**
 * @leizm/web 中间件基础框架
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as path from "path";
import * as assert from "assert";
import { TemplateRenderData, TemplateRenderFileFunction } from "./define";
import * as simpleTemplate from "./module/simple.template";

export class TemplateEngineManager {
  protected engines: Map<string, TemplateRenderFileFunction> = new Map();
  protected defaultEngine: string = "";
  protected root: string = "./views";

  /** 模板全局变量 */
  public locals: Record<string, any> = {};

  /**
   * 设置模板根目录
   * @param dir
   */
  public setRoot(dir: string): this {
    this.root = dir;
    return this;
  }

  /**
   * 注册模板引擎
   * @param ext 模板扩展名
   * @param renderFile 模板渲染函数
   */
  public register(ext: string, renderFile: TemplateRenderFileFunction): this {
    if (ext[0] !== ".") ext = "." + ext;
    this.engines.set(ext, renderFile);
    return this;
  }

  /**
   * 设置默认渲染引擎
   * @param ext 模板扩展名
   * @param ignoreIfExists 如果已经设置了默认模板引擎则忽略
   */
  public setDefault(ext: string, ignoreIfExists: boolean = false): this {
    if (ext[0] !== ".") ext = "." + ext;
    assert(this.engines.has(ext), `模板引擎 ${ext} 未注册`);
    if (this.defaultEngine && ignoreIfExists) return this;
    this.defaultEngine = ext;
    return this;
  }

  /**
   * 渲染模板
   * @param name 模板名
   * @param data 数据
   */
  public render(name: string, data: TemplateRenderData = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      let ext = path.extname(name);
      let fileName = path.resolve(this.root, name);
      let renderFile: TemplateRenderFileFunction;
      if (ext && this.engines.has(ext)) {
        renderFile = this.engines.get(ext)!;
      } else {
        assert(this.engines.has(this.defaultEngine), `未设置默认模板引擎，无法渲染模板类型 ${ext}`);
        if (!ext) {
          ext = this.defaultEngine;
          fileName += ext;
        }
        renderFile = this.engines.get(this.defaultEngine)!;
      }
      renderFile(fileName, { ...this.locals, ...data }, (err, ret) => {
        if (err) return reject(err);
        resolve(ret);
      });
    });
  }

  /**
   * 设置模板全局变量
   * @param name 名称
   * @param value 值
   */
  public setLocals(name: string, value: any): this {
    this.locals[name] = value;
    return this;
  }

  /**
   * 初始化自动简单模板引擎
   * @param ext 模板扩展名
   */
  public initSimple(ext: string = ".html"): this {
    this.register(ext, simpleTemplate.renderFile).setDefault(ext, true);
    return this;
  }

  /**
   * 初始化EJS模板引擎
   * @param ext 模板扩展名
   */
  public initEjs(ext: string = ".html"): this {
    try {
      const ejs = requireProjectModule("ejs");
      this.register(ext, ejs.renderFile).setDefault(ext, true);
      return this;
    } catch (err) {
      if (err.code === "MODULE_NOT_FOUND") {
        throw new Error(`initEjs: 找不到 ejs 模块！请先执行 npm install ejs --save 安装。${err.message}`);
      }
      throw err;
    }
  }

  /**
   * 初始化Pug模板引擎
   * @param ext 模板扩展名
   */
  public initPug(ext: string = ".pug"): this {
    try {
      const pug = requireProjectModule("pug");
      this.register(ext, pug.renderFile).setDefault(ext, true);
      return this;
    } catch (err) {
      if (err.code === "MODULE_NOT_FOUND") {
        throw new Error(`initPug: 找不到 pug 模块！请先执行 npm install pug --save 安装。${err.message}`);
      }
      throw err;
    }
  }

  /**
   * 初始化Nunjucks模板引擎
   * @param ext 模板扩展名
   */
  public initNunjucks(ext: string = ".html"): this {
    try {
      const nunjucks = requireProjectModule("nunjucks");
      this.register(ext, nunjucks.render).setDefault(ext, true);
      return this;
    } catch (err) {
      if (err.code === "MODULE_NOT_FOUND") {
        throw new Error(
          `initNunjucks: 找不到 nunjucks 模块！请先执行 npm install nunjucks --save 安装。${err.message}`,
        );
      }
      throw err;
    }
  }
}

/**
 * 加载当前项目运行目录下的指定模块
 * @param id 模块名称
 */
function requireProjectModule(id: string): any {
  const paths = Array.from(
    new Set(
      (new Error().stack || "")
        .split(/\n/)
        .map((v) => v.match(/\((.*)\:\d+\:\d+\)/))
        .filter((v) => v)
        .map((v) => path.dirname(v![1])),
    ),
  );
  const entry = require.resolve(id, { paths: [process.cwd(), ...paths] });
  return require(entry);
}
