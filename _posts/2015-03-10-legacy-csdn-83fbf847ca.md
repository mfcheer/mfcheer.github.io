---
title: 当我真正理解了扩展欧几里得定理
date: 2015-03-10 18:27:16
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-83fbf847ca
---

首先、扩展欧几里得定理：对于两个不全为0的整数a、b，必存在一组解x,y，使得ax+by==gcd(a,b);

    
    
    void exgcd(long long  a, long long b, long long & d, long long& x, long long& y)  
    {  
        if (!b)  
        {  
            d = a;  
            x = 1;  
            y = 0;  
        }  
        else  
        {  
            exgcd(b,a%b,d,y,x);  
            y -= x *(a/b);  
        }  
    }  

  

我个人觉得第一次看到这个程序你会有以上两个不明白的地方（见注释），下面我分别解释

不明处1：由扩展欧几里得定理：ax+by==gcd(a,b)---式1，而此时b==0，也就是说gcd(a,0)==a。原式变为ax+by==a -->
x==1,y==0。应该够清楚了吧

不明处2：这里先说明一下我的一些规则，x,y表示第一次递归时的值，x1,y1表示第二次递归时的值。那么

gcd(a,b)==gcd(b,a%b)，同时都代入式1，有ax+by==b*x1+(a%b)*y1。将右边变形一下

b*x1+(a%b)*y1==b*x1+(a-(a/b)*b)*y1==a*y1+b*(x1-(a/b)*y1)，最终得到ax+by==a*y1+b*(x1-(a/b)*y1)

也就是说，上一深度的x等于下一深度的y1，上一深度的y等于下一深度的x1-(a/b)*y1。    需要注意，上面推导时用的除法都是整型除法

到这里为止，我们便得到了不定式ax+by==gcd(a,b)的一组解，x、y。

那么对于一般的不定式ax+by==c，它的解应该是什么呢。很简单，x1=x*(c/gcd(a,b)),y1=y*(c/gcd(a,b))。很好理解吧~

再深入一点，就解出这么一组解其实一般来说是解决不了什么问题的。没有哪个ACM的题这么简单吧。。。比如我们现在要得到所有的解，那么这所有的解究竟是什么呢？

直接说吧,假设d=gcd(a,b). 那么x=x0+b/d*t; y=y0-a/d*t;其中t为任意常整数。

这个是怎么推导出来的，说实话我也不知道，就先这么记着吧！

好了，说了这么多，光说不练也无济于事

先做一个最简单的题目，pku 1061青蛙的约会

先说一下大概题意：有两只青蛙，一只在坐标x，另一直在坐标y，青蛙x一次跳跃可以前进m单位距离，青蛙y一次跳跃可以前进n单位的距离，两青蛙都在同一纬度，该纬度长度为L。两只青蛙同方向同时跳啊跳，问你最少跳多少次，它们才可以相遇，如果不能相遇，输出impossble

分析：假设跳了T次以后，青蛙1的坐标便是x+m*T,青蛙2的坐标为y+n*T。它们能够相遇的情况为（x+m*T）-(y+n*T)==P*L，其中P为某一个整数，变形一下

得到(n-m)*T+P*L==x-y
我们设a=(n-m),b=L,c=x-y,T=x,P=y.于是便得到ax+by==c。激动啊，这不就是上面一样的式子吗~

直接套用扩展欧几里得函数，得到一组解x,y。由于问题是问最少跳多少次，于是只有x是我们需要的信息。那么再想，x是最小的吗？

答案是可能不是！那么如何得到最小解呢？  我们考虑x的所有解的式子：
x=x0+b/d*t。x0是我们刚刚求到的，很显然右边是有个单调函数，当t为某一个与x正负性质相反的数时，可以得到最小的x。
令x的正负性质为正，那么x=x0-b/d*t1
(t1==-t)。令x==0，那么t=x0*d/b，最小的x等于x0减去t*b/d。这里得到的x可能是负数，如果是负数，我们再为它加上一个b/d即是所求答案了！

    
    
    #include<iostream>
    #include<string>
    #include<cmath>
    #include<algorithm>
    usingnamespace std;
    
    __int64 x,y,a,b,c,d;
    __int64 n,m,X,Y,L;
    
    __int64 gcd(__int64 a,__int64 b)
    {
        __int64 t,d;
        if(b==0)
        {
            x=1;
            y=0;
            return a;
        }
        d=gcd(b,a%b);
        t=x;
        x=y;
        y=t-(a/b)*y;
        return d;
    }
    
    int main()
    {
        while(scanf("%I64d%I64d%I64d%I64d%I64d",&X,&Y,&m,&n,&L)==5)
        {
            a=n-m;
            b=L;
            c=X-Y;
            d=gcd(a,b);
            if(c%d!=0)
            {
                printf("Impossible\n");
                continue;
            }
            x=x*(c/d);
            y=y*(c/d);
    
            /*通解：
            x1=x+b/d*t;
            y1=y-a/d*t;
            t为任意整数
            */
            //找最小的x1，即求x+b/d*t最小，那么只有t为某一个数时才最小
            //显然t必须与x正负相反才有最小，那么就看做x-b/d*t,这个式子的最小值便是t=x/(b/d)时，注意这是整型除法
            __int64 k=x*d/b;
            k=x-k*b/d;
            if(k<0)
                k+=b/d;
            printf("%I64d\n",k);
        }
        return0;
    }

  
转自： [ http://www.cnblogs.com/ka200812/archive/2011/09/02/2164404.html
](http://www.cnblogs.com/ka200812/archive/2011/09/02/2164404.html)

