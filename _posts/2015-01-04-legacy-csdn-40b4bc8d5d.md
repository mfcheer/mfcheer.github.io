---
title: poj-2828 Buy Tickets
date: 2015-01-04 20:12:07
tags: ['acm', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-40b4bc8d5d
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42397919

[ http://poj.org/problem?id=2828 ](http://poj.org/problem?id=2828)

  

题意：有n个的排队，每一个人都有一个val来对应，每一个后来人都会插入当前队伍的某一个位置pos。要求把队伍最后的状态输出。  

逆向思考。这样考虑，最后一个人一定会得到当前队伍他想要的位置，如果我们往前一个阶段，倒数第二个人也一定能得到他想要的位置……，也就是说，我们可以这样处理，我们把最后一个人插入，然后忽略它，再把倒数第二个人插入。即，我们找出当前队伍他想要插入的位置pos的真正坐标就可以。然后去更新整个队伍的长度。如此循环，直到最后一个人。线段树在单点更新的时候，感觉和二分查找是很相似的，可以用它实现。

  

    
    
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
    
    #define Mid(a,b) ( a+((b-a)>>1))
    #define ll(x) (x<<1)
    #define rr(x) (x<<1|1)
    
    const int N = 200010;
    
    using namespace std;
    
    int n;
    int pos[N];
    int val[N];
    int ans[N];
    
    struct node
    {
    	int left;
    	int right;
    	int sum;
    	int mid() { return Mid(left, right); }
    };
    
    struct segtree
    {
    	node tree[N * 4];
    	void buildtree(int left,int right,int ind)
    	{
    		tree[ind].left = left;
    		tree[ind].right = right;
    		
    		tree[ind].sum = right - left + 1;
    		
    		if (left !=right)
    		{
    			int mid = tree[ind].mid();
    			buildtree(left,mid,ll(ind));
    			buildtree(mid+1,right,rr(ind));
    		}
    	}
    	
    	int query(int val,int pos)
    	{
    		int left = tree[pos].left;
    		int right = tree[pos].right;
    
    		if (left == right)
    		{
    			tree[pos].sum = 0;
    			return left;
    		}
    		else
    		{
    			int ind;
    			if (tree[ll(pos)].sum >= val)
    				ind = query(val, ll(pos));
    			else
    				ind = query(val - tree[ll(pos)].sum , rr(pos));
    
    			tree[pos].sum = tree[ll(pos)].sum + tree[rr(pos)].sum;
    
    			return ind;
    		}
    	}
    }seg;
    
    int main()
    {
    	while (scanf("%d",&n)!=EOF)
    	{
    		seg.buildtree(1,n,1);
    
    		for (int i = 1; i <= n; i++)
    		{
    			scanf("%d %d",&pos[i],&val[i]);
    		}
    
    		for(int i = n; i >=1; i--)
    		{
    			int ps = seg.query(pos[i]+1,1);
    			ans[ps] = val[i];
    		}
    
    		for (int i = 1; i <= n; i++)
    		{
    			printf("%d",ans[i]);
    			if (i != n)
    				printf(" ");
    		}
    		printf("\n");
    	}
    	return 0;
    }
    

  
  

