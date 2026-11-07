---
title: poj-2251 广搜
date: 2014-12-28 21:47:01
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-1f03ed1fd8
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42219151

[ http://poj.org/problem?id=2251 ](http://poj.org/problem?id=2251)

    
    
    #include<stdio.h>  
    #include<iostream>  
    #include<math.h>  
    #include<stdlib.h>  
    #include<ctype.h>  
    #include<algorithm>  
    #include<vector>  
    #include<string.h>  
    #include<queue>  
    #include<stack>  
    #include<set>   
    #include<sstream>  
    #include<time.h>  
    #include<utility>  
    #include<malloc.h>  
    #include<stdexcept>  
    #include<iomanip>  
    #include<iterator>  
    
    using namespace std;
    
    char map[40][40][40];
    int vis[40][40][40];
    int L, R, C;
    
    struct node
    {
    	int z, x, y;
    	int c;
    };
    
    int dir[6][3] = { { 1, 0, 0 }, { -1, 0, 0 }, { 0, -1, 0 }, { 0, 1, 0 }, { 0, 0, -1 }, { 0, 0, 1 } };
    
    int BFS(int si, int sj, int sk)
    {
    	memset(vis, 0, sizeof(vis));
    
    	queue<node> q;
    	node cur, next;
    
    	cur.z = si, cur.x = sj, cur.y = sk, cur.c = 0;
    
    	vis[si][sj][sk] = 1;
    	
    	q.push(cur);
    
    	while (!q.empty())
    	{
    		cur = q.front();
    		q.pop();
    		for (int i = 0; i < 6; i++)
    		{
    			next.z = cur.z + dir[i][0];
    			next.x = cur.x + dir[i][1];
    			next.y = cur.y + dir[i][2];
    			next.c = cur.c + 1;
    			if (next.z<1 || next.z>L || next.x<1 || next.x>R || next.y<1 || next.y>C || map[next.z][next.x][next.y] == '#')
    				continue;
    			if (map[next.z][next.x][next.y] == 'E')
    				return next.c;
    			if (!vis[next.z][next.x][next.y])
    			{
    				vis[next.z][next.x][next.y] = 1;
    				q.push(next);
    			}
    		}
    	}
    	return 0;
    }
    
    int main()
    {
    	int si, sj, sk;
    	while (cin >> L >> R >> C)
    	{
    		if (L == 0 && R == 0 && C == 0)
    			break;
    
    		for (int i = 1; i <= L; i++)
    			for (int j = 1; j <= R; j++)
    				for (int k = 1; k <= C; k++)
    				{
    					cin >> map[i][j][k];
    					if (map[i][j][k] == 'S')
    					{
    						si = i; sj = j; sk = k;
    					}
    				}
    		int ans = BFS(si, sj, sk);
    		if (ans == 0)
    			printf("Trapped!\n");
    		else
    			printf("Escaped in %d minute(s).\n", ans);
    
    	}
    	return 0;
    }

  
  

  

  

