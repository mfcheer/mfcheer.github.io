---
title: hdu-2102
date: 2014-11-27 21:16:17
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-0c2abf79a7
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41554129

[ http://acm.hdu.edu.cn/showproblem.php?pid=2102
](http://acm.hdu.edu.cn/showproblem.php?pid=2102)

  

    
    
    #include <iostream>
    #include <algorithm>
    #include <set>
    #include <map>
    #include <string.h>
    #include <queue>
    #include <sstream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    
    using namespace std;
    
    struct pp
    {
    	int w,x,y;
    	char r;
    	int t ;
    }p[3][12][12];
    
    int vis[3][12][12];
    int n,m,t,ca,ok;
    int dir[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
    
    void bfs( int w,int x,int y )
    {
    	memset (vis,0,sizeof(vis));
    	queue<pp> q;
    	pp qq ;pp qqq;
    
    	q.push( p[w][x][y] );
    	p[w][x][y].t=0;
    	vis[w][x][y] = 1;
    
    	while ( !q.empty() )
    	{
    		qq = q.front();
    		q.pop();
    
    		if (qq.r == 'P' )
    		{
    			if(qq.t <= t)
    				ok = 1;
    			return ;
    		}
    
    		for(int i=0;i<4;i++)
    		{
    			if (qq.x + dir[i][0] >= 0 && qq.x + dir[i][0] < n && qq.y + dir[i][1]>= 0  && qq.y + dir[i][1] < m )
    			{
    				qqq = p[qq.w][ qq.x + dir[i][0] ][ qq.y + dir[i][1] ];
    
    				if ( qqq.r == '#' && !vis[qqq.w][qqq.x][qqq.y] )
    				{
    					if (p[!qqq.w][qqq.x][qqq.y].r != '*' && p[!qqq.w][qqq.x][qqq.y].r != '#' && !vis[!qqq.w][qqq.x][qqq.y] )
    					{
    						vis[!qqq.w][qqq.x][qqq.y]=1;
    						qqq = p[!qqq.w][qqq.x][qqq.y];
    						qqq.t = qq.t+1;
    						q.push(qqq);
    					}
    
    				}
    				else if (qqq.r != '*' && !vis[qqq.w][qqq.x][qqq.y] )
    				{
    					vis[qqq.w][qqq.x][qqq.y]=1;
    					qqq.t = qq.t+1;
    					q.push(qqq);
    				}
    			}
    		}
    
    	}
    }
    
    
    int main ()
    {
    	cin>>ca;
    	while (ca--)
    	{
    		cin>>n>>m>>t;
    		
    		for(int k=0;k<2;k++)
    			for(int i=0;i<n;i++)
    				for(int j=0;j<m;j++)
    				{
    					cin>>p[k][i][j].r;
    					p[k][i][j].w = k;
    					p[k][i][j].x = i;
    					p[k][i][j].y = j;
    				}
    		ok = 0;
            bfs(0,0,0);
    		if (ok)
    			cout<<"YES"<<endl;
    		else 
    			cout<<"NO"<<endl;
    	}
    	return 0;
    }
    

  
  

  

