---
title: Java-单例设计模式（基础）
date: 2015-10-29 16:44:22
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-5ee9f097ff
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49493577

###  设计模式

对问题的行之有效的解决方法，其实它是一种思想。不要固化。

####  1，单例设计模式。

    
    
    解决的问题：
    保证一个类在内存中的对象唯一性。
    

必须对于多个程序使用同一配置信息对象时，就该保证对象唯一性。  
如何保证对象唯一性？  
1），不可以让其他程序用new创建对象。  
2），在该类中，创建一个本类实例。  
3），对外提供方法让其他程序获取该对象。  
步骤：  
1），私有化该类构造函数。  
2），通过new在本类中创建一个本类对象。  
3），定义一个共有方法，将创建的对象返回。

代码例子：

    
    
    class Single
    {
        private static Single s = new Single();
    
        private Single (){}
    
        public static Single get()
        {
            return s;
        }
    }
    
    public class mfcheer 
    {   
        public static void main(String[] args) 
        {
            Single s1 = Single.get();//可控
            Single s2 = Single.get();
            System.out.println(s1==s2);//返回true
            // Single sss = Single.s; 不可控
        }
    }
    
    
    //类加载时，无对象，get方法调用时才创建对象
    //延迟加载形式
    //懒汉式 ： 用到时才创建对象
    //存在的问题：多线程时可能存在安全隐患
    
    class Single
    {
        private static Single s = null;
    
        private Single (){}
    
        public static Single get()
        {
            if (s == null)
                s = new Single();
            return s;
        }
    }

