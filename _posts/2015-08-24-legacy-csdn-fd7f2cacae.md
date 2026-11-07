---
title: poj 2686 Traveling by Stagecoach【状态压缩】
date: 2015-08-24 21:03:44
tags: ['poj', '压缩', 'dp']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-fd7f2cacae
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47957763

题目链接： [ http://poj.org/problem?id=2686 ](http://poj.org/problem?id=2686)

题意：  
一个人从某个城市要到另一个城市。然后有n个马车票，相邻的两个城市走的话要消耗掉一个马车票。花费的时间是马车票上有个速率值，用边/速率就是花的时间。  
问最后这个人花费的最短时间是多少

dp[i][j] 表示集合 i 车票 到 j 的最优解

代码：

    
    
    #include <stdio.h>  
    #include <ctime>  
    #include <math.h>  
    #include <limits.h>  
    #include <complex>  
    #include <string>  
    #include <functional>  
    #include <iterator>  
    #include <algorithm>  
    #include <vector>  
    #include <stack>  
    #include <queue>  
    #include <set>  
    #include <map>  
    #include <list>  
    #include <bitset>  
    #include <sstream>  
    #include <iomanip>  
    #include <fstream>  
    #include <iostream>  
    #include <ctime>  
    #include <cmath>  
    #include <cstring>  
    #include <cstdio>  
    #include <time.h>  
    #include <ctype.h>  
    #include <string.h>  
    #include <assert.h>  
    
    using namespace std;
    
    const int inf = 1e9;
    int n, m, p, a, b;
    int t[100];
    int g[50][50];
    double dp[(1<<15)][50];
    
    int main()
    {
        while (~scanf("%d%d%d%d%d", &n, &m, &p, &a, &b))
        {
            if (!n && !m && !p && !a && !b) break;
            for (int i = 0;i < n;i++) scanf("%d",&t[i]);
            for (int i = 1;i <= m;i++)
                for (int j = 1;j <= m;j++)
                {
                    if (i == j) g[i][j] = 0;
                    else g[i][j] = inf;
                }
            int u, v, w;
            while (p--)
            {
                scanf("%d%d%d",&u,&v,&w);
                g[u][v] = min(g[u][v], w);
                g[v][u] = min(g[v][u], w);
            }
    
            for (int i = 0;i < (1 << n);i++)
                for (int j = 0;j <= m;j++)
                    dp[i][j] = inf;
    
            dp[0][a] = 0;
            double ans = inf;
    
            for (int i = 0;i < (1 << n);i++)
            {
                for (int u = 1;u <= m;u++)
                    for (int j = 0;j < n;j++)
                        if (!(i & (1 << j)))
                        {
                            for (int v = 1;v <= m;v++)
                            {
                                if (g[u][v] != inf)
                                    dp[i | (1 << j)][v] = min(dp[i | (1 << j)][v], dp[i][u] + (double)g[u][v] / t[j]);
                            }
                        }
                ans = min(ans,dp[i][b]);
            }
            if (ans == inf) puts("Impossible");
            else printf("%.3lf\n",ans);
    
        }
        return 0;
    }

