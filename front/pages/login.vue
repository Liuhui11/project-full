<template>
  <div class="login-container">
    <el-form label-width="100px" class="login-form" :model="form" :rules="rules" ref="loginForm">
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>

      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha" @click="updateCaptcha">
            <img :src="code.captcha" alt="">
        </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码"></el-input>
      </el-form-item>

      <el-form-item prop="emailCode" label="邮箱验证码" class="captcha-container">
        <div class="captcha" @click="updateCaptcha">
            <el-button @click="sendEmailCode" type="primary" :disabled="send.timer > 0">{{sendText}}</el-button>
        </div>
        <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码"></el-input>
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input type="password" v-model="form.password" placeholder="请输入密码"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click.native.prevent="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import md5 from 'md5'
export default {
    layout: 'login',
    data() {
      return {
        send: {
          timer: 0,
        },
        rules: {
          email: [
            {require: true, message: '请输入邮箱'},
            {type: 'email', message: '请输入正确的邮箱格式'}
          ],
          captcha: [
            {require: true, message: '请输入验证码'},
          ],
          emailCode: [
            {require: true, message: '请输入邮箱验证码'},
          ],
          password: [
            {require: true, message: '请输入6~12位密码'},
          ],
        },
        form: {
          email: '894506380@qq.com',
          captcha: '',
          emailCode: '',
          password: '',
        },
        code: {
          captcha: '/api/captcha'
        }
      }
    },
    computed: {
      sendText() {
        if (this.send.timer <= 0) {
          return '发送';
        }
        return `${this.send.timer}s后发送`;
      }
    },
    methods: {
      updateCaptcha() {
        this.code.captcha = `/api/captcha?_t=${new Date().getTime()}`
      },
      handleLogin() {
        this.$refs.loginForm.validate(async valid => {
          if(valid) {
            // @todo 发送注册请求
            let obj = {
              email: this.form.email,
              password: md5(this.form.password),
              captcha: this.form.captcha,
              emailCode: this.form.emailCode,
            }
            console.log('校验成功', obj, this.form);
            let ret = await this.$http.post('/user/login', obj)
            if (ret.code == 0) {
              // token的存储 登录成功，返回token
              this.$message.success('登录成功');
              localStorage.setItem('token', ret.data.token);
              setTimeout(() => {
                this.$router.push('/')
              }, 500);
            } else {
              this.$message.error(ret.message);
            }
          } else {
            console.log('校验失败');
          }
        })
      },
      async sendEmailCode() {
        await this.$http.get('/sendCode?email='+this.form.email);
        this.send.timer = 10;
        this.timer = setInterval(() => {
          this.send.timer -= 1;
          if (this.send.timer === 0) {
            clearInterval(this.timer);
          }
        });
      },
    },
}
</script>
<style lang="stylus">
</style>
