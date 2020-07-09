## Git
- 将本地项目创建git版本控制
```json
  git init 
  git add .
  git commit -m 'first commit'
  // 添加.gitignore 忽略不需要提交的敏感信息
```

- 在远程新建一个仓库
![新建远程仓库](https://www.liaoxuefeng.com/files/attachments/919021631860000/0)
![新建远程仓库](https://www.liaoxuefeng.com/files/attachments/919021652277920/0)

- 关联本地和远程的仓库

```json
git remote add origin https://github.com/Liuhui11/project-full.git
git push -u origin master 
```

## Day 1
### 项目搭建
- 创建前端项目：
[nuxt安装](https://zh.nuxtjs.org/guide/installation)

```json
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

### 代码规范
- [使用husky插件](https://github.com/typicode/husky)
- eslint配置
```json
  npm install husky --save-dev
  // 在package.json中添加配置
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run test" // 提交之前做代码拦截
    }
  },
```