---
title: BZOJ [BeiJing2006]狼抓兔子 【网络流】
date: 2015-10-07 23:46:34
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-23ad1aca73
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48957759

题目链接： [ http://www.lydsy.com/JudgeOnline/problem.php?id=1001
](http://www.lydsy.com/JudgeOnline/problem.php?id=1001)

就是求最小割 阻止两个兔子窝间联通

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
    
    const int MAXN = 1010000;//点数的最大值
    const int MAXM = 6001000;//边数的最大值
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
    
    int Q[MAXN];
    
    void BFS(int start,int end)
    {
        memset(dep, -1, sizeof(dep));
        memset(gap, 0, sizeof(gap));
        gap[0] = 1;
        int front = 0, rear = 0;
        dep[end] = 0;
        Q[rear++] = end;
        while (front != rear)
        {
            int u = Q[front++];
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
    int S[MAXN];
    int sap(int start, int end, int N)
    {
        BFS(start, end);
        memcpy(cur, head, sizeof(head));
        int u = start;
        int top = 0;
        int ans = 0;
        while (dep[start] < N)
        {
            if (u == end)
            {
                int Min = INF;
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
            int v;
            for (int i = cur[u]; i != -1; i = edge[i].next)
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
            if (u != start) u = edge[S[--top]^1].to;
        }
        return ans;
    }
    
    int n, m;
    
    int main()
    {
        while(scanf("%d%d",&n,&m)!=EOF)
        {
            init();
            int w;
            int tmp = 1;
    
            for(int i=1;i<=n;i++)
            {
                for(int j=1;j<m;j++)
                {
                    scanf("%d",&w);
                    addedge( (i-1)*m+j,(i-1)*m+j+1,w,w);
                }
            }
    
            for(int i=1;i<n;i++)
            {
                for(int j=1;j<=m;j++)
                {
                    scanf("%d",&w);
                    addedge((i-1)*m+j,(i-1)*m+j+m,w,w);
                }
            }
    
            for(int i=1;i<n;i++)
            {
                for(int j=1;j<m;j++)
                {
                    scanf("%d",&w);
                    addedge((i-1)*m + j,(i-1)*m + j + m + 1,w,w);
                }
            }
            int ans = sap(1,n*m,n*m);
            printf("%d\n",ans);
        }
        return 0;
    }
    

