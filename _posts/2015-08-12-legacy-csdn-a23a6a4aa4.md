---
title: UVA 10608	Friends【并查集】
date: 2015-08-12 16:25:09
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-a23a6a4aa4
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47446725

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1549
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1549)

题意：给定n个人m种朋友关系，求最大朋友圈的人数。裸并查集

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    
    using namespace std;
    
    int f[30010];
    int c[30010];
    
    int find(int x)
    {
        if (f[x] == x) return x;
        else return f[x] = find(f[x]);
    }
    
    int main()
    {
        int t;
        int n,m;
        scanf("%d",&t);
        while(t--)
        {
            scanf("%d%d",&n,&m);
            for(int i=1;i<=n;i++)
            {
                f[i]=i;c[i]=1;
            }
            int a,b;
            int ans = -1;
            for(int i=1;i<=m;i++)
            {
                scanf("%d%d",&a,&b);
                int t1 = find(a);
                int t2 = find(b);
                if (t1 != t2)
                {
                    f[t2] = t1;
                    c[t1] += c[t2];
                    ans = max(ans,c[t1]);
                }
            }
            printf("%d\n",ans);
        }
        return 0;
    }
    

