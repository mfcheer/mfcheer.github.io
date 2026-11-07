---
title: poj-3264
date: 2015-01-22 23:08:17
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-0eaf3b3c30
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43031805

[ http://poj.org/problem?id=3264 ](http://poj.org/problem?id=3264)

基础线段树

求区间最大值与最小值的差

    
    
    //poj 3264
    #include <iostream>
    #include <cstdio>
    #include <string>
    #include <cstring>
    #include <cstdlib>
    #include <algorithm>
    
    
    using namespace std;
    
    #define ll(ind) (ind<<1)
    #define rr(ind) (ind<<1|1)
    #define Mid(a,b) (a+((b-a)>>1))
    
    const int N = 50100;
    
    int a[N];
    int MAX,MIN;
    
    struct node
    {
    	int left, right;
    	int Max, Min;
     	int mid()
    	{
    		return Mid(left, right);
    	}
    };
    
    struct segtree
    {
    	node tree[N*4];
    
    	void build(int left ,int right,int ind)
    	{
    	    tree[ind].left = left;
    	    tree[ind].right = right;
    	    if (left == right)
            {
                tree[ind].Max = tree[ind].Min = a[left];
            }
            else
            {
                int mid = tree[ind].mid();
                build(left,mid,ll(ind));
                build(mid+1,right,rr(ind));
                tree[ind].Max = max(tree[ll(ind)].Max,tree[rr(ind)].Max);
                tree[ind].Min = min(tree[ll(ind)].Min,tree[rr(ind)].Min);
            }
    	}
    	void query(int st,int ed,int ind)
    	{
    	    int left = tree[ind].left;
    	    int right = tree[ind].right;
    	    int mid = tree[ind].mid();
    	    if (st == left && ed == right)
            {
                MAX = max(MAX,tree[ind].Max);
                MIN = min(MIN,tree[ind].Min);
            }
            else if (ed<=mid)
                query(st,ed,ll(ind));
            else if (st>mid)
                query(st,ed,rr(ind));
            else
            {
                query(st,mid,ll(ind));
                query(mid+1,ed,rr(ind));
            }
    
    	}
    }seg;
    
    int main()
    {
    	int n, q, b, c;
    	while (scanf("%d %d", &n, &q) != EOF)
    	{
    		for (int i = 1; i <= n; i++)
    		{
    			scanf("%d",&a[i]);
    		}
    		seg.build(1,n,1);
    		while (q--)
    		{
    			MAX = -1000000000;
    			MIN = 1000000000;
    			scanf("%d %d",&b,&c);
    			seg.query(b, c, 1);
    			printf("%d\n",MAX - MIN);
    		}
    	}
    	return 0;
    }
    

  
  

