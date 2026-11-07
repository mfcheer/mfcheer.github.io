---
title: 51nod 1212 无向图最小生成树
date: 2015-10-03 01:52:24
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c3c3ceb2ed
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48871905

####  题目链接： [
http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1212
](http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1212)

水题。

代码：

    
    
    #include <stdio.h>  
    #include <iostream>  
    #include <string.h>  
    #include <algorithm>  
    #include <math.h>  
    #include <stack>  
    #include <queue>  
    
    using namespace std;
    #define INF 10000000  
    
    int n, m;
    int a, b, c;
    
    int map[1010][1010], dis[1010], v[1010];
    
    int prim(int n)
    {
        int i, j, k, min, sum = 0;
        for (i = 1; i <= n; i++)
            dis[i] = map[1][i];
    
        memset(v, 0, sizeof(v));
        v[1] = 1;
        dis[1] = 0;
    
        for (i = 2; i <= n; i++)
        {
            k = 1;
            min = INF;
            for (j = 1; j <= n; j++)
                if (!v[j] && min>dis[j])
                {
                    k = j;
                    min = dis[j];
                }
            sum += min;
            v[k] = 1;
            for (j = 1; j <= n; j++)
                if (!v[j] && dis[j]>map[k][j])
                    dis[j] = map[k][j];
        }
        return sum;
    }
    
    int main()
    {
        while (scanf("%d %d", &n, &m) != EOF)
        {
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                    map[i][j] = INF;
    
            while (m--)
            {
                scanf("%d%d%d", &a, &b, &c);
                if (map[a][b] >= c)
                {
                    map[a][b] = map[b][a] = c;
                }
            }
            printf("%d\n", prim(n));
        }
        return 0;
    }
    

