'use strict';

const jwt = require('jsonwebtoken');

// 解析token的中间件，也可以用egg-jwt，自己封装更适合了解原理

module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    if (!ctx.request.header.authorization) {
      ctx.body = {
        code: -1,
        message: '用户没有登录',
      };
      return;
    }
    const token = ctx.request.header.authorization.replace('Bearer ', '');
    console.log(token, 'token-----', app.config.jwt.secret);
    try {
      const ret = await jwt.verify(token, app.config.jwt.secret);
      console.log(ret, 'ret========');
      ctx.state.email = ret.email;
      ctx.state.userid = ret._id;
      await next();
    } catch (err) {
      console.log('error', err);
      if (err.name === 'TokenExpiredError') {
        ctx.body = {
          code: -666,
          message: '登录过期了',
        };
      } else {
        ctx.body = {
          code: -1,
          message: '用户信息出错了',
        };
      }
    }
  };
};
