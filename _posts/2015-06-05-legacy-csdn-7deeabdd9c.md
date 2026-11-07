---
title: LIGHTOJ 1029 – CIVIL AND EVIL ENGINEER 【PRIM】
date: 2015-06-05 23:22:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-7deeabdd9c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383157

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1029
](http://www.lightoj.com/volume_showproblem.php?problem=1029)

根据给出的条件，求最大和最小生成树的平均值。

代码：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    #include <string>
    #include <queue>
    
    using namespace std;
    
    const int inf = 100000000;
    int n, a, b, c;
    int maxp[110][110];
    int minp[110][110];
    
    int dis[110], v[110];
    int prim(int map[][110],int n)
    {
        memset(v, 0, sizeof(v));
        int min, sum = 0;
        for (int i = 0; i <= n; i++)
            dis[i] = map[0][i];
        v[0] = 1;
        for (int i = 1; i <= n; i++)
        {
            int k = 0;
            min = inf;
            for (int j = 0; j <= n; j++)
                if (!v[j] && min>dis[j])
                {
                    k = j;
                    min = dis[j];
                }
            sum += min;
            v[k] = 1;
            for (int j = 0; j <= n; j++)
                if (!v[j] && dis[j]>map[k][j])
                    dis[j] = map[k][j];
        }
        return sum;
    }
    
    int primmax(int map[][110], int n)
    {
        memset(v, 0, sizeof(v));
        int min, sum = 0;
        for (int i = 0; i <= n; i++)
            dis[i] = map[0][i];
        v[0] = 1;
        for (int i = 1; i <= n; i++)
        {
            int k = 0;
            min = -1;
            for (int j = 0; j <= n; j++)
                if (!v[j] && min<dis[j])
                {
                    k = j;
                    min = dis[j];
                }
            sum += min;
            v[k] = 1;
            for (int j = 0; j <= n; j++)
                if (!v[j] && dis[j]<map[k][j])
                    dis[j] = map[k][j];
        }
        return sum;
    }
    
    void init(int n)
    {
        for (int i = 0; i <= n; i++)
            for (int j = 0; j <= n; j++)
            {
                if (i == j)
                {
                    maxp[i][j] = maxp[j][i] = minp[i][j] = minp[j][i] = 0;
                }
                else
                {
                    maxp[i][j] = maxp[j][i] = -1;
                    minp[i][j] = minp[j][i] = inf;
                }
            }
    }
    
    int main()
    {
        int t;
        scanf("%d",&t);
        for (int k = 1; k <= t; k++)
        {
            scanf("%d", &n);
            init(n);
            while (scanf("%d%d%d", &a, &b, &c) != EOF)
            {
                if (a == 0 && b == 0 && c == 0)
                    break;
                if (minp[a][b] > c)
                {
                    minp[a][b] = minp[b][a] = c;
                }
                if (maxp[a][b] < c)
                {
                    maxp[a][b] = maxp[b][a] = c;
                }
            }
    
            int ans1 = primmax(maxp, n);
            int ans2 = prim(minp, n);
            int ans = ans1 + ans2;
            if (!(ans%2))
                printf("Case %d: %d\n", k, ans/2);
            else 
                printf("Case %d: %d%c%d\n", k, ans,'/',2);
        }
        return 0;
    }

