import { MATCHED_PROPERTY } from './common';

export function Get<T>(path: string = '') {
  return _BasicPropertDecorator<T>(path, 'get');
}

// 只接受POST的请求
export function Post(path: string = '') {
  return _BasicPropertDecorator(path, 'post');
}

// 接受所有的请求
export function All(path: string = '') {
  return _BasicPropertDecorator(path, 'post');
}

function _BasicPropertDecorator<T>(path: string = '', method: string) {
  return (target: any, property: string, descriptor: PropertyDescriptor) => {
    // 查看匹配路径
    // const matchPath = _getMatchParams(path, target.restPath);
    if (!target[MATCHED_PROPERTY]) {
      target[MATCHED_PROPERTY] = [];
    }
    // 把匹配到的路径记性存储
    target[MATCHED_PROPERTY].push({
      method, // 方法类型
      property, // 关联的属性
      path, // 关联的路径
    });
  };
}
