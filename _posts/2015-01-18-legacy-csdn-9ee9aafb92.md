---
title: poj-1611 并查集
date: 2015-01-18 14:54:24
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9ee9aafb92
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42835663

[ http://poj.org/problem?id=1611 ](http://poj.org/problem?id=1611)

  

简单并查集，假设学号是0 的学生已经是感染者，问与他同集合的人有多少个。

  

    
    
    #include <iostream>
    #include <cstdio>
    #include <string>
    #include <cstring>
    #include <cstdlib>
    #include <algorithm>
    #include <vector>
    #include <set>
    #include <map>
    #include <iomanip>
    
    using namespace std;
    
    int n, m, k, t, tt;
    int fa[30010];
    int b[510];
    int num[30010];
    
    int findd(int x)
    {
    	if (x == fa[x])
    		return x;
    	else
    		return findd(fa[x]);
    }
    
    void un(int x,int y )
    {
    	int fx = findd(x);
    	int fy = findd(y);
    	if (fx == fy)
    		return;
    	else
    	{
    		if (fy > fx)
    		{
    			num[fx] += num[fy];
    			fa[fy] = fx;
    		}
    		else
    		{
    			num[fy] += num[fx];
    			fa[fx] = fy;
    		}
    	}
    }
    
    int main()
    {
    	while (cin >> n >> m)
    	{
    		if (n == 0 && m == 0)
    			return 0;
    
    		for (int i = 0; i <= n; i++)
    		{
    			fa[i] = i;
    			num[i] = 1;
    		}
    		while (m--)
    		{
    			cin >> k;
    			if (k)
    				cin >> tt;
    			
    			k--;
    			while (k --)
    			{
    				cin >> t;
    				un(t,tt);
    			}
    		}
    		cout << num[0] << endl;
    	}
    	return 0;
    }

  
  

