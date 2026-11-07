---
title: FZU 2150 求双搜最优解
date: 2014-12-31 18:34:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-dd30ce01ea
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42298181

[ http://acm.fzu.edu.cn/problem.php?pid=2150
](http://acm.fzu.edu.cn/problem.php?pid=2150)

    
    
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
    #include<map>
    #include<sstream>
    #include<time.h>
    #include<utility>
    #include<malloc.h>
    
    using namespace std;
    
    int t, n, m;
    char b[15][15];
    int dir[4][2] = { { -1, 0 }, { 1, 0 }, { 0, 1 }, { 0, -1 } };
    int vis[15][15];
    int check(int x, int y)
    {
    	if (x >= 0 && x < n && y >= 0 && y < m)
    		return 1;
    	return 0;
    }
    struct node
    {
    	int x;
    	int y;
    	int t;
    }q[150];
    
    queue<node> de;
    int step = 0;
    
    int main()
    {
    	scanf("%d",&t);
    	int c = 1;
    	while (t--)
    	{
    		scanf("%d%d", &n, &m);
    		for (int i = 0; i < n; i++)
    			scanf("%s",b[i]);
    
    		int num = 0;
    		for (int i = 0; i < n; i++)
    			for (int j = 0; j < m; j++)
    			{
    				if (b[i][j] == '#')
    				{
    					q[num].x = i;
    					q[num++].y = j;
    				}
    			}
    
    		int ans = 0x3f3f3f3f;
    		if (num == 2)
    			ans = 0;
    		else 
    		for (int i = 0; i < num; i++)
    		{
    			for (int j = i; j < num; j++)
    			{
    				int sx = q[i].x;
    				int sy = q[i].y;
    				int ex = q[j].x;
    				int ey = q[j].y;
    				{
    
    					while (!de.empty()) de.pop();
    					
    					node qq, qqq;
    					qq.x = sx; qq.y = sy; qq.t = 0;
    					qqq.x = ex; qqq.y = ey; qqq.t = 0;
    
    					de.push(qq);
    					de.push(qqq);
    					memset(vis,0,sizeof(vis));
    
    					vis[sx][sy] = vis[ex][ey] = 1;
    
    					step = 0;
    
    					/////////////////
    					while (!de.empty())
    					{
    						node qq = de.front();
    						de.pop();
    							step = qq.t;
    						for (int i = 0; i < 4; i++)
    						{
    							int x = qq.x + dir[i][0];
    							int y = qq.y + dir[i][1];
    
    							if (!check(x, y) || vis[x][y] || b[x][y] == '.')
    								continue;
    							node qqq;
    							qqq.x = x;
    							qqq.y = y;
    							qqq.t = qq.t + 1;
    							vis[x][y] = 1;
    							de.push(qqq);
    						}
    					}
    					////////////////
    					int ok = 1;
    
    					for (int i = 0; i < n; i++)
    					{
    						for (int j = 0; j < m; j++)
    						{
    							if (vis[i][j] == 0 && b[i][j] == '#')
    							{
    								ok = 0;
    								break;
    							}
    						}
    					}
    
    					if (ok)
    					{
    						ans = min(ans, step);
    					}
    				}
    			}
    		}
    		if (ans == 0x3f3f3f3f)
    			ans = -1;
    		printf("Case %d: %d\n",c++,ans);
    	}
    }

  
  

  

