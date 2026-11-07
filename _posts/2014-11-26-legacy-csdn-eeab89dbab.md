---
title: hdu-1010
date: 2014-11-26 22:26:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-eeab89dbab
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41524431

简单深搜 剪枝

[ http://acm.hdu.edu.cn/showproblem.php?pid=1010
](http://acm.hdu.edu.cn/showproblem.php?pid=1010)  

    
    
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
    
    int n,m;
    int t;
    
    char p[10][10];
    int ok ;
    int sx,sy,ex,ey;
    
    int dir[4][2]={ {0,1},{0,-1},{1,0},{-1,0}};
    
    void dfs (int x,int y,int ans )
    {
    	if (ans == t)//判断时间是否用尽
    	{
    		if (x == ex && y == ey)
    			ok = 1;
    		return ;
    	}
    	if (ok)
    		return ;
    
    	int temp = abs(x-ex) + abs(y - ey) - abs(ans - t);//剪枝（重要）
    
    	if ( temp > 0 || temp % 2  )
    		return ;
    
    	for(int i=0;i<4;i++)
    	{
    		int xx,yy;
    		xx = x + dir[i][0];
    		yy = y + dir[i][1];
    		if (xx >=0 && xx <n && yy >=0 && yy< m && p[xx][yy] != 'X')
    		{
    			p[xx][yy] = 'X';
    			dfs (xx,yy,ans+1);
    			p[xx][yy] = '.';//回溯
    		}
    
    	}
    }
    
    
    int main ()
    {
    	while (cin>>n>>m>>t)
    	{
    		if (n==0 && m==0 && t==0)
    			return 0;
    
    		for (int i=0;i<10;i++)
    			for(int j=0;j<10;j++)
    			{
    				p[i][j] = 'X';
    			}
    
    
    		for(int i=0;i<n;i++)
    			cin>>p[i];
    
    		int  tt = 0;
    		for(int i=0;i<n;i++)
    			for(int j=0;j<m;j++)
    			{
    				if ( p[i][j] == 'S' )
    				{
    					sx=i;
    					sy=j;
    				}
    				if ( p[i][j] == 'D' )
    				{
    					ex= i;
    					ey =j;
    				}
    				if ( p[i][j] == 'X' )		
    					tt++;
    			}
    
    		if (  m*n - tt <= t )//如果时间大于最大步数 不符合条件
    		{
    			cout<<"NO"<<endl;
    		}
    		else 
    		{
    			ok = 0 ;
    			p[sx][sy] = 'X';// 因为这里WA了好几次
    			dfs (sx,sy,0);
    
    			if (ok)
    				cout<<"YES"<<endl;
    			else
    				cout<<"NO"<<endl;
    		}
    	}
    	return 0;
    }
    

  
  

  

  

