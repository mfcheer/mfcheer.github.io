---
title: poj-2481
date: 2014-11-07 10:39:35
tags: ['二叉树', 'acm', 'poj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b45b9b9bca
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40889511

题目链接： [ 点击打开链接 ](http://poj.org/problem?id=2481)

又是树状数组的应用 ，花了好长时间。

题目大意：

给你很多线段的头S和尾E，问每一条线段中包含了多少个线段，（S和E相同不计在内）。这题先一看，完全不知道什么方法，感觉非常的难办。

但是！树状数组可以轻松解决这个问题！！！首先，将她们线段的s和e当做是(s,e)一个点，这样子把所有点画出来，你就会发现一个很神奇的现象，题目要求就会变成：问每一个点的左上角有多少个点？

！！！这样不就和那题最简单的stars一样吗？？？！！！

stars那题是问左下角有多少个点，而这题是问左上角，而且点不是有序排好的，所以有些不同，特殊处理一下就可以。

如果正常做，那个y是递增的，所以sum和update那个方向就会相反了，这个其实没什么所谓，一样的，排序的时候先y由大到小排，y相同时x由小到大排，这样小小的处理，就变成stars那题了！！！

难点在于处理相同区间，对于相同区间，只是把答案直接拷贝过来，并把其加入树状数组，不可以直接在树状数组中求和。  

    
    
    #include <stdio.h>
    #include <stdlib.h>
    #include <string.h>
    #include <iostream>
    #include <algorithm>
    #include <math.h>
    #include <queue>
    
    using namespace std;
    
    struct q
    {
    	int s;
    	int e ;
    	int id;
    }p[100005];
    
    int a[100005];
    int b[100005];
    int n;
    int maxnum;
    
    bool cmp (q a ,q b)
    {
    	if (a.e == b.e )
    		return a.s < b.s;
    	else 
    		return a.e > b.e;
    }
    
    int lowbit(int i)
    {
    	return i & (-i);
    }
    
    int sum(int i)
    {
    	int ans = 0;
    	while (i>0)
    	{
    		ans += b[i];
    		i-=lowbit(i);
    	}
    	return ans;
    }
    
    void update (int i,int v)
    {
    	while (i <= maxnum + 1)
    	{
    		b[i]+=v;
    		i+=lowbit(i);
    	}
    }
    
    int main ()
    {
    	while (scanf ("%d",&n), n)
    	{
    		maxnum = -1;
    		memset (b,0,sizeof (b));
    		memset (a,0,sizeof (a));
    
    		for (int i=0;i<n;i++)
    		{
    			scanf("%d %d",&p[i].s,&p[i].e);
    			p[i].e++;
    			p[i].s++;
    
    			p[i].id=i;
    			maxnum = max (maxnum,p[i].s);
    		}
    		
    		sort (p,p+n,cmp);
    
    		a[p[0].id]=sum(p[0].s);
    		update(p[0].s,1);
    
    		for (int i=1;i<n;i++)
    		{
    			if (p[i].e == p[i-1].e && p[i].s == p[i-1].s )
    			{
    				a[p[i].id] = a[p[i-1].id];
    			}
    			else 
    			{
    				a[p[i].id] = sum(p[i].s );
    			}
    			update(p[i].s ,1);
    		}
    
    		printf ("%d",a[0]);
    		for (int i=1 ;i<n;i++)
    			printf(" %d",a[i]);
    		printf("\n");
    
    	}
    	return 0;
    }
    
    

  
  

