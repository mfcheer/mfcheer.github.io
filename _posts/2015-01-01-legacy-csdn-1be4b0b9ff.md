---
title: hdu-2612 两次bfs
date: 2015-01-01 15:33:24
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-1be4b0b9ff
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42319323

[ http://acm.hdu.edu.cn/showproblem.php?pid=2612
](http://acm.hdu.edu.cn/showproblem.php?pid=2612)

两次bfs， 记录到每个KFC的最短时间。选取最短时间。  

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string>
    #include <cstring>
    #include <cmath>
    #include <cstdlib>
    #include <algorithm>
    #include <queue>
    #include <stack>
    #include <set>
    #include <map>
    #include <vector>
    
    using namespace std;
    
    int n, m;
    
    int dir[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    
    int check(int x, int y)
    {
    	if (x >= 1 && x <= n && y >= 1 && y <= m)
    		return 1;
    	return 0;
    }
    
    struct node
    {
    	int x;
    	int y;
    	int t1, t2;
    	char c;
    }p[210][210];
    
    int vis[210][210];
    int sx, sy;
    int ex, ey;
    
    void bfs(int x,int y)
    {
    	memset(vis,0,sizeof(vis)); 
    	queue<node> q;
    	node qq, qqq;
    	qq.x = x;
    	qq.y = y;
    	qq.t1 = 0;
    	p[x][y].t1 = 0;
    	vis[x][y] = 1;
    	q.push(qq);
    
    	while (!q.empty())
    	{
    		qq = q.front();
    		q.pop();
    
    		for (int i = 0; i < 4; i++)
    		{
    			int x = qq.x + dir[i][0];
    			int y = qq.y + dir[i][1];
    			if (!check(x, y) || vis[x][y] || p[x][y].c == '#')
    				continue;
    
    			vis[x][y] = 1;
    
    			qqq.x = x;
    			qqq.y = y;
    			qqq.t1 = qq.t1 + 1; 
    			p[x][y].t1 = qqq.t1;
    			q.push(qqq);
    		}
    	}
    	return;
    }
    
    void bfs1(int x, int y)
    {
    	memset(vis, 0, sizeof(vis));
    	queue<node> q;
    	node qq, qqq;
    	qq.x = x;
    	qq.y = y;
    	qq.t2 = 0;
    	p[x][y].t2 = 0;
    	vis[x][y] = 1;
    	q.push(qq);
    
    	while (!q.empty())
    	{
    		qq = q.front();
    		q.pop();
    
    		for (int i = 0; i < 4; i++)
    		{
    			int x = qq.x + dir[i][0];
    			int y = qq.y + dir[i][1];
    			
    			if (!check(x, y) || vis[x][y] || p[x][y].c == '#')
    				continue;
    
    			vis[x][y] = 1;
    
    			qqq.x = x;
    			qqq.y = y;
    			qqq.t2 = qq.t2 + 1;
    			p[x][y].t2 = qqq.t2;
    			q.push(qqq);
    		}
    	}
    	return;
    }
    
    int main()
    {
    	while (cin >> n >> m)
    	{
    		getchar();
    		for (int i = 1; i <= n; i++)
    		{
    			for (int j = 1; j <= m; j++)
    			{
    				cin >> p[i][j].c;
    				if (p[i][j].c == 'Y')
    				{
    					sx = i;
    					sy = j;
    				}
    				if (p[i][j].c == 'M')
    				{
    					ex = i;
    					ey = j;
    				}
    			}
    			getchar();
    		}
    
    		bfs(sx,sy);
    		bfs1(ex,ey);
    
    		for (int i = 1; i <= n; i++)
    			for (int j = 1; j <= m; j++)
    			{
    				if (p[i][j].c == '@')
    				{
    					p[i][j].t1 = (p[i][j].t1+p[i][j].t2);
    				}
    			}
    		int ans = 10000000;
    
    		for (int i = 1; i <= n; i++)
    			for (int j = 1; j <= m; j++)
    			{
    				if (p[i][j].c == '@')
    				{
    					ans = min(p[i][j].t1, ans);
    				}
    			}
    
    		ans *= 11;
    		cout << ans << endl;
    	}
    	return 0;
    }

  
  

