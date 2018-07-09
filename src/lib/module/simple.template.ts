/**
 * @leizm/web 中间件基础框架 - 内置模块
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import * as fs from "fs";
import { TemplateRenderFileCallback, TemplateRenderData } from "../define";

export function render(template: string, data: Record<string, any>) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => data[key]);
}

export function renderFile(fileName: string, data: TemplateRenderData, callback: TemplateRenderFileCallback) {
  fs.readFile(fileName, (err, ret) => {
    if (err) return callback(new Error(`SimpleTemplate: renderFile fail: ${err.message}`));
    callback(null, render(ret.toString(), data));
  });
}
