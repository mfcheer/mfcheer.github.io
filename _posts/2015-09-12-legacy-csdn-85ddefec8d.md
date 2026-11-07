---
title: LA 3989 - Ladies' Choice【稳定婚姻问题】
date: 2015-09-12 13:20:02
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-85ddefec8d
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48393453

####  稳定婚姻学习资料：

[ http://www.matrix67.com/blog/?s=%E7%A8%B3%E5%AE%9A%E5%A9%9A%E5%A7%BB
](http://www.matrix67.com/blog/?s=%E7%A8%B3%E5%AE%9A%E5%A9%9A%E5%A7%BB)  
[ http://www.programmer.com.cn/12001/ ](http://www.programmer.com.cn/12001/)

####  题目链接： [
https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1990
](https://icpcarchive.ecs.baylor.edu/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1990)

题意：稳定婚姻

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <math.h>
    #include <stdlib.h>  
    #include <ctype.h>  
    #include <algorithm>  
    #include <vector>  
    #include <string.h>  
    #include <queue>  
    #include <stack>  
    #include <set>  
    #include <map>  
    #include <string>  
    #include <sstream>  
    #include <malloc.h>
    
    using namespace std;
    
    const int MAXN = 1010;
    int pref[MAXN][MAXN], order[MAXN][MAXN], Next[MAXN];
    int future_husband[MAXN], future_wife[MAXN];
    queue<int> q;
    
    void engage(int man, int woman)
    {
        int m = future_husband[woman];
        if (m)
        {
            future_wife[m] = 0;
            q.push(m);
        }
        future_wife[man] = woman;
        future_husband[woman] = man;
    }
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while (t--)
        {
            while (!q.empty()) q.pop();
            int  n;
            scanf("%d", &n);
            for (int i = 1;i <= n;i++)
            {
                for (int j = 1;j <= n;j++)
                    scanf("%d",&pref[i][j]);
                Next[i] = 1;
                future_wife[i] = 0;
                q.push(i);
            }
            for (int i = 1;i <= n;i++)
            {
                for (int j = 1;j <= n;j++)
                {
                    int x;
                    scanf("%d", &x);
                    order[i][x] = j;
                }
                future_husband[i] = 0;
            }
            while (!q.empty())
            {
                int man = q.front();q.pop();
                int woman = pref[man][Next[man]++];
                if (!future_husband[woman])
                    engage(man, woman);
                else if (order[woman][man] < order[woman][future_husband[woman]])
                    engage(man, woman);
                else q.push(man);
            }
            for (int i = 1;i <= n;i++)
                printf("%d\n", future_wife[i]);
            if (t) printf("\n");
        }
        return 0;
    }

