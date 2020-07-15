'use strict';
const md5 = require('md5');
const BaseController = require('./base');
const HashSalt = ':Kaikeba@good!@123';

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
};

class UserController extends BaseController {
//   async login() {

  //   }

  async register() {
    const { ctx } = this;
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

    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {
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
    } else {
      this.error('验证码错误');
    }

    // this.success({ name: 'kkb' })
  }

  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }
  async verify() {
    // 校验用户名是否存在

  }

  // async info() {

  // }
}

module.exports = UserController;
