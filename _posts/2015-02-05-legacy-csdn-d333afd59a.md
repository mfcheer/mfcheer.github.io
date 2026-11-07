---
title: hdu-1465 不容易系列之一 【排错公式】
date: 2015-02-05 18:12:48
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-d333afd59a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43531281

**问题提出：n封不同的信对应n个不同的信箱，问都装错信封的方法有多少种？**

** 分析：错排公式的递推式为： ![](https://img-
blog.csdn.net/20130812154616031?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvQUNkcmVhbWVycw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)
**

  

#  不容易系列之一

** Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65536/32768 K
(Java/Others)  
Total Submission(s): 15670    Accepted Submission(s): 6478  
**  
  

Problem Description

大家常常感慨，要做好一件事情真的不容易，确实，失败比成功容易多了！  
做好“一件”事情尚且不易，若想永远成功而总从不失败，那更是难上加难了，就像花钱总是比挣钱容易的道理一样。  
话虽这样说，我还是要告诉大家，要想失败到一定程度也是不容易的。比如，我高中的时候，就有一个神奇的女生，在英语考试的时候，竟然把40个单项选择题全部做错了！大家都学过概率论，应该知道出现这种情况的概率，所以至今我都觉得这是一件神奇的事情。如果套用一句经典的评语，我们可以这样总结：一个人做错一道选择题并不难，难的是全部做错，一个不对。  
  
不幸的是，这种小概率事件又发生了，而且就在我们身边：  
事情是这样的——HDU有个网名叫做8006的男性同学，结交网友无数，最近该同学玩起了浪漫，同时给n个网友每人写了一封信，这都没什么，要命的是，他竟然把所有的信都装错了信封！注意了，是全部装错哟！  
  
现在的问题是：请大家帮可怜的8006同学计算一下，一共有多少种可能的错误方式呢？

  

Input

输入数据包含多个多个测试实例，每个测试实例占用一行，每行包含一个正整数n（1 <n<=20），n表示8006的网友的人数。

  

Output

对于每行输入请输出可能的错误方式的数量，每个实例的输出占用一行。

  

Sample Input

2 3

  

Sample Output

1 2

  

    
    
    #include<stdio.h>
    
    #include<string.h>
    
    #include<stdlib.h>
    
    long long set[25];
    
    void fun()
    
    {
    
         memset(set,0,sizeof(set));
    
         set[1]=0;
    
         set[2]=1;
    
         for(int i=3;i<25;i++)
    
         {
    
             set[i]=(i-1)*(set[i-1]+set[i-2]);
    
         }
    
    }
    
    int main()
    
    {
    
        fun();
    
        int n;
    
        while(scanf("%d",&n)!=EOF)
    
        {
    
            printf("%I64d\n",set[n]);
    
        }
    
        return 0;
    
    }
    

  

