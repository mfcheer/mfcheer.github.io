---
title: hdu-2715 Billboard
date: 2015-01-04 00:48:22
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-afe6dcedbe
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42378821

[ http://acm.hdu.edu.cn/showproblem.php?pid=2795
](http://acm.hdu.edu.cn/showproblem.php?pid=2795)

  

转：

题意：有一块板，规格为h*w，然后有n张海报，每张海报的规格为1*wi，选择贴海报的位置是：尽量高，同一高度，选择尽量靠左的地方。要求输出每张海报的高度位置。

因为最多只有二十万张海报，所以板的最大的长度不会超过二十万，但是要小心，如果板的长度小于h，我们还要用h来建树。起初在查询的时候并不直接去更新它，而是查询找出它的更新位置的后，再写个updata函数去更新，但是我们可以在查询到它的位置的时候，同时去更新当前点的剩余长度，然后回溯更新所有祖先区间。返回它的查询位置的时候，因为左儿子找到的位置是pos1，右儿子找到的位置是pos2，两者都赋初值为0，又因为每次查询只找出一个位置，也就是说pos1和pos2中只有一个被改变，另一个仍保持0，所以返回pos1+pos2是正确的。

  

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    
    using namespace std;
    
    #define LL(x) (x<<1)
    #define RR(x) (x<<1|1)
    #define MID(a,b) (a+((b-a)>>1))
    #define INF (1<<30)
    
    const int N = 200005;
    
    struct node
    {
    	int lft, rht, mx;
    	int mid(){ return MID(lft, rht); }
    };
    
    int y[N], n, w, h;
    
    struct Segtree
    {
    	node tree[N * 4];
    	void build(int lft, int rht, int ind)
    	{
    		tree[ind].lft = lft;	tree[ind].rht = rht;
    		tree[ind].mx = w;
    
    		if (lft != rht)
    		{
    			int mid = tree[ind].mid();
    			build(lft, mid, LL(ind));
    			build(mid + 1, rht, RR(ind));
    		}
    	}
    	int updata(int valu, int ind)
    	{
    		int lft = tree[ind].lft, rht = tree[ind].rht;
    		if (lft == rht)
    		{
    			tree[ind].mx -= valu;
    			return lft;
    		}
    		else
    		{
    			int pos;
    			if (tree[LL(ind)].mx >= valu)
    				pos = updata(valu, LL(ind));
    			else
    				pos = updata(valu, RR(ind));
    
    			tree[ind].mx = max(tree[LL(ind)].mx, tree[RR(ind)].mx);
    
    			return pos;
    		}
    	}
    }seg;
    
    int main()
    {
    	while (scanf("%d%d%d", &h, &w, &n) != EOF)
    	{
    		int tmp;
    		seg.build(1,min(N,h),1);
    
    		for (int i = 1; i <= n; i++)
    		{
    			scanf("%d", &tmp);
    			if (seg.tree[1].mx < tmp)
    				puts("-1");
    			else
    			{
    				printf("%d\n", seg.updata(tmp, 1));
    			}
    		}
    	}
    	return 0;
    }

  
  

  

