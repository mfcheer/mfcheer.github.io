---
title: wustoj 1593 Count Zeros【线段树】
date: 2016-04-25 17:17:35
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4cc2c349fc
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/51243730

题目： [ http://acm.wust.edu.cn/problem.php?id=1593&soj=0
](http://acm.wust.edu.cn/problem.php?id=1593&soj=0)

解法：线段树维护因子2 5存在的个数。并判断是不是存在0

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
    
    const int N = 200010;
    
    using namespace std;
    
    int m, n;
    int a[N];
    
    struct node
    {
        int left;
        int right;
        int sum2, sum5;
        bool is;
    };
    
    struct segtree
    {
        node tree[N * 4];
    
        void buildtree(int left, int right, int ind)
        {
            tree[ind].left = left;
            tree[ind].right = right;
            tree[ind].sum2 = tree[ind].sum5 = 0;
            tree[ind].is = false;
    
            if (left == right)
            {
                if (a[left] == 0)
                {
                    tree[ind].is = true;
                    return;
                }
    
                int tmp1 = a[left];
                while (tmp1 != 0 && tmp1 % 2 == 0)
                {
                    tree[ind].sum2++;
                    tmp1 /= 2;
                }
    
                tmp1 = a[left];
                while (tmp1 != 0 && tmp1 % 5 == 0)
                {
                    tree[ind].sum5++;
                    tmp1 /= 5;
                }
            }
            else
            {
                int mid = (tree[ind].left + tree[ind].right) / 2;
    
                buildtree(left, mid, 2*(ind));
                buildtree(mid + 1, right,2*(ind) + 1);
    
                tree[ind].sum2 = (tree[2*(ind)].sum2 + tree[2*(ind) + 1].sum2);
                tree[ind].sum5 = (tree[2*(ind)].sum5 + tree[2*(ind) + 1].sum5);
                tree[ind].is = (tree[2*(ind)].is || tree[2*(ind) + 1].is);
            }
        }
    
        void update(int pos, int ind, int val)
        {
            if (tree[ind].left == tree[ind].right)
            {
                if (val == 0)
                    tree[ind].is = true;
                else
                    tree[ind].is = false;
    
                int tmp1;
                tree[ind].sum2 = 0;
                tmp1 = val;
                while (tmp1 != 0 && tmp1 % 2 == 0)
                {
                    tree[ind].sum2++;
                    tmp1 /= 2;
                }
    
                tree[ind].sum5 = 0;
                tmp1 = val;
                while (tmp1 != 0 && tmp1 % 5 == 0)
                {
                    tree[ind].sum5++;
                    tmp1 /= 5;
                }
            }
            else
            {
                int mid = (tree[ind].left + tree[ind].right)/2;
                if (pos <= mid)
                    update(pos, 2*(ind), val);
                else
                    update(pos, 2*(ind) + 1, val);
                tree[ind].sum2 = (tree[2*(ind)].sum2 + tree[2*(ind)+1].sum2);
                tree[ind].sum5 = (tree[2*(ind)].sum5 + tree[2*(ind) + 1].sum5);
                tree[ind].is = (tree[2*(ind)].is || tree[2*(ind) + 1].is);
            }
        }
    
        int query2(int st, int ed, int ind)
        {
            int left = tree[ind].left;
            int right = tree[ind].right;
    
            if (st <= left && right <= ed)
            {
                return tree[ind].sum2;
            }
            else
            {
                int mid = (tree[ind].left + tree[ind].right) / 2;
                int sum1 = 0;
                int sum2 = 0;
                if (st <= mid)
                    sum1 = query2(st, ed, 2*(ind));
                if (ed > mid)
                    sum2 = query2(st, ed, 2*(ind) + 1);
                return (sum1 + sum2);
            }
        }
        int query5(int st, int ed, int ind)
        {
            int left = tree[ind].left;
            int right = tree[ind].right;
    
            if (st <= left && right <= ed)
                return tree[ind].sum5;
            else
            {
                int mid = (tree[ind].left + tree[ind].right) / 2;
                int sum1 = 0;
                int sum2 = 0;
                if (st <= mid)
                    sum1 = query5(st, ed, 2*(ind));
                if (ed > mid)
                    sum2 = query5(st, ed, 2*(ind) + 1);
                return (sum1 + sum2);
            }
        }
        bool query0(int st, int ed, int ind)
        {
            int left = tree[ind].left;
            int right = tree[ind].right;
    
            if (st <= left && right <= ed)
            {
                if (tree[ind].is == false)
                    return false;
                else
                    return true;
            }
            else
            {
                int mid = (tree[ind].left + tree[ind].right) / 2;
                int sum1 = 0;
                int sum2 = 0;
                if (st <= mid)
                    sum1 = query0(st, ed, 2*(ind));
                if (ed > mid)
                    sum2 = query0(st, ed, 2*(ind) + 1);
                return (sum1 || sum2);
            }
        }
    }seg;
    
    int main()
    {
        while (scanf("%d %d", &n, &m) != EOF)
        {
            for (int i = 1; i <= n; i++)
                scanf("%d", &a[i]);
    
            seg.buildtree(1, n, 1);
    
            int opr, c, d;
            while (m--)
            {
                scanf("%d", &opr);
                scanf("%d %d", &c, &d);
                if (opr == 0)
                {
                    int s2, s5;
                    bool s0 = seg.query0(c, d, 1);
                    s2 = seg.query2(c, d, 1);
                    s5 = seg.query5(c, d, 1);
    
                    int ans = min(s2, s5);
                    if (s0)
                        ans = 1;
                    printf("%d\n", ans);
                }
                else if (opr == 1)
                {
                    seg.update(c, 1, d);
                }
            }
        }
        return 0;
    }
    

