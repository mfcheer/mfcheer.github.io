---
title: poj-2155
date: 2014-11-02 08:41:56
tags: ['位运算', 'acm']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-68fc5efdba
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40706579

今天做BC，被学长批评了，深深地自我反省中...

  

引自小媛：

楼教主出的二维树状数组。

给出矩阵左上角和右下角坐标，矩阵里的元素 1变0 ，0 变1，然后给出询问，问某个点是多少。

纠结好久了，一直没什么好思路，看discuss说四个角神马的，我搜了下，理解了，树状数组里记录该点的变幻次数，或者直接%2也行。

查询的时候Getsum得到的是该点在所有区间的总变幻次数，最后%2就是结果。

建图的时候死活想不通，杂四个点的坐标是那个 = =。。。刚才协会开会了，在路上想通了，我想的0,0坐标是类似坐标轴的那种，在左下角。。。而矩阵的0 0
应该是在左上角。。这样，什么都通了 = =。。。

提供坐标的图。。

![](http://hi.csdn.net/attachment/201103/21/6627258_1300679141f1mR.jpg)  

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    
    using namespace std;
    
    int t ;
    int n,m;
    int a[1010][1010];
    char b;
    
    int w,x,y,z;
    
    int low(int i)
    {
        return i & (-i);
    }
    
    void add (int i ,int j,int v)
    {
        for (int k=i;k<=n;k+=low(k))
            for (int w=j;w<=n;w+=low(w))
        {
            a[k][w]+=v;
        }
    }
    
    int sum(int i,int j)
    {
        int ans = 0;
        for (int k = i;k>0;k-=low(k))
            for (int w =j;w>0;w-=low(w))
        {
            ans+=a[k][w];
        }
        return ans ;
    }
    
    
    int main()
    {
    
        scanf ("%d",&t);
        while (t--)
        {
            memset (a,0,sizeof(a));
            scanf ("%d %d",&n,&m);
            getchar();
            while (m--)
            {
                scanf ("%c",&b);
                if (b == 'C')
                {
                    int x1,y1,x2,y2;
                    scanf ("%d %d %d %d",&x1,&y1,&x2,&y2);
                    getchar();
                    add(x1,y1,1);
    				add(x1,y2+1,1);
    				add(x2+1,y1,1);
    				add(x2+1,y2+1,1);
    
                }
    
                else if ( b == 'Q' )
                {
                    scanf ("%d %d",&x,&y);
                    getchar();
                    printf("%d\n", sum(x,y) % 2 );
                }
            }
            printf("\n");
        }
        return 0;
    }

  
  

