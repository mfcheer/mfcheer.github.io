---
title: 'Python执行sh或py文件'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Python执行sh或py文件'
slug: legacy-article-dffe748a6f
---

不获取返回结果：
```
import os

os.system("sh /path/xx.sh '%s'" %(params))
```

获取返回结果：
```
import commands

(status,output) = commands.getstatusoutput("/path/xx.sh '%s'" %(params))
status是返回状态
output是返回结果
```
<!--more-->
