---
title: poj-2253 Frogger
date: 2015-01-28 14:52:18
tags: ['acm', '算法', 'poj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c0da32fcd5
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43230537

题目链接： [ http://poj.org/problem?id=2253 ](http://poj.org/problem?id=2253)

求最短路径中的最长边，修改的 d [MAXN]; 的意义即可

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <cstdlib>
    #include <cmath>
    using namespace std;
    
    const int MAXV = 4010;
    const int inf = 10000000;
    
    struct Node
    {
        float x,y;
    }node[10010];
    
    float makedis(Node a ,Node b)
    {
        return sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }
    
    float map[MAXV][MAXV];
    float d[MAXV];
    bool vis[MAXV];
    int n,m;
    
    void dijkstra(int s)
    {
    	for(int i=1;i<=n;i++)
        {
    		vis[i]=0;
    		d[i]=map[s][i];
    	}
        d[1] = 0;
    
    	while (1)
        {
    		float min=inf;int v = -1;
    		for(int i=1;i<=n;i++)
    			if(!vis[i] && d[i]<min)
    			{
    				v=i;
    				min=d[i];
    			}
            if(v == -1)
                break;
    		vis[v]=1;
            if (v == 2)
                break;
    		for(int i=1;i<=n;i++)
    			if(!vis[i] && d[i] > max(d[v] , map[v][i]))
    				d[i] = max(map[v][i],d[v]);
    	}
    }
    
    int main()
    {
    	int i,j,a,b,c;
    	int cases = 1;
    	while(scanf("%d",&n) != EOF)
        {
            if(n == 0 ) break;
            for(i=1;i<=n;i++)
                for(j=1;j<=n;j++)
                {
                    if(i==j)
                        map[i][i]=0;
                    else
                        map[i][j]=map[j][i]=inf;
                }
                for(i=1;i<=n;i++)
                {
                    scanf("%f%f",&node[i].x,&node[i].y);
                }
                for(int i=1;i<=n;i++)
                    for(int j=1;j<=n;j++)
                        {
                            if (makedis(node[i],node[j]) < map[i][j])
                                map[j][i] = map[i][j] = makedis(node[i],node[j]);
                        }
    		dijkstra(1);
    		printf("Scenario #%d\nFrog Distance = ",cases++);
    		printf("%.3f\n\n",d[2]);
    	}
    	return 0;
    }

  
  

