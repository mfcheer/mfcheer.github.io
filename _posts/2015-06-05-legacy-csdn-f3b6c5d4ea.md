---
title: 最大流SAP模板（邻接矩阵）
date: 2015-06-05 23:28:45
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f3b6c5d4ea
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383251

    
    
    #include <stdio.h>
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
    #include <string>  
    #include <sstream>  
    #include <malloc.h>
    
    using namespace std;
    //结点编号0开始
    const int MAXN = 1100;
    int maze[MAXN][MAXN];
    int gap[MAXN], dis[MAXN], pre[MAXN], cur[MAXN];
    int sap(int start,int end,int nodenum)
    {
        memset(cur, 0, sizeof(cur));
        memset(dis, 0, sizeof(dis));
        memset(gap, 0, sizeof(gap));
        int u = pre[start] = start, maxflow, aug = -1;
        gap[0] = nodenum;
        while (dis[start] < nodenum)
        {
            loop:
            for (int v = cur[u]; v < nodenum; v++)
                if (maze[u][v] && dis[u] == dis[v] + 1)
                {
                    if (aug == -1 || aug > maze[u][v])
                        aug = maze[u][v];
                    pre[v] = u;
                    u = cur[u] = v;
                    if (v == end)
                    {
                        maxflow += aug;
                        for (u = pre[u]; v != start; v = u, u = pre[u])
                        {
                            maze[u][v] -= aug;
                            maze[v][u] += aug;
                        }
                        aug = -1;
                    }
                goto loop;
                }
            int mindis = nodenum - 1;
            for (int v = 0; v < nodenum;v++)
                if (maze[u][v] && mindis > dis[v])
                {
                    cur[u] = v;
                    mindis = dis[v];
                }
            if ((--gap[dis[u]]) == 0) break;
            gap[dis[u] = mindis + 1]++;
            u = pre[u];
        }
        return maxflow;
    }
    
    int main()
    {
        return 0;
    }
    

