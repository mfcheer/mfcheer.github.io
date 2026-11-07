---
title: LightOJ 1074 – Extended Traffic 【SPFA判负环】
date: 2015-06-05 18:23:29
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2cbb736ccb
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46380581

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1074
](http://www.lightoj.com/volume_showproblem.php?problem=1074)

给你一个有向图，求原点1到给定询问点的最短距离是多少，由于可能存在负环，不能用dij,如果点在负环中，则无解，dfs判环。

代码：

    
    
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <string>
    #include <set>
    #include <queue>
    #include <stack>
    #include <vector>
    #include <malloc.h>
    
    using namespace std;
    
    int t;
    int n,m,a,b;
    int p[21000];
    
    const int MAXN = 41000;
    const int INF = 0x3f3f3f3f;
    
    struct Edge
    {
        int v;
        int cost;
        Edge(int _v=0,int _cost=0)
        {
            v = _v;
            cost = _cost;
        }
    };
    vector<Edge> E[MAXN];
    
    void addedge(int u,int v,int cost)
    {
        E[u].push_back(Edge(v,cost));
    }
    
    bool vis[MAXN];
    int cnt[MAXN];
    int dist[MAXN];
    
    ///////判断负环
    int cir[MAXN];
    void dfs(int u)
    {
        cir[u]=true;
        for(int i=0;i<E[u].size();i++)
        {
            if (!cir[E[u][i].v])
                dfs(E[u][i].v);
        }
    }
    ////////////////
    void SPFA(int start,int n)
    {
        memset(vis,false,sizeof(vis));
        for(int i=1;i<=n;i++) dist[i]= INF;
        vis[start] = true;
        dist[start] = 0;
        queue<int> que;
        while (!que.empty()) que.pop();
        que.push(start);
        memset(cnt,0,sizeof(cnt));
        cnt[start] =1;
    
        memset(cir,false,sizeof(cir));
        while (!que.empty())
        {
            int u = que.front();que.pop();
            vis[u]=false;
            for(int i=0;i<E[u].size();i++)
            {
                int v = E[u][i].v;
                if (cir[v]) continue;
                if (dist[v]>dist[u] + E[u][i].cost)
                {
                    dist[v]=dist[u] + E[u][i].cost;
                    if (!vis[v])
                    {
                        vis[v] = true;
                        que.push(v);
                        cnt[v]++;
                        if (cnt[v] > n)
                            dfs(v);
                    }
                }
            }
        }
    }
    
    int main()
    {
        scanf("%d",&t);
        for(int cases=1;cases<=t;cases++)
        {
            scanf("%d",&n);
            for(int i=1;i<=n;i++)
                {
                    scanf("%d",&p[i]);
                    E[i].clear();
                }
            scanf("%d",&m);
            while (m--)
            {
                scanf("%d%d",&a,&b);
                addedge(a,b,(p[b]-p[a])*(p[b]-p[a])*(p[b]-p[a]));
            }
            SPFA(1,n);
            printf("Case %d:\n",cases);
            scanf("%d",&m);
            while (m--)
            {
                scanf("%d",&b);
                if(cir[b] || dist[b] < 3 || dist[b] == INF)
                    printf("?\n");
                else
                    printf("%d\n",dist[b]);
            }
        }
        return 0;
    }

