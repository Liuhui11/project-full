## Git
- 将本地项目创建git版本控制

```js
  git init 
  git add .
  git commit -m 'first commit' // 添加.gitignore 忽略不需要提交的敏感信息
  git branch // 查看分支
  git branch -a // 查看所有分支
  git branch dev // 新建分支
  git checkout dev // 切换分支
  git push --set-upstream origin login // 将本地分支推送关联远程分支

```

- 在远程新建一个仓库

![新建远程仓库](https://www.liaoxuefeng.com/files/attachments/919021631860000/0)

![新建远程仓库](https://www.liaoxuefeng.com/files/attachments/919021652277920/0)

- 关联本地和远程的仓库

```js
git remote add origin https://github.com/Liuhui11/project-full.git
git push -u origin master 
```

## NPM

```js
设置淘宝镜像：npm config set registry http://registry.npm.taobao.org
查看当前镜像：npm get registry
```