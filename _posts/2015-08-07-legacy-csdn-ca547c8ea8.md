---
title: poj 3281 Dining 【最大流】
date: 2015-08-07 16:04:13
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ca547c8ea8
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47340833

题目链接： [ http://poj.org/problem?id=3281 ](http://poj.org/problem?id=3281)

题意：  
给出牛n，饮料d还有食物f的数量，每头牛给出喜欢的饮料和食物，最后求出能够满足的牛的数量

解法：源点到食物建边， 由食物到牛建边， 牛到饮料建边 ，饮料到汇点建边 ，求最大流。牛要拆点控制流量为1

全部是有向的边,而且权值全部为1  
有2*n+f+d+2个顶点  
0表示源点,2*n+f+d+1表示汇点  
1到f为食物点，f+1到f+2*n为牛点，f+2*n+1到f+2*n+d为饮料点  
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
    #pragma comment (linker, "/STACK:102400000,102400000")
    
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
    
    int m, n, f, d, x, y;
    int a, b, c;
    
    int main()
    {
        while (scanf("%d%d%d", &n, &f, &d) != EOF)
        {
            init();
            int tmp = f + 2*n;
            int so = 0;//源点
            int to = f + n * 2 + d + 1;//汇点
            int tot = f + n * 2 + d + 2;
    
            for (int i = 1; i <= f; i++)//源点指向食物
                addedge(so, i, 1);
            for (int i = 1; i <= d; i++)//饮料指向汇点
                addedge(tmp + i , to, 1);
            for (int i = 1; i <= n; i++)//牛指向牛
                addedge(f + i, f + n + i, 1);
    
            for (int i = 1; i <= n;i++)
            {
                scanf("%d%d",&x,&y);
                while (x--)
                {
                    scanf("%d",&m);
                    addedge(m, f + i, 1);
                }
                while (y--)
                {
                    scanf("%d", &m);
                    addedge(f + n + i, 2*n + f + m, 1);
                }
            }
            int ans = sap(so,to, tot);
            printf("%d\n", ans);
        }
        return 0;
    }

