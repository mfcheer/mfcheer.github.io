---
title: Java编程思想 - 第6章、访问权限控制
date: 2015-10-29 11:08:30
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-fbfe8ba108
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49488911

###  本章主要知识点是访问权限:

public > protected > (无关键词) > private

1，

####  杂碎的知识点：

包内含有一组类，它们在单一的名字空间下被组织到了一起。  
import关键字用于导入类。  
例子：

    
    
    import java.util.ArrayList;
    
    public class mfcheer 
    {
         public static void main(String[] args) 
         {
             ArrayList list = new java.util.ArrayList();
         }
    }

导入所有类只需使用 ` import java.util.*; `

代码组织：  
关键字 package 在文件起始位置处，这样写

    
    
    package access；

表示你在声明该编译单元是名为access的类库的一部分。

Java解释器运行过程：  
首先找出环境变量CLASSPATH，CLASSPATH包含一个或多个目录，用于查找.class文件根目录。从根目录开始产生一个路径名称，得到的路径与CLASSPATH各个不同项目链接，解释器就会在目录中查找与你所创建的类名称相关的.class文件。

2，

####  Java访问权限修饰词：

    
    
        public：import之后包内包外可以使用
        protected：继承访问权限，只有子类可以访问。同时，protected也提供包访问权限
        包访问权限：（类前面没有权限修饰符）一个包的代码可以访问本包内所有代码，但是本包对外界成员是透明的、不可见的
        private：除本类外包内包外均无法访问
    

封装的原因：  
1），设定客户端程序员可以使用和不适用的界限，建立内部机制。  
2），将接口和具体实现分离。便于重构。

