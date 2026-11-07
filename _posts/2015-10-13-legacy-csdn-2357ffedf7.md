---
title: poj 2987 Firing【最大闭合子图】
date: 2015-10-13 20:27:18
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2357ffedf7
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49103561

题目链接： [ http://poj.org/problem?id=2987 ](http://poj.org/problem?id=2987)

最大闭合子图资料： [ http://blog.sina.com.cn/s/blog_48f85e1d0100mxem.html
](http://blog.sina.com.cn/s/blog_48f85e1d0100mxem.html)

最大闭合子图权值为 ： 所有点值大于0之和 - 最大流  
闭合子图点为s能到达的点。

代码：

    
    
    #include <iostream>
    #include <algorithm>
    #include <set>
    #include <map>
    #include <string.h>
    #include <queue>
    #include <sstream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    #include <string>
    
    using namespace std;
    
    const long long MAXN = 50000;//点数的最大值
    const long long MAXM = 610000;//边数的最大值
    const long long INF = 0x3f3f3f3f;
    
    struct Edge
    {
        long long to, next;
        long long cap, flow;
    }edge[MAXM];//注意是MAXM
    
    long long tol;
    long long head[MAXN];
    long long gap[MAXN], dep[MAXN], pre[MAXN], cur[MAXN];
    
    void init()
    {
        tol = 0;
        memset(head, -1, sizeof(head));
    }
    //加边，单向图三个参数，双向图四个参数
    void addedge(long long u, long long v, long long w, long long rw = 0)
    {
        edge[tol].to = v; edge[tol].cap = w; edge[tol].next = head[u];
        edge[tol].flow = 0; head[u] = tol++;
        edge[tol].to = u; edge[tol].cap = rw; edge[tol].next = head[v];
        edge[tol].flow = 0; head[v] = tol++;
    }
    //输入参数：起点、终点、点的总数
    //点的编号没有影响，只要输入点的总数
    
    int Q[MAXN];
    
    void BFS(long long start,long long end)
    {
        memset(dep, -1, sizeof(dep));
        memset(gap, 0, sizeof(gap));
        gap[0] = 1;
        long long front = 0, rear = 0;
        dep[end] = 0;
        Q[rear++] = end;
        while (front != rear)
        {
            long long u = Q[front++];
            for (int i = head[u];i != -1;i = edge[i].next)
            {
                int v = edge[i].to;
                if (dep[v] != -1) continue;
                Q[rear++] = v;
                dep[v] = dep[u] + 1;
                gap[dep[v]]++;
            }
        }
    }
    long long S[MAXN];
    
    long long sap(long long start, long long end, long long N)
    {
        BFS(start, end);
        memcpy(cur, head, sizeof(head));
        long long u = start;
        long long top = 0;
        long long  ans = 0;
        while (dep[start] < N)
        {
            if (u == end)
            {
                long long Min = INF;
                int inser;
                for (int i = 0; i < top; i++)
                    if (Min > edge[S[i]].cap - edge[S[i]].flow)
                    {
                        Min = edge[S[i]].cap - edge[S[i]].flow;
                        inser = i;
                    }
                for (int i = 0; i < top; i++)
                {
                    edge[S[i]].flow += Min;
                    edge[S[i] ^ 1].flow -= Min;
                }
                ans += Min;
                top = inser;
                u = edge[S[top] ^ 1].to;
                continue;
            }
            bool flag = false;
            long long v;
            for (long long i = cur[u]; i != -1; i = edge[i].next)
            {
                v = edge[i].to;
                if (edge[i].cap - edge[i].flow && dep[v] + 1 == dep[u])
                {
                    flag = true;
                    cur[u]  = i;
                    break;
                }
            }
            if (flag)
            {
                S[top++] = cur[u];
                u = v;
                continue;
            }
            long long Min = N;
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
            if (u != start) u = edge[S[--top]^1].to;
        }
        return ans;
    }
    
    long long n,m;
    long long a[100010];
    long long num;
    long long vis[10010];
    
    void dfs(int x)
    {
        vis[x]=1;
        if (x!=0)
           num++;
        for(int i=head[x];i!=-1;i=edge[i].next)
        {
            if (edge[i].cap-edge[i].flow>0 && !vis[edge[i].to])
                dfs(edge[i].to);
        }
    }
    
    int main()
    {
        while (scanf("%lld%lld",&n,&m)!=EOF)
        {
            init();
            long long sum = 0;
            num=0;
            memset(vis,0,sizeof(vis));
    
            for(long long i=1;i<=n;i++)
            {
                scanf("%lld",&a[i]);
                if (a[i] >0)
                {
                    addedge(0,i,a[i]);
                    sum+=a[i];
                }
                else
                {
                    addedge(i,n+1,-a[i]);
                }
            }
            long long a,b;
            while (m--)
            {
                scanf("%lld%lld",&a,&b);
                addedge(a,b,1e8);
            }
    
            long long ans = sap(0,n+1,n+2);
            dfs(0);
            //for(int i=0;i<num;i++)
            //   printf("%d ",path[i]);
            printf("%lld %lld\n",num,sum - ans);
        }
        return 0;
    }
    

