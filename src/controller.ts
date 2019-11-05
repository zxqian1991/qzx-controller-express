import { Request, Response, NextFunction } from 'express';
import { Ioc } from 'qzx-ioc';
import {
  IInstance,
  IMatchedRouter,
  MATCHED_PROPERTY,
  PARAMS_STORE,
  IParamStore,
  PARAM_OF_BODY,
  PARAM_OF_QUERY,
  PARAM_OF_ROUTE,
} from './common';
import { get } from './helper';

export const SymbolOfController = Symbol('controller');
/**
 * controller方法，用来管理之前注册的各种信息
 */
export function Controller() {
  return function classDecorator<T extends { new (...args: any[]): {} }>(
    constructor: T,
  ) {
    // 获取所有的参数
    const paramsTypes: any[] = Reflect.getMetadata(
      'design:paramtypes',
      constructor,
    );
    // const instance = new constructor(...paramsTypes.map(i => Ioc(i)));
    // 怎么支持依赖注入

    return class extends constructor {
      static [SymbolOfController] = true;
      req!: Request;
      res!: Response;
      next!: NextFunction;
      requestPath!: string;
      restPath!: string;

      constructor(...argms: any[]) {
        // 有点小小的trick呀~
        super(...paramsTypes.map(i => Ioc(i)));
        const [req, res, next, requestPath, restPath] = argms;
        this.req = req;
        this.res = res;
        this.next = next;
        this.requestPath = requestPath;
        this.restPath = restPath;
      }

      __$$exec() {
        const router: IMatchedRouter = this.__$$findMatchedRouter();

        if (router) {
          // 找到了路由，就要开始执行了
          const args = this.__$$getArguments(router);
          // this[router.property];
          const func = get<(...a: any[]) => void, this>(this, [
            router.property,
          ]);
          if (func) {
            return () => func.apply(this, args);
          }
        }
      }

      private __$$findMatchedRouter(): any {
        const routers: IMatchedRouter[] =
          get<IMatchedRouter[], this>(this, [MATCHED_PROPERTY]) || [];
        return routers.find(
          ({ property, method, path }) =>
            this.__$$isPathMatched(path) && this.__$$isMethodMatched(method), // 路径匹配 方法匹配
        );
      }
      private __$$getArguments(router: IMatchedRouter) {
        const store: any = get(this, [PARAMS_STORE, router.property]);
        console.log(111, store);
        if (!store || typeof store !== 'object') {
          return [];
        }
        return Object.keys(store).map((v, index) => {
          const obj: IParamStore = store[index];
          switch (obj.type) {
            case PARAM_OF_BODY:
              return get(this, ['req', 'body', obj.key]);
            case PARAM_OF_QUERY:
              return get(this, ['req', 'query', obj.key]);
            case PARAM_OF_ROUTE:
              return this.__$$getRouterParam(router, obj.key);
            default:
              return undefined;
          }
        });
      }
      private __$$isPathMatched(path: string = '') {
        const p1 = path.replace(/(^\/*)|(\/*$)/gi, '');
        const p2 = get<string, this>(this, ['restPath']) || '';
        if (p1 === p2) {
          return true;
        }
        const p1Arr = p1.split('/');
        const p2Arr = p2.split('/');
        if (p1Arr.length !== p2Arr.length) {
          return false;
        }
        for (const i in p1Arr) {
          if (p1Arr[i] !== p2Arr[i]) {
            if (!/^\:(.*)/gi.test(p1Arr[i])) {
              return false;
            }
          }
        }
        return true;
      }
      private __$$isMethodMatched(method: string) {
        return method.toLowerCase() === (this as any).req.method.toLowerCase();
      }
      private __$$getRouterParam(
        { property, path }: IMatchedRouter,
        key: string,
      ) {
        const p1 = path.replace(/(^\/*)|(\/*$)/gi, '');
        const p2 = (this as any).restPath || '';
        const p1Arr = p1.split('/');
        const p2Arr = p2.split('/');
        for (const i in p1Arr) {
          if (p1Arr[i] !== `:${key}`) {
            return p2Arr[i];
          }
        }
      }
    };
  };
}
