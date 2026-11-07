---
title: hdu 5889 Barricade【最小割】
date: 2016-09-18 09:49:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-a27dc5b56f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/52571760

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5889
](http://acm.hdu.edu.cn/showproblem.php?pid=5889)

解法：求最短路图上的最小割，先在图上源点和终点分别求一遍最短路。再在最短路图上求最小割。  
最小割==最大流定理

代码：

    
    
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <iostream>
    #include <string.h>
    
    using namespace std;
    
    const int MAXN = 10100;//点数的最大值
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
    
    int n, m;
    int diss[MAXN][MAXN];
    bool vis[MAXN];
    int d[MAXN];
    int d2[MAXN];
    
    void dijkstra(int s)
    {
        for (int i = 1;i <= n;i++)
        {
            vis[i] = 0;
            if (diss[s][i] == 1)
                d[i] = 1;
            else
                d[i] = INF;
        }
        d[s] = 0;
    
        while (1)
        {
            int min = INF, v = -1;
            for (int i = 1;i <= n;i++)
                if (!vis[i] && d[i]<min)
                {
                    v = i;
                    min = d[i];
                }
            if (v == -1)
                break;
            vis[v] = 1;
            for (int i = 1;i <= n;i++)
                if (diss[v][i] == 1)
                    if (!vis[i] && d[i] > d[v] + 1)
                        d[i] = 1 + d[v];
        }
    }
    
    void dijkstra2(int s)
    {
        for (int i = 1;i <= n;i++)
        {
            vis[i] = 0;
            if (diss[s][i] == 1)
                d2[i] = 1;
            else
                d2[i] = INF;
        }
        d2[s] = 0;
    
        while (1)
        {
            int min = INF, v = -1;
            for (int i = 1;i <= n;i++)
                if (!vis[i] && d2[i]<min)
                {
                    v = i;
                    min = d2[i];
                }
            if (v == -1)
                break;
            vis[v] = 1;
            for (int i = 1;i <= n;i++)
                if (diss[v][i] == 1)
                    if (!vis[i] && d2[i] > d2[v] + 1)
                        d2[i] = 1 + d2[v];
        }
    }
    
    struct Node
    {
        int u, v, w;
    }node[MAXM];
    
    int main()
    {
        int T;
        scanf("%d", &T);
        while (T--)
        {
            scanf("%d %d", &n, &m);
    
            int u, v, w;
    
            memset(diss, 0, sizeof(diss));
            for (int i = 0;i < m;i++)
            {
                scanf("%d%d%d", &u, &v, &w);
    
                node[i].u = u;
                node[i].v = v;
                node[i].w = w;
    
                diss[u][v] = diss[v][u] = 1;
            }
    
            memset(d, -1, sizeof(d));
            memset(d2, -1, sizeof(d2));
            dijkstra(1);
            dijkstra2(n);
    
            init();
            for (int i = 0;i < m;i++)
            {
                u = node[i].u;
                v = node[i].v;
                w = node[i].w;
    
                if (d[u] + d2[v] + 1 == d[n] && d[u] !=-1 && d2[v] != -1)
                    addedge(u, v, w, 0);
                if ( d[v] + d2[u] + 1 == d[n] && d[v] != -1 && d2[u] != -1)
                    addedge(v, u, w, 0);
            }
            int ans = sap(1, n, n);
            printf("%d\n", ans);
        }
        return 0;
    }

