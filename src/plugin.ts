import { Request, Response, NextFunction } from 'express';
import { RouterFactory } from './RouterFactory';

export default function RouterControllerPlugin({
  hotreload,
  routerPath,
}: RouterControllerOption) {
  return (req: Request, res: Response, next: NextFunction) => {
    const handler = new RouterFactory(
      req.path,
      routerPath,
      hotreload,
    ).findHandler();
    if (handler) {
      handler(req, res, next, (value: any) => {
        res.end(typeof value === 'object' ? JSON.stringify(value) : value);
      });
    } else {
      next();
    }
  };
}

export interface RouterControllerOption {
  // useTs: boolean;
  hotreload: boolean; // 是否支持热更新  热更新的意思就是每次不走缓存
  routerPath: string;
}
