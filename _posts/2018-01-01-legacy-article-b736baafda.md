---
title: 'lzop -v test # 创建test.lzo压缩文件，输出详细信息，保留test文件不变'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：lzop -v test # 创建test.lzo压缩文件，输出详细信息，保留test文件不变'
slug: legacy-article-b736baafda
---

查看端口占用情况：
```shell
lsof -i:端口号 用于查看某一端口的占用情况，比如查看8000端口使用情况，lsof -i:8000
```

显示 tcp，udp 的端口和进程等相关情况：
```
例如查看 8000 端口的情况，使用以下命令：
netstat -tunlp | grep 8000
tcp        0      0 0.0.0.0:8000            0.0.0.0:*               LISTEN      26993/nodejs
```

压缩命令
```shell
单个文件压缩打包 tar czvf my.tar file1
多个文件压缩打包 tar czvf my.tar file1 file2,...
单个目录压缩打包 tar czvf my.tar dir1
多个目录压缩打包 tar czvf my.tar dir1 dir2
解包至当前目录：tar xzvf my.tar
```

解压war文件
```shell
jar -xvf name.war
```

Linux 统计某个字符串出现的次数

```shell
cat filename |grep str |wc -l
```

定时任务
```shell
crontab -e 
```

查看文件内容 

```
如果你只想看文件的前5行，可以使用head命令，如： 
head -5 /etc/passwd 
如果你想查看文件的后10行，可以使用tail命令，如： 
tail -10 /etc/passwd 或 tail -n 10 /etc/passwd 
tail -f /var/log/messages 
参数-f使tail不停地去读最新的内容，这样有实时监视的效果 用Ctrl＋c来终止！ 
```
本地文件上传到主机
```
rz -be
```
主机文件下载到本地
```
sz "filename"
```
<!--more-->
日志定期清理sh
```
#!/bin/bash
log_path=/opt/web/mFangchanIndex #日志路径
export log_path
expried_time=7      #此处定义你的日志过期时间，如7天
find $log_path -type f -mtime +7 -iname "log.*" | xargs rm  1>/dev/null 2>&1
```
查看进程和删除进程

```
ps 命令用于查看当前正在运行的进程。
grep 是搜索
ps [选项]
-e 显示所有进程,环境变量
-f 全格式
-h 不显示标题
-l 长格式
-w 宽输出
kill 命令用于终止进程
-9 表示强迫进程立即停止

例子：
ps -ef | grep java
ps aux|grep tcp
kill -9 [PID]
```

Linux间进行文件传送-scp命令
```
linux 的 scp 命令可以在 linux 之间复制文件和目录；  
scp 可以在 2个 linux 主机间复制文件； 
命令基本格式： 
scp [可选参数] file_source file_target 
从本地复制到远程： 
复制文件： 
scp local_file remote_ip:remote_file 
scp /home/space/music/1.mp3 root@www.cumt.edu.cn:/home/root/others/music 
复制目录：  
scp -r local_folder remote_username@remote_ip:remote_folder 
命令执行后需要输入密码； 
例子： 
scp -r /home/space/music/ root@www.cumt.edu.cn:/home/root/others/ 
从远程复制到本地 ，只要将从本地复制到远程的命令的后2个参数调换顺序即可； 
```

解压 .lzop压缩文件

```
# lzop -v test # 创建test.lzo压缩文件，输出详细信息，保留test文件不变
# lzop -Uv test # 创建test.lzo压缩文件，输出详细信息，删除test文件
# lzop -t test.lzo # 测试test.lzo压缩文件的完整性
# lzop –info test.lzo # 列出test.lzo中各个文件的文件头
# lzop -l test.lzo # 列出test.lzo中各个文件的压缩信息
# lzop –ls test.lzo # 列出test.lzo文件的内容，同ls -l功能
# cat test | lzop > t.lzo # 压缩标准输入并定向到标准输出
# lzop -dv test.lzo # 解压test.lzo得到test文件，输出详细信息，保留test.lzo不变
```

rsync命令
```
kinit username
例子：
rsync -av rec/ work@10.12.90.13:/opt/rec --exclude='logs'
--exclude='logs'说明 ： 不拷贝logs文件夹
```

SSH基本的用法
```
SSH主要用于远程登录。假定你要以用户名user，登录远程主机host，只要一条简单命令就可以了。
$ ssh user@host
如果本地用户名与远程用户名一致，登录时可以省略用户名。
$ ssh host
SSH的默认端口是22，也就是说，你的登录请求会送进远程主机的22端口。使用p参数，可以修改这个端口。
$ ssh -p 2222 user@host
上面这条命令表示，ssh直接连接远程主机的2222端口。
```

搜索输入过的命令
```
ctrl+r:搜索某个以前输入过的命令 或者!command
```
cat合并文件
```
使用cat合并文件，如cat 1.txt 2.txt 3.txt > 4.txt；
如果1/2/3.txt中存在多个空行，最终保存到4.txt时，连续的空行会被替换为1行。
如果我们希望去掉空行，可以使用如下：cat -s 1.txt 2.txt 3.txt > 4.txt
```
diff命令
```
在使用diff命令的时候有3种显示，但是如果我们仅仅需要查看2个文件所有不同的记录，
去掉diff加上的123a124或者>或者<,可以先diff a b > difflog，
然后使用grep+sed：cat difflog
```
df -h 查看磁盘使用情况
```
df -h
```
nohup 后台运行
```
nohup command 1>output 2>&1 &
```
split 将一个大文件分割成很多个小文件
```shell
每3行（-l 3）拆分成一个文件，拆分后的文件名以name开头，以数字作为后缀（-d）后缀长度为1（-a 1）
split -l 3 test -d -a 1 name
```
自定义命令，例如mac不支持ll命令
```shell
vim ~/.bash_profile
输入以下内容
alias ll='ls -lF'
保存完成之后
source ~/.bash_profile
可以使用ll等命令了
```
自动拉起后台程序脚本例子
```shell
function monitorService()
{
    cnt=$( ps -ef | grep java | grep -v grep | grep service | wc -l )
    echo $cnt
    if [ $cnt -eq 0 ]; then
        msg="$bin service is not running, start it."
        echo $msg
        #发送短信到负责人
        sh /opt/server server.sh
    else
        echo "$bin service is running."
    fi
}
```

hadoop 查看文件夹下文件名称，按存储从大到小排列

```shell
hadoop fs -du xxx|sort -n -r  | awk '/^[0-9]+/ { print int($1/(1024**3)) " [GB]\t" $2 $3}'
```

Win10打开Ubuntu的文件夹

```shell
在Shell界面输入命令
explorer.exe .
```

Python Lib库加载

```shell
export LD_LIBRARY_PATH=/opt/xxx/ss_lib/so:$LD_LIBRARY_PATH
```

Python sqlacodegen 生成 ORM文件

```shell
sqlacodegen mysql://db_name:password@ip:port/table
```

markdown2激活码

```
邮箱地址：
Soar360@live.com
授权秘钥：
GBPduHjWfJU1mZqcPM3BikjYKF6xKhlKIys3i1MU2eJHqWGImDHzWdD6xhMNLGVpbP2M5SN6bnxn2kSE8qHqNY5QaaRxmO3YSMHxlv2EYpjdwLcPwfeTG7kUdnhKE0vVy4RidP6Y2wZ0q74f47fzsZo45JE2hfQBFi2O9Jldjp1mW8HUpTtLA2a5/sQytXJUQl/QKO0jUQY4pa5CCx20sV1ClOTZtAGngSOJtIOFXK599sBr5aIEFyH0K7H4BoNMiiDMnxt1rD8Vb/ikJdhGMMQr0R4B+L3nWU97eaVPTRKfWGDE8/eAgKzpGwrQQoDh+nzX1xoVQ8NAuH+s4UcSeQ==
```

kepler 地图可视化

```
https://kepler.gl/

切换地图为中文，设置map style = mapbox://styles/mapbox/streets-zh-v1  
```

常用
```
alias ll='ls -lh'
alias lll='ls -alFh'
alias la='ls -Ah'
alias l='ls -CFh'
alias srm='sudo rm'
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"
alias rm='safe_rm.sh'
alias du="du -h"
alias grep="grep --color=auto"
alias vim="vim -p"
alias vi='vim -p'

ps aux | grep $1 | awk '{print $2}' | xargs kill

current_dir=`pwd`
rsync -rav --exclude ".git" --exclude="output" --exclude="*.pyc" --exclude="\.*.swp" "${current_dir}" "${user_at_host}:${destination_dir}"
```

linux安全删除
```
safe_rm.sh
TRASH_DIR="/Users/mengfanqiang/.Trash"
for i in $*; do
    mv -f $i $TRASH_DIR
done
将safe_rm.sh加入到PATH

alias rm='safe_rm.sh'
```
