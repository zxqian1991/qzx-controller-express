# 基于 Express + Typescript 的注解式插件

## 安装

```bash
npm i qzx-controller-express --save
```

## 使用

```javascript
import { RouterControllerPlugin } from 'qzx-controller-express';
import { join } from 'path';
app
.use...
.use(
  RouterControllerPlugin({
    hotreload: core.$env.isDevelopment(), // 表示可以不重启加载路由文件 开发环境下使用
    routerPath: join(__dirname, 'routers'), // 表示路由的存放位置，后期会根据这个位置和请求去自动定位处理文件
  }),
);
```

## 思想

`http`的请求多种多样，一般来讲我们都是在路由里面通过路径去匹配。这种方式简单。

然而，随着项目的复杂度的增加，这种方式的可维护性就会下降很多，开发经常性的会遇到一个问题就是不知道去哪里找对应的处理请求。

> 很多时候，越是复合直觉的其实越简单

在这个基础上，阿里的`egg.js`框架就提出了，约定往往更加重要，阿里的约定就是各种 controller/service 自动装载。

不过，自动装载其实有点浪费，需要一次性加载所有的路由文件。

### 按路径加载

我们的这个插件做了一些改变，不是自动装配，也不是在文件里写死路由，而是直接通过请求路径去匹配请求。这很符合 rest 请求的第一直觉。每个路径就相当于一个资源，一个屋子，一个文件夹。

```bash
---src
  ---routers
    ---test.ts
```

假设有如上的一个文件: `test.ts`， 你可以这么写

```typescript
import { Get, Query, Param, Controller } from 'qzx-controller-express';
import { ServiceOfCore } from '../../services'; // 一个依赖注入的服务

@Controller()
export default class {
  constructor(private $core: SomneService) {} // 依赖注入
  @Get('aaa')
  index() {
    return 'bbb';
  }
  @Get()
  ttt(@Query('name') name: string = '', @Body('sss') ss: string = '') {
    return `${name}${sss}` || 'ccc';
  }
  @Get('asd/:name/dd/:id')
  sss(@Param('name') name: string, @Param('id') id: string) {
    console.log(name, id);
    return `${id}: ${name}`;
  }
}
```

GET `/test/ttt` => 'ccc'

GET `/test/ttt?name=123` => '123'

POST `/test/ttt?name=123` body {sss: 1111} => '1231111'

GET `/test/aaa` => 'bbb'

GET `/test/asd/qianzhixiang/dd/1` - 1: qianzhixiang

### 依赖注入

眼睛尖的同学已经发现上面有个疑惑，就是这个 ServiceCore 是个啥。

这个其实就是一个依赖注入，依赖注入是啥：其实就是一个单例。

我们的插件会自动的实例化 constructor 里面的各种属性，不需要手动的去装载。

`service/index.ts`

```typescript
import { Injectable } from 'qzx-controller-express';
@Injectable()
export class SomneService {
  name: string = '121221';
  age: number = 12;
  run() {}
}
```
