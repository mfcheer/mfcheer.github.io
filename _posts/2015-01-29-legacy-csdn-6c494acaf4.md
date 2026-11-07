---
title: poj-3259 Wormholes
date: 2015-01-29 19:20:52
tags: ['acm', '算法', 'poj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-6c494acaf4
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43275051

题目链接： [ http://poj.org/problem?id=3259 ](http://poj.org/problem?id=3259)

求是否存在负权环。用 bellman 判断。

有一些农场，这些农场里面有一些田地，田地里面有一些虫洞，田地之间有路，虫洞可以让时间倒流。问这个农民能不能看到他自己，也就是说，有没有可能利用虫洞的时间倒流的性质，让这个人能在这个点出发前回去，这样他就是能看到他自己

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    #include <stdlib.h>
    #include <time.h>
    
    using namespace std;
    
    const int MAX = 5500;
    const int INF = 1000000;
    
    struct node
    {
        int from,to,cost;
    }edge[MAX];
    
    int E;
    
    void addedge(int from,int to,int cost)
    {
        edge[E].from = from;
        edge[E].to = to;
        edge[E++].cost = cost;
    }
    int t,n,m,w;
    int d[MAX];
    
    int short_path(int s)
    {
        for(int i=1;i<=n;i++) d[i] = INF;
        d[s] = 0;
        for(int i=1;i<=n;i++)
            for(int j=1;j<E;j++)
        {
            node e = edge[j];
            if (d[e.to] > d[e.from] + e.cost)
            {
                d[e.to] = d[e.from] + e.cost;
                if (i == n)
                    return 1;
            }
        }
        return 0;
    }
    
    int main ()
    {
        scanf("%d",&t);
        int a,b,c;
        while (t--)
        {
            E = 1;
            scanf("%d%d%d",&n,&m,&w);
            for(int i=1;i<=m;i++)
            {
                scanf("%d%d%d",&a,&b,&c);
                    addedge(a,b,c);
                    addedge(b,a,c);
            }
            for(int i=1;i<=w;i++)
            {
                scanf("%d%d%d",&a,&b,&c);
                    addedge(a,b,-c);
            }
            if (short_path(1) == 1)
                printf("YES\n");
            else
                printf("NO\n");
        }
        return 0;
    }
    

  
  

  

  

