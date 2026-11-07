---
title: LightOJ 1082 - Array Queries【线段树最值】
date: 2015-10-10 18:28:45
tags: ['线段树', 'lightoj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-6ef6e488fa
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49027647

题目链接：  
[ http://www.lightoj.com/volume_showproblem.php?problem=1082
](http://www.lightoj.com/volume_showproblem.php?problem=1082)

一水~

代码：

    
    
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
    
    const int N = 1001000;
    
    using namespace std;
    
    int t, n, m;
    
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
                tree[ind].sum = min(tree[ll(ind)].sum, tree[rr(ind)].sum);
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
                int ans = 1e6;
                if (st <= mid)
                    ans = min(query(st, ed, ll(ind)),ans);
                if (ed > mid)
                    ans = min(ans,query(st, ed, rr(ind)));
                return ans;
            }
        }
    }seg;
    
    int main()
    {
        int t,cases=1;
        scanf("%d",&t);
        while (t--)
        {
            printf("Case %d:\n",cases++);
            scanf("%d %d", &n, &m);
            memset(a,0,sizeof(a));
            for (int i = 1; i <= n; i++)
            {
                scanf("%d", &a[i]);
            }
            seg.buildtree(1, n, 1);
            for(int i=0;i<m;i++)
            {
                int c, d;
                scanf("%d %d", &c, &d);
                printf("%d\n", seg.query(c, d, 1));
            }
        }
        return 0;
    }
    

