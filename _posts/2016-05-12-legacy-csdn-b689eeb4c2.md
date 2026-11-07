---
title: VIM配置
date: 2016-05-12 15:27:10
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b689eeb4c2
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/51384471

![这里写图片描述](https://img-blog.csdn.net/20160512152555332)  
ubuntu系统下打开终端，输入vim就进入vim了。

配置方法是输入 vim ~/.vimrc (这样是用vim编辑配置文件，或者用 gedit ~/.vimrc 就是用gedit编辑了)

配置的话，按照自己习惯加几句配置文件就可以使用了。

一般配置下面几个：

    
    
    syntax on
    set nu
    set tabstop=4
    set shiftwidth=4
    colo evening
    set mouse=a
    set cin

然后配置以后保存。VIM的配置就结束了。  
然后在终端里面 输入 vim A.cpp 然后就开始写代码了。

编译运行的话，可以另外打开一个终端（就是左侧右击，然后new一个出来），就可以一边编辑，一遍保存了。  
但是注意在代码编译以后，一定要 :w 来保存下，然后进行编译运行。  
编译可以输入 g++ A.cpp -o A  
如果没有错就可以了。  
然后输入 ./A 来运行，然后输入数据啥的，退出的话是 按 Ctrl+C

