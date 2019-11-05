export const PARAMS_STORE = Symbol('params');
// 路由的变量
export const PARAM_OF_ROUTE = Symbol('param_of_route');
// Query的变量
export const PARAM_OF_QUERY = Symbol('param_of_query');
// Bodly的变量
export const PARAM_OF_BODY = Symbol('param_of_query');
// 匹配到的路由
export const MATCHED_PROPERTY = Symbol('matched_property');
// 标识是否已经跑了
export const HAS_RUN = Symbol('has_run');

export interface IInstance {
  [PARAMS_STORE]: {
    [prop: string]: { [prop: number]: any };
  };
  [HAS_RUN]: boolean;
  req: Request;
  res: Response;
  requestPath: string;
  restPath: string;
  [prop: string]: any;
}

export interface IMatchedRouter {
  method: string;
  property: string;
  path: string;
}

export interface IParamStore {
  type: symbol;
  key: string;
}
