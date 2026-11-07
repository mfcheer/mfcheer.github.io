---
title: LightOJ 1210 - Efficient Traffic System【强连通图】
date: 2015-09-15 01:31:48
tags: ['lightoj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ac05ddc8e9
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48457237

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1210
](http://www.lightoj.com/volume_showproblem.php?problem=1210)

题意：  
加多少条边，使得整个图变得强连通。  
使用Tarjan进行缩点，得到一个SCC图、  
这个图有多少个入度为0的，多少个出度为0的。  
假设有n个入度为0，m个出度为0  
那么答案是max(n,m)

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <math.h>
    #include <stdlib.h>
    #include <ctype.h>
    #include <algorithm>
    #include <vector>
    #include <string.h>
    #include <string>
    #include <queue>
    #include <stack>
    #include <set>
    #include <map>
    #include <sstream>
    #include <time.h>
    
    using namespace std;
    
    const int MAXN = 200100;
    const int MAXM = 500100;
    
    struct Edge
    {
        int to, next;
    }edge[MAXM];
    
    int head[MAXM], tot;
    int Low[MAXN], Dfn[MAXN], Stack[MAXN], Belong[MAXN];//Belong的值为 1 ~ scc
    int Index, top;
    int scc;//强连通个数
    bool Instack[MAXN];
    int num[MAXN];//各个强连通包含的点的个数
    
    void addedge(int u, int v)
    {
        edge[tot].to = v;
        edge[tot].next = head[u];
        head[u] = tot++;
    }
    
    void Tarjan(int u)
    {
        int v;
        Low[u] = Dfn[u] = ++Index;
        Stack[top++] = u;
        Instack[u] = true;
        for (int i = head[u]; i != -1; i = edge[i].next)
        {
            v = edge[i].to;
            if (!Dfn[v])
            {
                Tarjan(v);
                if (Low[u] > Low[v])
                    Low[u] = Low[v];
            }
            else if (Instack[v] && Low[u] > Dfn[v])
                Low[u] = Dfn[v];
        }
        if (Low[u] == Dfn[u])
        {
            scc++;
            do
            {
                v = Stack[--top];
                Instack[v] = false;
                Belong[v] = scc;
                num[scc]++;
            } while (v != u);
        }
    }
    
    int in[MAXN], out[MAXN];
    int cases = 1;
    
    void solve(int N)
    {
        memset(Dfn, 0, sizeof(Dfn));
        memset(Instack, false, sizeof(Instack));
        memset(num, 0, sizeof(num));
        Index = scc = top = 0;
        for (int i = 1; i <= N; i++)
        {
            if (!Dfn[i])
                Tarjan(i);
        }
        printf("Case %d: ",cases++);
    
        if (scc == 1)
        {
            printf("0\n");
            return;
        }
        for (int i = 1; i <= scc; i++)
            in[i] = out[i] = 0;
        for (int u = 1; u <= N; u++)
        {
            for (int i = head[u]; i != -1; i = edge[i].next)
            {
                int v = edge[i].to;
                if (Belong[u] != Belong[v])
                {
                    in[Belong[v]]++;
                    out[Belong[u]]++;
                }
            }
        }
        int ans1 = 0, ans2 = 0;
        for (int i = 1; i <= scc; i++)
        {
            if (in[i] == 0) ans1++;
            if (out[i] == 0) ans2++;
        }
        printf("%d\n", max(ans1, ans2));
    }
    
    void init()
    {
        tot = 0;
        memset(head, -1, sizeof(head));
    }
    
    int main()
    {
        int n, t, m;
        int u, v;
        scanf("%d", &t);
        while (t--)
        {
            init();
            scanf("%d%d", &n, &m);
            for (int i = 1; i <= m; i++)
            {
                scanf("%d%d", &u, &v);
                {
                    addedge(u, v);
                }
            }
            solve(n);
        }
        return 0;
    }

