---
title: '连接GitHub'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：连接GitHub'
slug: legacy-article-2dd40d1e5b
---

# 连接GitHub

```
创建SSH Key，在用户主目录（~）下创建SSH Key: 
ssh-keygen -t rsa -C “youremail@example.com”
然后一路回车使用默认值即可。
执行完之后，我们可以找到.ssh目录，里面有id_rsa和id_rsa.pub两个文件，这两个就是SSH Key的密钥对，id_rsa是私钥，id_rsa.pub是公钥。
登录GitHub，打开”Account settings”，找到”SSH Keys”页面，点击”Add SSH Key”，把id_rsa.pub文件中的内容粘贴过来。
```
<!--more-->
# 创建版本库(Repository)

```
新建一个目录: mkdir my_dir && cd my_dir
用 git init 把目录变成Git可以管理Repository
git clone: 克隆已有的远端仓库
git add filename 将文件添加到仓库
git commit -m “xxxxx” 告诉Git把文件提交到Repository 
git add 命令可以执行多次，添加多个文件到仓库 
git commit 命令中 -m 后面输入的是本次提交的说明，可以输入任意内容
版本修改
git status 命令查看Repository当前的状态
git diff filename 查看修改过的但还没提交的文件与已经commit到仓库中的区别
git log 查看从最近到最远的提交日志
```
# 分支

```
git branch: 查看所有本地分支，带*的是当前分支。
git checkout –b dev: 以当前分支为基础，创建一个新的dev分支，并切换到dev.
git checkout ${br_name}: 切换到名为${br_name}的分支。
git branch -a: 查看所有分支，包括远端
git merge ${br_name}: 把分支${br_name}的最新内容合并到当前分支
```

# 工作区

```
工作区（Working Directory）和版本库（Repository）的区别 
工作区就是指的某个目录，例如上面的my_dir。
在my_dir中有一个隐藏目录.git，这个就是版本库。 
版本库中最重要的就是被称为stage（或者index）的暂存区，还有Git为我们自动创建的第一个分支master以及指向master的指针HEAD。
git add 命令就是把文件添加的暂存区
git commit 命令提交更改后，就是把暂存区的所有内容提交到当前分支
git checkout – filename 命令可以把文件在工作区的修改全部撤消掉，有两种情况： 
一种是filename文件修改后还没添加到暂存区，撤消修改之后就和版本库一样。
一种是filename文件修改后添加到暂存区，撤消修改之后就回到添加到暂存区后的状态。
当在工作区把某个文件删除了之后，版本库中还存在，这时用git status 命令可以看到版本库中那些文件在工作区被删除了，这时有两种选择： 
一种是确实要删除某个文件，那么版本库中也应该相应删除，可以使用git rm filename 并且git commit -m “xxxx” 命令在版本库中删除。
另一种是删错了，那么可以使用git checkout – filename 命令把工作区误删的文件恢复到最新版。
```
# 远程仓库

```
git remote add origin git@github.com:xxxx/xxxx.git 命令将本地仓库与GitHub仓库关联。 
执行之后，远程库的名字就是origin。
git pull 把远程仓库的东西pull到本地
git push -u origin master 命令把本地库中的所有内容推送到远程库中。 
git push 命令就是把当前分支master推送到远程
由于一开始远程库是空的，-u参数不仅能够将本地master分支内容推送到远程新的master分支，还会把本地的master分支和远程的master分支关联起来，在以后的推送和拉取时就可以简化命令。
之后就可以用git push origin master 命令了。
注意可以用git push -f命令来强制推送。
git clone git@github.com:xxxx/xxxx.git 命令从远程库中克隆一个到本地仓库
git fetch [origin] [br_name]: 从远端仓库origin拉取分支br_name的最新代码到本地。用于更新本地代码。
git pull = git fetch + git merge
```
# 缓存回滚

```
git stash: 把当前分支上的修改缓存起来，得到一个干净的working directory。缓存是独立于分支的，可以在任何分支git stash pop恢复最近的被缓存起来的修改。
git reset: 对于未push到远端的修改，优先使用这个。
git revert: 对于push到远端的修改。
```

# 常见错误

```
error: failed to push some refs to ...
出现错误的主要原因是github中的README.md文件不在本地代码目录中
可以通过如下命令进行代码合并【注：pull=fetch+merge]
git pull --rebase origin master
```
```
提交代码成功后并不显示绿格子
原因是本地Git的配置邮箱和github上面的邮箱不一致。
git config --global user.name "youname"
git config --global user.email "youeamil@email.com"
```