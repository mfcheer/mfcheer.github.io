---
title: hdu-1754
date: 2014-10-29 21:09:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c5b934c9cb
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40592971

[ http://acm.hdu.edu.cn/showproblem.php?pid=1166
](http://acm.hdu.edu.cn/showproblem.php?pid=1166)  

代码风格更新后：

  

    
    
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
    
    int m,n;
    
    int a[N];
    
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
    		tree[ind].sum = 0;
    
    		if (left == right)
    			tree[ind].sum = a[left];
    		else
    		{
    			int mid = tree[ind].mid();
    
    			buildtree(left,mid,ll(ind));
    			buildtree(mid+1,right,rr(ind));
    
    			tree[ind].sum = max(tree[ll(ind)].sum , tree[rr(ind)].sum);
    		}
    	}
    	
    	void update(int pos,int ind,int val)
    	{
    		if (tree[ind].left == tree[ind].right) tree[ind].sum = val;
    		else
    		{
    			int mid = tree[ind].mid();
    
    			if (pos <= mid)
    				update(pos,ll(ind),val);
    			else
    				update(pos,rr(ind),val);
    
    			tree[ind].sum = max(tree[ll(ind)].sum , tree[rr(ind)].sum);
    		}
    	}
    
    	int query(int st ,int ed,int ind)
    	{
    		int left = tree[ind].left;
    		int right = tree[ind].right;
    		
    		if (st <= left && right <= ed)
    			return tree[ind].sum;
    
    		else
    		{
    			int mid = tree[ind].mid();
    			int sum1 = 0;
    			int sum2 = 0;
    			if (st <= mid)
    				sum1 = query(st,ed,ll(ind));
    			if (ed > mid)
    				sum2 = query(st,ed,rr(ind));
    
    			return max(sum1 , sum2);
    		}
    	}
    }seg;
    
    int main()
    {
    	while (scanf("%d %d",&n,&m)!=EOF)
    	{
    		for (int i = 1; i <= n; i++)
    			scanf("%d",&a[i]);
    		
    		seg.buildtree(1,n,1);
    
    		char opr[10];
    		int c, d;
    		while (m--)
    		{
    			scanf("%s",opr);
    			scanf("%d %d",&c,&d);
    			if (opr[0] == 'Q')
    			{
    				printf("%d\n", seg.query(c, d, 1));
    			}
    			else if (opr[0] == 'U')
    			{
    				seg.update(c,1,d);
    			}
    		}
    	}
    	return 0;
    }
    

  
  

  

之前

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string.h>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    #include <sstream>
    #include <time.h>
    #include <utility> 
    #include <malloc.h> 
    
    using namespace std;
    
    int max (int a,int b)
    {
        if (a>=b)
            return a;
        else 
            return b;
    }
    
    struct node
    {
        int left ;
        int right;
        int sum;
    }b[5001000];
    
    int a[5000100];
    
    void build1(int left ,int right ,int i)//建立二叉树（用于求和）
    {
        int mid;
        b[i].left =left;
        b[i].right =right ;
        if (left == right )
        {
            b[i].sum=a[left];
            return ;
        }
    
        mid = (left + right )/2;
        build1(left ,mid,2*i);
        build1( mid+1,right ,2*i+1);
        b[i].sum=b[i*2].sum+b[i*2+1].sum;
    }
    
    void build2(int left , int right , int i)//建立二叉树 （RMQ）
    {
        int mid;
        b[i].left=left;
        b[i].right=right;
        if(left==right)
        {
            b[i].sum=a[left];
            return ;
        }
    
        mid=(left+right)/2;
        build2(left,mid,2*i);
        build2(mid+1,right,2*i+1);
        b[i].sum=max(b[2*i].sum , b[2*i+1].sum);
    
    }
    
    void add (int id,int num,int i)//加(减)节点id值num
    {
        if(b[i].left == b[i].right )
        {
            b[i].sum += num;
            return ;
        }
        else 
        {
            b[i].sum=b[i].sum+num;
            if (id<= b[i*2].right )
                add (id,num,i*2);
            else
                add (id,num,i*2+1);
        }
    }
    
    int query (int left,int right ,int i)//求和 left to right
    {
        int mid;
        if (b[i].right  == right && b[i].left ==left )
        return b[i].sum ;
    
        mid=(b[i].left +b[i].right )/2;    
        if (right <= mid)
            return query (left ,right,2*i);
        else if (left > mid)
            return query (left ,right,2*i+1);
        else
            return query (left ,mid,2*i)+query (mid+1 ,right,2*i+1);
    }
    
    int Query(int left, int right,int i)//求最值
    {
        int mid;
        if(b[i].left==left && b[i].right ==right) 
            return b[i].sum;
        mid=(b[i].left+b[i].right)/2;
        if(right<=mid) 
            return Query(left,right,2*i);
        if (left>mid ) 
            return Query(left,right,2*i+1);
        if(left<=mid && mid<right)
            return max(Query(left,mid,2*i) , Query(mid+1,right,2*i+1));
    }
    
    
    
    void  Update(int id,int value,int i)//更新节点id值为value
    {
        if(b[i].left==b[i].right)
        {
            b[i].sum=value;
            return ;
        }
    
    
            int mid =(b[i].left+b[i].right)/2;
            if(mid>=id) 
                Update(id,value,2*i);
            if(id>mid) 
                Update(id ,value,2*i+1);
            b[i].sum=max(b[i*2].sum , b[2*i+1].sum);//注意更新的时候不仅更新子节点，还要更新父节点
    
    }
    
    
    int main()
    {
        int  n,m;
        while ( scanf  ("%d%d",&n,&m)!=EOF )
        {
            for (int i=1;i<=n;i++)
                scanf ("%d",&a[i]);
    
            build2(1,n,1);
    
            char ss[10];
            int c,d;
            for (int i=0;i<m;i++)
            {
                scanf ("%s",ss);
                scanf ("%d%d",&c,&d);
                if (strcmp (ss,"Q") == 0)
                {
                    printf("%d\n",Query (c,d,1));
                }
                else
                {
                    Update (c,d,1);
                }
            }
        }
        return 0;
    }

  
  

