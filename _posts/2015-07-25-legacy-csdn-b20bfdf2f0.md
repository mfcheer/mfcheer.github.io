---
title: Lightoj 1235 - Coin Change (IV) 【二分】
date: 2015-07-25 11:14:50
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b20bfdf2f0
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47054731

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1235
](http://www.lightoj.com/volume_showproblem.php?problem=1235)

题意： 有N个硬币（N<=18），问能否在每个硬币使用不超过两次的情况下支付正好K的面额。

思路 ：
dfs构造出用这些硬币用前一半能支付的所有费用和后一半能支付的所有费用。之后排序，枚举前一半的每个面值在第二个里面二分寻找即可。（或者用set保存）。

代码：（set）

    
    
    #include <stdio.h>
    #include <ctime>
    #include <math.h>
    #include <limits.h>
    #include <complex>
    #include <string>
    #include <functional>
    #include <iterator>
    #include <algorithm>
    #include <vector>
    #include <stack>
    #include <queue>
    #include <set>
    #include <map>
    #include <list>
    #include <bitset>
    #include <sstream>
    #include <iomanip>
    #include <fstream>
    #include <iostream>
    #include <ctime>
    #include <cmath>
    #include <cstring>
    #include <cstdio>
    #include <time.h>
    #include <ctype.h>
    #include <string.h>
    #include <assert.h>
    
    using namespace std;
    
    int n;
    int num1, num2;
    long long w;
    long long a[1000000];
    
    set <long long>s1;
    set <long long>s2;
    
    
    void dfs1(long long sum, int x, int num)
    {
        if (x == num1)
        {
            s1.insert(sum);
            return;
        }
        for (int i = 0; i <= 2; i++)
            dfs1(sum + a[x] * i,x + 1, num + 1);
    }
    
    void dfs2(long long sum,int x, int num)
    {
        if (x == n)
        {
            s2.insert(sum);
            return;
        }
        for (int i = 0; i <= 2; i++)
            dfs2(sum + a[x] * i, x + 1, num + 1);
    }
    
    
    
    int main()
    {
        int t;
        scanf("%d", &t);
        int cases = 1;
        while (t--)
        {
            s1.clear();
            s2.clear();
            memset(a, 0, sizeof(a));
    
            scanf("%d %lld", &n, &w);
    
            for (int i = 0; i < n; i++)
                scanf("%lld", &a[i]);
    
            num1 = n >> 1;
            num2 = n - num1;
    
            dfs1(0, 0, num1);
            dfs2(0, num1, n);
    
            int ok = 0;
    
            set <long long> ::iterator it;
            for (it = s1.begin(); it != s1.end(); it++)
            {
                int tmp = *it;
                //cout << tmp << endl;
                if (s2.count(w-tmp) != 0)
                {
                    ok = 1;
                    break;
                }
            }
    
            if (ok) printf("Case %d: Yes\n", cases++);
            else printf("Case %d: No\n", cases++);
        }
        return 0;
    }

