import * as pathToRegExp from 'path-to-regexp';

export function isPromise(p: any): boolean {
  return typeof p.then === 'function' && p.catch === 'function';
}

export function parseRoute(route: string | RegExp): string | RegExp {
  if (route instanceof RegExp) return route;
  if (route.includes(':') || route.includes('*')) return pathToRegExp(route, { sensitive: true, strict: true, end: true });
  return route;
}

export function testRoute(pathname: string, route: string | RegExp): boolean {
  if (typeof route === 'string') {
    return pathname === route || pathname.indexOf(route === '/' ? route : route + '/') === 0;
  }
  route.lastIndex = 0;
  return route.test(pathname);
}

export function getRouteParams(pathname: string, route: pathToRegExp.PathRegExp): Record<string, string> {
  const params: Record<string, string> = {};
  route.lastIndex = 0;
  const values = route.exec(pathname);
  if (values) {
    route.keys.forEach((k, i) => {
      params[k.name] = values[i + 1];
    });
  }
  return params;
}
