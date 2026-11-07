---
title: HDU 3790 最短路径问题 【求花费最少的最短路径】
date: 2015-06-05 23:50:32
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bd5d644f8c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383493

最短路径问题  
Time Limit: 2000/1000 MS (Java/Others) Memory Limit: 32768/32768 K
(Java/Others)  
Total Submission(s): 15413 Accepted Submission(s): 4658

Problem Description  
给你n个点，m条无向边，每条边都有长度d和花费p，给你起点s终点t，要求输出起点到终点的最短距离及其花费，如果最短距离有多条路线，则输出花费最少的。

Input  
输入n,m，点的编号是1~n,然后是m行，每行4个数 a,b,d,p，表示a和b之间有一条边，且其长度为d，花费为p。最后一行是两个数
s,t;起点s，终点。n和m为0时输入结束。  
(1

    
    
    #include <stdio.h>  
    #include <iostream>  
    #include <math.h>  
    #include <stdlib.h>  
    #include <ctype.h>  
    #include <algorithm>  
    #include <vector>  
    #include <string.h>  
    #include <queue>  
    #include <stack>  
    #include <set>  
    #include <map>  
    #include <sstream>  
    #include <time.h>  
    #include <malloc.h>  
    
    using namespace std;
    
    /*
    邻接矩阵的dij求最短路径
    源点beg 到其他点最短路径
    */
    const int MAXN = 1010;
    const int INF = 1e9;
    
    bool vis[MAXN];
    int pre[MAXN];
    
    //beg 起点
    void dijkstra(int cost[][MAXN], int lowcost[], int n, int beg,int val[][MAXN],int lowval[])
    {
        memset(vis,false,sizeof(vis));
        for (int i = 1; i <= n; i++)
        {
            lowcost[i] = cost[beg][i];
            lowval[i] = val[beg][i];
        }
        lowcost[beg] = 0;
        lowval[beg] = 0;
        vis[beg] = true;
        for (int j = 1; j < n; j++)
        {
            int k = -1;
            int MIN = INF;
            for (int i = 1; i <= n; i++)
                if (!vis[i] && lowcost[i] < MIN)
                {
                    MIN = lowcost[i];
                    k = i;
                }
            if (k == -1) break;
            vis[k] = true;
            for (int i = 1; i <= n; i++)
            {
                if (!vis[i] && lowcost[k] + cost[k][i] < lowcost[i])
                {
                    lowcost[i] = lowcost[k] + cost[k][i];
                    lowval[i] = lowval[k] + val[k][i];
                }
                else if (!vis[i] && lowcost[k] + cost[k][i] == lowcost[i])
                {
                    lowval[i] = min(lowval[i],lowval[k] + val[k][i]);
                }
            }
        }
    }
    
    int n, m;
    int a, b, c, d;
    int s, t;
    int p[MAXN][MAXN];
    int val[MAXN][MAXN];
    int lowcost[MAXN];
    int lowval[MAXN];
    
    int main()
    {
        while (scanf("%d%d", &n, &m) != EOF)
        {
            if (n == 0 && m == 0)
                break;
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                {
                    if (i != j)
                    {
                        p[i][j] = INF;
                        val[i][j] = INF;
                    }
                    else
                    {
                        p[i][j] = 0;
                        val[i][j] = 0;
                    }
                }
            for (int i = 0; i < m; i++)
            {
                scanf("%d%d%d%d", &a, &b, &c, &d);
                {
                    if (p[a][b] > c)
                    {
                        p[a][b] = p[b][a] = c;
                        val[a][b] = val[b][a] = d;
                    }
                    else if (p[a][b] == c && val[a][b] > d)
                        val[a][b] = val[b][a] = d;
                }
            }
            scanf("%d%d",&s,&t);
            dijkstra(p,lowcost,n,s,val,lowval);
            printf("%d %d\n", lowcost[t],lowval[t]);
        }
        return 0;
    }

