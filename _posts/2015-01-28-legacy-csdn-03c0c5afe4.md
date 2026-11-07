---
title: poj-3628 Silver Cow Party
date: 2015-01-28 22:57:27
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-03c0c5afe4
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43244317

题目链接： [ http://poj.org/problem?id=3268 ](http://poj.org/problem?id=3268)

所有的牛去一个牛的家里参加聚会，所给的路径是单向的，问往返的所有牛的路径长度中最长的是多少？

解法：往返时候翻转矩阵，再求一遍最短路径，两次相加后进行比较。

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    #include <stdlib.h>
    #include <time.h>
    
    using namespace std;
    
    const int MAXV = 4010;
    const int inf = 10000000;
    
    int map[MAXV][MAXV];//路径长度
    int d[MAXV],re_d[MAXV];//距离
    bool vis[MAXV];
    int n,m,x;
    
    void dijkstra(int s)
    {
    	for(int i=1;i<=n;i++)
        {
    		vis[i]=0;
    		d[i]=map[s][i];
    	}
        d[s] = 0;
    	while (1)
        {
    		int min=inf,v = -1;
    		for(int i=1;i<=n;i++)
    			if(!vis[i] && d[i]<min)
    			{
    				v=i;
    				min=d[i];
    			}
            if(v == -1)
                break;
    		vis[v]=1;
    		for(int i=1;i<=n;i++)
    			if(!vis[i] && d[i] > d[v] + map[v][i])
    				d[i]=map[v][i]+d[v];
    	}
    }
    int main()
    {
    	int i,j,a,b,c;
    	while(scanf("%d%d%d",&n,&m,&x) != EOF)
        {
            for(i=1;i<=n;i++)
                for(j=1;j<=n;j++)
                {
                    if(i==j)
                        map[i][i]=0;
                    else
                        map[i][j] = inf;
                }
                for(i=1;i<=m;i++)
                {
                    scanf("%d%d%d",&a,&b,&c);
                    if(map[a][b]>c)
                        map[a][b]=c;
                }
    		dijkstra(x);
    		for(int i=1;i<=n;i++)
                re_d[i] = d[i];
    		for(int i=1;i<=n;i++)
                for(int j=1;j<i;j++)
            {
                int t = map[i][j] ;
                map[i][j]= map[j][i];
                map[j][i] = t;
            }
            dijkstra(x);
            for(int i=1;i<=n;i++)
                d[i]+=re_d[i];
            int ans = -1;
            for(int i=1;i<=n;i++)
                ans = max(ans,d[i]);
    		printf("%d\n",ans);
    	}
    	return 0;
    }
    

  
  

  

