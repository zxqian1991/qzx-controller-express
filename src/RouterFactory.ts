import { Request, Response, NextFunction } from 'express';
import { tempValue, requireWithoutCache, get } from './helper';
import { join } from 'path';
import { SymbolOfController } from './controller';
/**
 * 路由工厂，用来寻找正确的路径
 * 当有新的请求过来，会自动的去匹配正确的请求路径
 */
export class RouterFactory {
  private require = this.hotreload ? requireWithoutCache : require;
  constructor(
    private requestPath: string,
    private routerRootPath: string,
    private hotreload: boolean = process.env.NODE_ENV === 'development',
  ) {}
  findHandler() {
    const pathArr = this.requestPath
      .slice(1)
      .split('/')
      // 末尾是/的时候忽略掉
      .filter(p => p);
    const restArr: string[] = [];
    if (pathArr.length <= 0) {
      return this.findFullPathHandler('', '');
    }
    while (pathArr.length > 0) {
      // 根据路径找处理器
      const handler = tempValue(
        [pathArr.join('/'), restArr.join('/')],
        ([p1, p2]) => this.findFullPathHandler(p1, p2),
      );
      if (handler) {
        return handler;
      }
      // 没有处理器，继续找
      const pop = pathArr.pop();
      if (pop) {
        restArr.unshift(pop);
      }
    }
  }

  private getModuleHandler(module: any, requestPath: string, restPath: string) {
    return (
      req: Request,
      res: Response,
      next: NextFunction,
      resolve: (v: any) => void,
    ) => {
      const target: any = get(module, ['default']);
      if (target && typeof target === 'function') {
        // 支持方法 支持注解
        // 是注解方法
        if (target[SymbolOfController]) {
          const instance = new target(req, res, next, requestPath, restPath);
          const handler = instance.__$$exec();
          if (!handler) {
            next();
          } else {
            resolve(handler());
          }
        } else {
          // 是函数
          target(req, res, next, resolve);
        }
      } else {
        next();
      }
    };
  }

  // 查找全路径匹配
  private findFullPathHandler(requestPath: string, restPath: string) {
    const fullpath = join(this.routerRootPath, requestPath);
    // 文件按道理应该是不存在的
    try {
      // console.log(this.hotreload, this.require, fullpath, require.cache);
      const module = this.require(fullpath); // ts/js 会自动根据require加载的  index也是 代码简化了不少
      return this.getModuleHandler(module, requestPath, restPath);
    } catch (e) {
      return null;
    }
  }
}
