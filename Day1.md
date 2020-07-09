## 项目搭建
- 创建前端项目：
[nuxt安装](https://zh.nuxtjs.org/guide/installation)

```js
  npx create-nuxt-app front 
  cd front
  npm run dev
```

- 创建后端项目：
[eggjs安装](https://eggjs.org/zh-cn/intro/quickstart.html)

```json
  mkdir server && cd server 
  npm init egg --type=simple
  npm i
  npm run dev
```

## 代码规范
- [使用husky插件](https://github.com/typicode/husky)
- eslint配置
```js
  npm install husky --save-dev
  // 在package.json中添加配置
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test" // 提交之前做代码拦截
    }
  },
```

## 图形验证码
[第三方验证码库svg-captcha](https://github.com/produck/svg-captcha)
```js
npm install stylus-loader --save
```

- step1: 在server里面添加获取图形验证的路由：app/router.js
```js
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  // 验证码
  router.get('/captcha', controller.util.captcha);
};
```

- step2: 添加控制器controller/util.js：

```js
'use strict';
const svgCaptcha = require('svg-captcha');
const Controller = require('egg').Controller;

class UtilController extends Controller {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    });
    console.log('captcha=>', captcha.text);
    this.ctx.session.captcha = captcha.text;
    this.ctx.response.type = 'image/svg+xml';
    this.ctx.body = captcha.data;
  }
}

module.exports = UtilController;
```

- step3: 在front中设置代理nuxt.config.js
```js
// 新增代理，处理跨域问题
modules: [
    '@nuxtjs/proxy' // 记得添加模块
],
proxy: {
    "/api": {
        target: "http://localhost:7001", // 服务端地址
        secure: false,
        pathRewrite: {
        "^/api": ""
        }
    }
}
```
