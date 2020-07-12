server

```
npm install egg-router-group egg-mongoose egg-validate --save
npm install md5 jsonwebtoken --save
```

## 接口规范

```js
{
    code: 0,
    data: {

    },
    message:
    errors: 具体的报错信息
}
code 0 是成功 其他都是失败
     -1 是错误
     -666 登录状态过期
 <!-- 权限 -->

 eggjs制定接口规范：app/controller/base.js
 config/plugin.js插件文件设置
```

## 数据库
### 一、安装
[安装MongoDB教程](https://juejin.im/post/5d9c2bca51882560a8306bb4)

step1:官网下载压缩包
https://www.mongodb.com/try/download/community 

step2:执行命令行open /usr/local 打开目录将mongodb解压包命名为mongodb拖到此目录

step3:配置
```js
1、首先我们在根目录下创建data/db目录
cd /usr/local/mongodb
sudo mkdir -p /data/db

问题：mac系统升级导致报错: mkdir: /data/db: Read-only file system
解决：[Mac开启关闭SIP](https://www.jianshu.com/p/fe78d2036192)

2、给 /data/db设置读写权限

# 查看当前所系统在的username
$ whoami
->username

# 设置权限
$ sudo chown username /data/db

3、设置环境变量，打开.bash_profile文件
$ open ~/.bash_profile
添加配置:PATH=$PATH:/usr/local/mongodb/bin(注意这个路径就是mongodb安装包的路径，不要写错了)

保存后执行生效命令
$ source ~/.bash_profile
```

4、在mongodb/bin目录下启动mongodb

```js
$ mongod

可能是dbpath错误，设置一下dbpath应该就可以了
$ mongod --dbpath /data/db
#设置dbpath后再启动
$mongod
```

5、退出mongo

```js
#先停止mongod服务
$ use admin;
$ db,shutdownServer();

然后退出mongo
$exit；
```

### 二、配置

1. 在config/config.default.js添加配置：

```json
mongoose: {
    client: {
    url: 'mongodb://localhost:27017/hayley',
    options: { useUnifiedTopology: true },
    },
},
```

2. 下载Robo T3
