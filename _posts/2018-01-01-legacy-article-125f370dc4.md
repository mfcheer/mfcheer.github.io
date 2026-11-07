---
title: '1、类型'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：1、类型'
slug: legacy-article-125f370dc4
---

# 1、类型
null表示的是一个对象的值，而并不是一个字符串。例如声明一个对象的引用，String a = null ;

""表示的是一个空字符串，也就是说它的长度为0。例如声明一个字符串String str = "" ;

# 2、内存分配
String str = null ; 表示声明一个字符串对象的引用，但指向为null，也就是说还没有指向任何的内存空间；

String str = "";    表示声明一个字符串类型的引用，其值为""空字符串，这个str引用指向的是空字符串的内存空间；

在java中变量和引用变量是存在栈中（stack），而对象（new产生的）都是存放在堆中（heap）：
<!-- more -->
就如下：

String str = new String("abc") ;

ps：=左边的是存放在栈中（stack），=右边是存放在堆中（heap）。

# 3、示例程序：
```
public class String_Demo01 {
    public static void main(String[] args) {        
        String str1 = new String() ;
        String str2 = null ;
        String str3 = "" ;
        System.out.println(str1==str2);                //内存地址的比较，返回false
        System.out.println(str1.equals(str2));         //值的比较，返回false
        System.out.println(str2==str3);                //内存地址的比较，返回false
        System.out.println(str3.equals(str2));         //值的比较，返回false
        System.out.println(str1==str3);                //内存地址的比较，返回false
        System.out.println(str1.equals(str3));         //值的比较，返回true
    }
}
```
通过如上的程序可以得出如下结论：

字符串对象与null的值不相等，且内存地址也不相等；

空字符串对象与null的值不相等，且内存地址也不相等；

创建一个字符串对象的默认值为""

# 4、 null!=a和a!=null
java判断null!=a和a!=null实际上没区别。

建议在判断时，把常量放在前面，
比如 if(4 == a)，
这样写的好处是当你不小心少写一个=时，会有错误报告，而不是继续运行

```
String str = null;
	if ("hello".equals(str))
		System.out.println("true");
	else 
	    System.out.println("false");
```
输出 false

```
String str = null;
    if (str.equals("hello"))
	System.out.println("true");
    else 
	System.out.println("false");
```
错误Exception

所以在代码中，最好把常量放在前面。