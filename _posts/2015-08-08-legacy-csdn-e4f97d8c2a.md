---
title: poj 1087 A Plug for UNIX 【最大流】
date: 2015-08-08 00:35:43
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e4f97d8c2a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47349099

题目连接： [ http://poj.org/problem?id=1087 ](http://poj.org/problem?id=1087)

题意：  
n种插座 ，m个电器，f组（x，y）表示插座x可以替换插座y，问你最多能给几个电器充电。

解法：起点向插座建边，容量１，电器向汇点建边，容量１，插座向电器建边，容量１，可以替换的插座间建边，容量无穷大。然后套板子。。。求最大流。

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
    
    const int MAXN = 1010;//点数的最大值
    const int MAXM = 400010;//边数的最大值
    const int INF = 0x3f3f3f3f;
    struct Edge
    {
        int to, next, cap, flow;
    }edge[MAXM];//注意是MAXM
    int tol;
    int head[MAXN];
    int gap[MAXN], dep[MAXN], pre[MAXN], cur[MAXN];
    
    void init()
    {
        tol = 0;
        memset(head, -1, sizeof(head));
    }
    //加边，单向图三个参数，双向图四个参数
    void addedge(int u, int v, int w, int rw = 0)
    {
        edge[tol].to = v; edge[tol].cap = w; edge[tol].next = head[u];
        edge[tol].flow = 0; head[u] = tol++;
        edge[tol].to = u; edge[tol].cap = rw; edge[tol].next = head[v];
        edge[tol].flow = 0; head[v] = tol++;
    }
    
    //输入参数：起点、终点、点的总数
    //点的编号没有影响，只要输入点的总数
    
    int sap(int start, int end, int N)
    {
        memset(gap, 0, sizeof(gap));
        memset(dep, 0, sizeof(dep));
        memcpy(cur, head, sizeof(head));
        int u = start;
        pre[u] = -1;
        gap[0] = N;
        int ans = 0;
        while (dep[start] < N)
        {
            if (u == end)
            {
                int Min = INF;
                for (int i = pre[u]; i != -1; i = pre[edge[i ^ 1].to])
                    if (Min > edge[i].cap - edge[i].flow)
                        Min = edge[i].cap - edge[i].flow;
                for (int i = pre[u]; i != -1; i = pre[edge[i ^ 1].to])
                {
                    edge[i].flow += Min;
                    edge[i ^ 1].flow -= Min;
                }
                u = start;
                ans += Min;
                continue;
            }
            bool flag = false;
            int v;
            for (int i = cur[u]; i != -1; i = edge[i].next)
            {
                v = edge[i].to;
                if (edge[i].cap - edge[i].flow && dep[v] + 1 == dep[u])
                {
                    flag = true;
                    cur[u] = pre[v] = i;
                    break;
                }
            }
            if (flag)
            {
                u = v;
                continue;
            }
            int Min = N;
            for (int i = head[u]; i != -1; i = edge[i].next)
                if (edge[i].cap - edge[i].flow && dep[edge[i].to] < Min)
                {
                    Min = dep[edge[i].to];
                    cur[u] = i;
                }
            gap[dep[u]]--;
            if (!gap[dep[u]])return ans;
            dep[u] = Min + 1;
            gap[dep[u]]++;
            if (u != start) u = edge[pre[u] ^ 1].to;
        }
        return ans;
    }
    
    int m, n, f;
    map<string, int> Hash;
    string x, y;
    
    int main()
    {
        while (cin >> n)
        {
            init();
            Hash.clear();
    
            int num1 = 2;
    
            int from = 0;
            int end = 1;
    
            for (int i = 1; i <= n; i++)
            {
                cin >> x;
                Hash[x] = num1;
                addedge(0, num1, 1);
                num1++;
            }
            cin >> m;
            for (int i = 1; i <= m; i++)
            {
                cin >> x >> y;
                if (Hash[x] == 0) Hash[x] = num1++;
                if (Hash[y] == 0) Hash[y] = num1++;
    
                addedge(Hash[x], end, 1);
                addedge(Hash[y], Hash[x], 1);
            }
    
            cin >> f;
            for (int i = 1; i <= f; i++)
            {
                cin >> x >> y;
                if (Hash[x] == 0) Hash[x] = num1++;
                if (Hash[y] == 0) Hash[y] = num1++;
                addedge(Hash[y], Hash[x], 10000000);
            }
    
            int ans = sap(from, end, num1);
            printf("%d\n", m - ans);
        }
        return 0;
    }

