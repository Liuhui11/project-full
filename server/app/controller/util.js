'use strict';
const svgCaptcha = require('svg-captcha');
const fes = require('fs-extra');
const BaseController = require('./base');

class UtilController extends BaseController {
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

  async sendCode() {
    const { ctx } = this;
    const email = ctx.query.email;
    const code = Math.random().toString().slice(2, 6);
    console.log('邮箱' + email + '验证码:' + code);
    ctx.session.emailCode = code;
    const subject = 'hayley的验证码';
    const text = '欢迎登录';
    const html = `<h2>欢迎${code}</h2>`;
    console.log(this.service.tools.sendMail(email, subject, text, html), '发送邮箱---------');
    const hasSend = await this.service.tools.sendMail(email, subject, text, html);
    if (hasSend) {
      this.message('发送成功');
    } else {
      this.error('发送失败');
    }
  }

  async uploadFile() {
    const { ctx } = this;
    const file = ctx.request.files[0];
    const { name } = ctx.request.body;
    console.log(name, ctx.request.files, 'result========');
    await fes.move(file.filepath, this.config.UPLOAD_DIR + '/' + file.filename);
    this.success({
      url: `/public/${file.filename}`,
    });
  }
}

module.exports = UtilController;
