---
title: UVA 10986	Sending email 【dijkstra + 堆优化】
date: 2015-08-13 23:47:11
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b876a81aff
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47626783

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1927
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1927)

题意：n个点m条边，求s到e的最短距离

代码：

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    #include<string.h>
    
    using namespace std;
    
    
    const int INF = 0x3f3f3f3f;
    const int MAXN = 1000010;
    
    struct qnode
    {
        int v;
        int c;
        qnode(int _v = 0, int _c = 0) :v(_v), c(_c){}
        bool operator < (const qnode &r) const
        {
            return c > r.c;
        }
    };
    
    struct Edge
    {
        int v, cost;
        Edge(int _v = 0, int _cost = 0) :v(_v), cost(_cost) {}
    };
    
    vector<Edge> E[MAXN];
    bool vis[MAXN];
    int dist[MAXN];
    
    void dijkstra(int n,int start,int ed)
    {
        memset(vis, false, sizeof(vis));
        for (int i = 0; i < n; i++)
            dist[i] = INF;
        priority_queue<qnode> que;
        while (!que.empty()) que.pop();
        dist[start] = 0;
        que.push(qnode(start, 0));
        qnode tmp;
        while (!que.empty())
        {
            tmp = que.top(); que.pop();
            int u = tmp.v;
            if (vis[ed]) continue;
            if (vis[u]) continue;
            vis[u] = true;
            for (int i = 0; i < E[u].size(); i++)
            {
                int v = E[u][i].v;
                int cost = E[u][i].cost;
                if (!vis[v] && dist[v] > dist[u] + cost)
                {
                    dist[v] = dist[u] + cost;
                    que.push(qnode(v, dist[v]));
                }
            }
        }
    }
    
    void addedge(int u, int v, int w)
    {
        E[u].push_back(Edge(v, w));
    }
    
    int n, m, s, d;
    int a, b, c;
    
    int main()
    {
        int t;
        int cases = 1;
        scanf("%d",&t);
        while (t--)
        {
            scanf("%d%d%d%d", &n, &m, &s, &d);
            for (int i = 0; i <= n; i++) E[i].clear();
            while (m--)
            {
                scanf("%d%d%d", &a, &b, &c);
                addedge(a, b, c);
                addedge(b, a, c);
            }
            dijkstra(n, s, d);
            if (dist[d] == INF)
                printf("Case #%d: unreachable\n", cases++);
            else
                printf("Case #%d: %d\n", cases++, dist[d]);
    
        }
        return 0;
    }

