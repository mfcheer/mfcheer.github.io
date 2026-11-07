---
title: 图论——最小生成树
date: 2015-01-25 13:34:49
tags: ['acm', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-661ead1f2a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43114029

通过：poj-1287

    
    
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
    
    int map[100][100], dis[100], v[100];
    
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
    	while (scanf("%d %d", &n, &m) != EOF )
    	{
    		if (n == 0)
    			break;
    		for (int i = 1; i <= n; i++)
    			for (int j = 1; j <= n; j++)
    				map[i][j] = INF;
    
    		while (m--)
    		{
    			scanf("%d%d%d",&a,&b,&c);
    			if (map[a][b] >= c)
    			{
    				map[a][b] = map[b][a] = c;
    			}
    		}
    		printf("%d\n",prim(n));
    	}
    	return 0;
    }

  
  

