---
title: '安装'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：安装'
slug: legacy-article-4edfafe078
---

# 安装
在命令行下输入kinit，若是有这个命令，说明kerberos已经装好了。否则需要自己安装。

# 配置
安装完成后，修改/etc/ssh/ssh_config
```
GSSAPIAuthentication yes 
GSSAPIDelegateCredentials yes 
GSSAPITrustDNS yes 
GSSAPIKeyExchange yes
```
<!--more-->
## 升级MacOs sierra报错处理
```
报错如下：
/etc/ssh/ssh_config: line 4: Bad configuration option: gssapitrustdns
/etc/ssh/ssh_config: line 5: Bad configuration option: gssapikeyexchange  
/etc/ssh/ssh_config: terminating, 2 bad configuration options
```
## 解决方式
```
注释报错中的两行，然后：
  当前用户目录新建文件 .ssh/config
  内容： 
  Host *
     ControlMaster auto
     ControlPath ~/.ssh/%h-%p-%r
     ControlPersist yes
```

# 简单使用
```
登陆：kinit 账户
查看：klist
注销：kdestroy
修改密码：kpasswd 用户名
登录服务器：ssh IP
```