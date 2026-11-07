---
title: UVA 10269	Adventure of Super Mario 【最短路 + dp】
date: 2015-08-12 20:04:51
tags: ['dp', 'uva']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-7d39f59def
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47449929

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1210
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1210)

题意：  
给你a（1~a）个村子 b(a+1 ~ b)个城堡 ,m条路, 问你回家（a+b 到
1）花费的最少能量.你有魔法鞋子，每次最多可以走L长的距离且不花费能量，最多使用K次，魔法鞋子不能穿越城堡。

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    
    using namespace std;
    
    const int INF = 100000000;
    
    int is[110][110];
    int p[110][110];
    int dp[110][20];// dp[i][j]  使用了 j 次魔法鞋到 i 点的最短距离
    int a, b, l, m, k;
    
    void dijkstra()
    {
        memset(dp,0,sizeof(dp));
        for (int i = 1;i <= a + b;i++)
            dp[i][0] = p[1][i];
    
        for (int i = 2;i <= a + b;i++)
        {
            for (int kk = 1;kk <= k;kk++)
            {
                int MIN = INF;
                for (int j = 1;j < i;j++)
                {
                    if (is[i][j])
                        MIN = min(MIN,dp[j][kk-1]);
                    MIN = min(MIN,dp[j][kk] + p[i][j]);
                }
                dp[i][kk] = MIN;
            }
        }
    }
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while (t--)
        {
            scanf("%d%d%d%d%d", &a, &b, &m, &l, &k);
            int u, v, w;
            memset(is, 0, sizeof(is));
            for (int i = 1;i <= a + b;i++)
                for (int j = 1;j <= a + b;j++)
                {
                    if (i == j) p[i][j] = 0;
                    else p[i][j] = INF;
                }
            while (m--)
            {
                scanf("%d%d%d",&u,&v,&w);
                p[u][v] = p[v][u] = w;
                if (w <= l) is[u][v] = is[v][u] = 1;
            }
            for (int kk = 1;kk <= a + b;kk++)
                for (int i = 1;i <= a + b;i++)
                    for (int j = 1;j <= a + b;j++)
                    {
                        if (p[i][kk] + p[kk][j] < p[i][j])
                        {
                            p[i][j] = p[i][kk] + p[kk][j];
                            if (p[i][j] <= l && kk <= a) is[i][j] = is[j][i] = 1;
                        }
                    }
            dijkstra();
            printf("%d\n",dp[a+b][k]);
        }
        return 0;
    }

