---
title: hdu-1242
date: 2014-11-27 12:13:30
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-aea7ce1a09
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41544247

dfs

可能有多个朋友 所以从angel搜朋友 遇到朋友就停止

  

    
    
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
    
    const int MAX = 202;
    
    int n,m,t;
    char p[MAX][MAX];
    int vis[MAX][MAX];
    int dir[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
    int sx,sy;
    
    void dfs (int x,int y,int ans )
    {
    	if ( p[x][y] == 'r' )
    	{
    		if (t > ans)
    			t = ans;
    		return ;
    	}
    
    	for(int i=0;i<4;i++)
    	{
    		int xx = x + dir[i][0];
    		int yy = y + dir[i][1];
    		if (xx >=0 && xx<n && yy>=0 && yy<m && !vis[xx][yy] && p[xx][yy]!='#')
    		{
    			if (p[xx][yy] == '.' || p[xx][yy]=='r' )
    			{
    				vis[xx][yy] = 1;
    				dfs (xx,yy,ans+1);
    				vis[xx][yy] = 0;
    			}
    			else 
    			{
    				vis[xx][yy] = 1;
    				dfs (xx,yy,ans+2);
    				vis[xx][yy] = 0;
    			}
    
    		}
    	}
    }
    
    
    int main ()
    {
    	while (scanf("%d %d",&n,&m)!=EOF)
    	{
    		
    		for(int i=0;i<n;i++)
    		{
    			scanf("%s",p[i]);
    		}
    
    		for(int i=0;i<n;i++)
    		{
    			for(int j=0;j<m;j++)
    			{
    				if (p[i][j] == 'a')
    				{
    					sx = i;
    					sy = j;
    					break;
    				}
    
    			}
    		}
    
    		int ans = 0;
    		t = INT_MAX;
    
    		dfs (sx,sy,ans);
    
    		if (t != INT_MAX )
    			printf("%d\n",t);
    		else 
    			printf("Poor ANGEL has to stay in the prison all his life.\n");
    	}
    
    	return 0;
    }
    
    
    

  
  

