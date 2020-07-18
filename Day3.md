### eslint报错问题解决，先屏蔽

```json
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test"
    }
  },
```

### 登录邮箱验证码

1. 用户名密码验证
  1. 简单的验证码
  2. token的管理 =》用户中心页面，发送请求自动带上token
2. 用户信息
  1. 信息的增删改查
  2. 头像的上传

[发送邮件：nodemailer](https://github.com/nodemailer/nodemailer)