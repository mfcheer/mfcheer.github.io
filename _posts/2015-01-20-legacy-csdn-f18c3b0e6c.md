---
title: hdu-1698
date: 2015-01-20 18:21:48
tags: ['acm', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f18c3b0e6c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42921585

[ http://acm.hdu.edu.cn/showproblem.php?pid=1698
](http://acm.hdu.edu.cn/showproblem.php?pid=1698)

  

实现求全部区间的和 ，修改部分区间的值。

  

成段更新需要用到懒惰标记 lazy。
简单来说就是每次更新的时候不要更新到底，用延迟标记使得更新延迟到下次需要更新or询问到的时候。延迟标记的意思是：这个区间的左右儿子都需要被更新，但是当前区间已经更新了。

  

    
    
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
    
    #define ll(ind) (ind<<1)
    #define rr(ind) (ind<<1|1)
    #define Mid(a,b) (a+((b-a)>>1))
    
    const int N = 100100;
    
    struct node
    {
    	int left,right,sum;
    	int mid()
    	{
    		return Mid(left, right);
    	}
    
    	int lazy;
    
    	void fun(int summ)
    	{
    		lazy = summ; 
    		sum = (right - left + 1) * lazy;
    	}
    };
    
    struct segtree
    {
    	node tree[N*4];
    
    	void real(int ind)//更新懒惰标记
    	{
    		if (tree[ind].lazy)
    		{
    			tree[ll(ind)].fun(tree[ind].lazy);
    			tree[rr(ind)].fun(tree[ind].lazy);
    			tree[ind].lazy = 0;
    		}
    	}
    
    	void buildtree(int left,int right,int ind)
    	{
    		tree[ind].left = left;
    		tree[ind].right = right;
    		tree[ind].sum = right - left + 1;
    		tree[ind].lazy = 1;
    		if (left != right)
    		{
    			int mid = tree[ind].mid();
    			buildtree(left, mid, ll(ind));
    			buildtree(mid + 1, right, rr(ind));
    		}
    	}
    
    	void update(int st, int ed, int ind, int type)
    	{
    		int left = tree[ind].left;
    		int right = tree[ind].right;
    		if (st <= left && right <= ed)
    			tree[ind].fun(type);
    		else
    		{
    			real(ind);
    
    			int mid = tree[ind].mid();
    			if (st <= mid) update(st, ed, ll(ind), type);
    			if (ed > mid) update(st, ed, rr(ind), type);
    			tree[ind].sum = tree[ll(ind)].sum + tree[rr(ind)].sum;
    		}
    	}
    }seg;
    
    int main()
    {
    	int ca = 1;
    	int t,n,m;
    	int x, y, z;
    	scanf("%d",&t);
    	while (t--)
    	{
    		scanf("%d%d", &n, &m);
    		seg.buildtree(1, n, 1);
    		
    		
    		while (m--)
    		{
    			scanf("%d%d%d", &x, &y, &z);
    			seg.update(x, y, 1, z);
    		}
    	
    		printf("Case %d: The total value of the hook is %d.\n", ca++, seg.tree[1].sum);
    	}
    	return 0;
    }
    

  
  

