---
title: hdu-2821
date: 2014-11-29 14:10:01
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-32cafa84ac
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41595391

[ http://acm.hdu.edu.cn/showproblem.php?pid=2821
](http://acm.hdu.edu.cn/showproblem.php?pid=2821)

  

不要被题目吓到 ，认真读题还是好理解的

  

    
    
    #include<stdio.h>
    #include<iostream>
    #include<string.h>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string>
    #include<queue>
    #include<stack>
    #include<set>
    
    using namespace std;
    
    int n,m;
    int p[30][30];
    char c;
    int num = 0,ok;
    
    int dir[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    char dirc[5] = {'U','D','L','R'};
    
    char step[1000];
    char str[33];
    
    int check (int x,int y)
    {
    	if (x >= 0 && x < m && y >= 0 && y < n)
    		return 1;
    	return 0;
    }
    
    int dfs (int x,int y,int s)
    {
    	if (s >= num)
    	{
    		step[s]=0;
    		return 1;
    	}
    
    	for(int i =0;i<4;i++)
    	{
    		int xx = x + dir[i][0];
    		int yy = y + dir[i][1];
    
    		if ( p[ xx ][ yy ] !=0 || !check ( xx ,yy ) )
    			continue;
    
    		while (  p[ xx ][ yy  ] == 0 && check ( xx ,yy ))
    		{
    			xx+=dir[i][0];
    			yy+=dir[i][1];
    		}
    
    		if (!check(xx+dir[i][0] ,yy+dir[i][1] ))
    			continue;
    
    		int tmp = p[xx][yy];
    
    		p[xx+dir[i][0]][yy+dir[i][1]] += (tmp-1);
    		p[xx][yy] =0;
    
    		step[s] = dirc[i];
    
    		if ( dfs(xx,yy,s+1) )
    			return 1;
    
    		p[xx+dir[i][0]][yy+dir[i][1]] -= (tmp-1);
    		p[xx][yy] = tmp;
    	}
    	return 0;
    }
    
    
    int main ()
    {
    	while (cin>>n>>m)
    	{
    		num = 0;
    	
    		for(int i=0;i<m;i++)
    		{
                scanf("%s",str);
                for(int j=0;j<n;j++)
    			{
                    if(str[j]!='.')
    				{
                        num += str[j]-'a'+1;
                        p[i][j]=str[j]-'a'+1;
                    }
    				else 
                        p[i][j]=0;
                }
             }
    
    
    		ok = 0;
    
    		for(int i=0;i<m;i++)
    		{
    				for(int j=0;j<n;j++)
    				{
    					if (!p[i][j] && dfs(i,j,0) )
    					{
    						ok = 1;
    						cout<<i<<endl;
    						cout<<j<<endl;
    						cout<<step<<endl;
    						break;
    					}
    				}
    			if (ok)
    				break;
    		}
    
    	}
    	return 0;
    }
    

  
  

