---
title: uva 1395 Silm Span 【MST-Kruskal】
date: 2015-03-29 21:20:07
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e276d29fbf
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44731415

题目链接： [ 点击链接 ](http://uva.onlinejudge.org/external/13/1395.pdf)  
题意:求生成树，使得最大边与最小边差最小，输出最小值；  
枚举边更新答案。

    
    
    #include <stdio.h>  
    #include <iostream>  
    #include <string.h>  
    #include <algorithm>  
    #include <math.h>  
    #include <stack>  
    #include <queue>  
    
    using namespace std;
    
    const int MAXN = 110;//点
    const int MAXM = 510;//边
    
    int f[MAXM];//并查集使用
    
    struct Edge
    {
        int u, v, w;
    }edge[MAXM];
    
    int tol;//边数 初始化 0
    
    void addedge(int u, int v, int w)
    {
        edge[tol].u = u;
        edge[tol].v = v;
        edge[tol++].w = w;
    }
    
    bool cmp(Edge a, Edge b)
    {
        return a.w < b.w;
    }
    
    int find(int x)
    {
        if (f[x] == -1)
            return x;
        else
            return f[x] = find(f[x]);
    }
    
    int kruskal(int n)
    {
        sort(edge, edge + tol, cmp);
        int cnt ;
        int ans = 1e9, ok = 0;
        int MAX;
        for (int j = 0; j < tol; j++)
        {
            MAX = -1;
            memset(f, -1, sizeof(f));
            cnt = 0;
            for (int i = j; i < tol; i++)
            {
                int u = edge[i].u;
                int v = edge[i].v;
                int w = edge[i].w;
                MAX = max(MAX, w);
                int t1 = find(u);
                int t2 = find(v);
                if (t1 != t2)
                {
                    f[t1] = t2;
                    cnt++;
                }
                if (cnt == n - 1)
                    break;
            }
            if (cnt == n - 1)
            {
                ok = 1;
                ans = min(ans, MAX - edge[j].w);
            }
        }
        if (ok)
            return ans;
        else
            return -1;
    }
    
    int n, m;
    int u, v, w;
    
    int main()
    {
        while (scanf("%d%d", &n, &m) != EOF)
        {
            if (n == 0 && m == 0)
                break;
            tol = 0;
            for (int i = 0; i < m; i++)
            {
                scanf("%d%d%d", &u, &v, &w);
                addedge(u, v, w);
            }
            int ans = kruskal(n);
            printf("%d\n", ans);
        }
        return 0;
    }

