---
title: 51nod 1174 区间中最大的数【线段树】
date: 2015-10-02 19:52:35
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c77b52edee
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48862221

####  题目链接： [
http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1174
](http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1174)

好久没写线段树了，区间最大值，水题。。

代码:

    
    
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
    
    const int N = 100100;
    
    using namespace std;
    
    int t, n;
    
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
    
        void buildtree(int left, int right, int ind)
        {
            tree[ind].left = left;
            tree[ind].right = right;
            tree[ind].sum = 0;
    
            if (left == right)
                tree[ind].sum = a[left];
            else
            {
                int mid = tree[ind].mid();
                buildtree(left, mid, ll(ind));
                buildtree(mid + 1, right, rr(ind));
                tree[ind].sum = max(tree[ll(ind)].sum, tree[rr(ind)].sum);
            }
        }
    
        int query(int st, int ed, int ind)
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
                    sum1 = query(st, ed, ll(ind));
                if (ed > mid)
                    sum2 = query(st, ed, rr(ind));
    
                return max(sum1, sum2);
            }
        }
    }seg;
    
    int main()
    {
        while (scanf("%d", &n) != EOF)
        {
            for (int i = 1; i <= n; i++)
            {
                scanf("%d", &a[i]);
            }
    
            seg.buildtree(1, n, 1);
    
            int m;
            scanf("%d", &m);
            while(m--)
            {
                int c, d;
                scanf("%d%d", &c, &d);
                printf("%d\n", seg.query(c + 1, d + 1, 1));
            }
        }
        return 0;
    }

