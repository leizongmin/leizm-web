/**
 * @leizm/web 中间件基础框架 - 内置中间件
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

import { Context } from "../context";
import { MiddlewareHandle } from "../define";
import * as bodyParser from "body-parser";
import { fromClassicalHandle } from "../utils";

export interface OptionsJson extends bodyParser.OptionsJson {}
export interface OptionsText extends bodyParser.OptionsText {}
export interface OptionsUrlencoded extends bodyParser.OptionsUrlencoded {}
export interface OptionsRaw extends bodyParser.Options {}

export function json(options: OptionsJson = {}): MiddlewareHandle<Context> {
  const fn = bodyParser.json(options);
  return fromClassicalHandle(fn);
}

export function text(options: OptionsText = {}): MiddlewareHandle<Context> {
  const fn = bodyParser.text(options);
  return fromClassicalHandle(fn);
}

export function urlencoded(options: OptionsUrlencoded = {}): MiddlewareHandle<Context> {
  const fn = bodyParser.urlencoded(options);
  return fromClassicalHandle(fn);
}

export function raw(options: OptionsRaw = {}): MiddlewareHandle<Context> {
  const fn = bodyParser.raw(options);
  return fromClassicalHandle(fn);
}
