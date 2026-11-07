---
title: 'MacOS下防止rm命令误删'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：MacOS下防止rm命令误删'
slug: legacy-article-45bb142e93
---

linux下的rm删除是不能恢复的。mac下有废纸篓的概念，我们可以对rm进行修改，将删除的文件放到废纸篓里

安全删除脚本, safe_rm.sh

```
TRASH_DIR="/Users/mfcheer/.Trash"
for i in $*; do
    mv -f $i $TRASH_DIR
done
```

将安全删除脚本文件的目录，修改~/.bash_profile文件将脚本加入到PATH中，再对rm命令重定向

```
alias rm='safe_rm.sh'
```
这样就能安全的使用rm了