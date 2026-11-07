---
title: hdu-1162
date: 2014-11-24 21:08:08
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-14ec7b09ce
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41452773

最小生成树

  

    
    
    //prim 求最小生成树
    #include <stdio.h>
    #include <math.h>
    #include <string.h>
    #define MAXN 105
    #define UPPERDIS 999999
    double lowcost[MAXN],vist[MAXN];
    double cost[MAXN][MAXN];
    int n;
    double prim(int v0)
    {
        int i, j, minone;
    	double mindis;
        double ans = 0;/*用来记录最小生成树的总长度*/
    	memset(vist, 0, sizeof(vist));
        /*各点距离初始化*/
        for(i = 0;i < n;i++)
        {
            lowcost[i] = cost[v0][i];
        }
    	vist[v0] = 1;
        for(i = 0;i < n-1;i++)
        {
            mindis = UPPERDIS;
            for(j = 0;j < n;j++)
              if(!vist[j] && mindis > lowcost[j])
              {
                  mindis = lowcost[j];
                  minone = j;
              }
            /*将找到的最近点加入最小生成树*/
            ans += mindis;
            vist[minone] = 1;
            /*修正其他点到最小生成树的距离*/
            for(j = 0;j < n;j++)
              if(!vist[j] && cost[minone][j] < lowcost[j])
              {
                  lowcost[j] = cost[minone][j];
              }
        }
        return ans;
    }
    struct point {
    	double x, y;
    }p[MAXN];
    double dis(point p1, point p2)
    {
    	return sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    int main()
    {
    	int i, j;
    	while (~scanf("%d", &n))
    	{
    		for(i = 0; i < n; i++)
    			scanf("%lf%lf", &p[i].x, &p[i].y);
    		for(i = 0; i < n; i++)
    			for(j = i; j < n; j++)
    				if(j == i)
    					cost[i][i] = 1000000.0;
    				else
    					cost[i][j] = cost[j][i] = dis(p[i], p[j]);
    		printf("%.2lf\n",prim(0));
    	}
    }

  
  

  

