'use strict';
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const BaseController = require('./base');
const HashSalt = ':Kaikeba@good!@123';

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
};

class UserController extends BaseController {
  async login() {
    const { ctx, app } = this;
    const { email, captcha, password, emailCode } = ctx.request.body;
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      this.error('验证码错误');
    }
    if (emailCode.toUpperCase() !== ctx.session.emailCode.toUpperCase()) {
      this.error('邮箱验证码错误');
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt),
    });
    if (!user) {
      return this.error('用户名密码错误');
    }
    // 用户的信息加密成token返回
    const token = jwt.sign({
      _id: user._id,
      email,
    }, app.config.jwt.secret, {
      expiresIn: '1h',
    });
    this.success({ token, email, nickname: user.nickname });
  }

  async register() {
    const { ctx } = this; // ctx是什么？this是什么？
    try {
      // 校验传递的参数
      ctx.validate(createRule);
    } catch (e) {
      console.log(e);
      return this.error('参数校验失败', -1, e.errors);
    }

    // 获取数据
    const { email, password, captcha, nickname } = ctx.request.body;
    console.log(email, password, captcha, nickname);
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      this.error('验证码错误');
    }
    // 邮箱是不是重复了
    if (await this.checkEmail(email)) {
      this.error('邮箱重复了');
    } else {
      const ret = await ctx.model.User.create({
        email,
        nickname,
        password: md5(password + HashSalt),
      });
      if (ret._id) {
        this.message('注册成功');
      }
    }
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }
  async verify() {
    // 校验用户名是否存在
    console.log('verify');
  }

  async info() {
    console.log('info');
    // 你还不知道是哪个邮件 需要从token里取读取
    const { ctx } = this;
    const { email } = ctx.state;
    const user = await this.checkEmail(email);
    this.success(user);
  }
}

module.exports = UserController;
