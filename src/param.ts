import {
  IInstance,
  PARAMS_STORE,
  PARAM_OF_ROUTE,
  PARAM_OF_QUERY,
  PARAM_OF_BODY,
} from './common';

function _basicParam<T>(
  target: IInstance,
  propertyKey: string,
  parameterIndex: number,
  type: symbol,
  key?: string,
) {
  if (!target[PARAMS_STORE]) {
    target[PARAMS_STORE] = {};
  }
  if (!target[PARAMS_STORE][propertyKey]) {
    target[PARAMS_STORE][propertyKey] = {};
  }
  const store = target[PARAMS_STORE] && target[PARAMS_STORE][propertyKey];
  // store[parameterIndex] = target.request.query;
  store[parameterIndex] = {
    type,
    key,
  };
}
/**
 *
 * @param target 临时变量 这个变量在模块被夹在的时候就会执行了
 * 我们这里的逻辑是：记录下这个参数的位置应该是那种参数，在执行的时候统一执行
 */

export function Query(param: string) {
  return function<T>(
    target: IInstance,
    propertyKey: string,
    parameterIndex: number,
  ) {
    _basicParam(target, propertyKey, parameterIndex, PARAM_OF_QUERY, param);
  };
}
// body

export function Body(param: string) {
  return function<T>(
    target: IInstance,
    propertyKey: string,
    parameterIndex: number,
  ) {
    _basicParam(target, propertyKey, parameterIndex, PARAM_OF_BODY, param);
  };
}

export function Param(param: string) {
  return function<T>(
    target: IInstance,
    propertyKey: string,
    parameterIndex: number,
  ) {
    _basicParam(target, propertyKey, parameterIndex, PARAM_OF_ROUTE, param);
  };
}
