---
title: Lightoj 1127 - Funny Knapsack 【二分】
date: 2015-07-25 09:26:21
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-02babbaa57
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47053287

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1127
](http://www.lightoj.com/volume_showproblem.php?problem=1127)

题意：有n个物体（n<30）和一个容量为W的容器，问将容器不装满的放置物品的方式有多少种。

思路 ：
状态压缩+二分。将前n/2个物体看做一个整体，将剩下的看做一个整体。1<<(n/2)个状态代表前一半的物品使用情况，然后求出每一种状态的总的体积。排序。对于后面的那一半也是。答案只需枚举一半然后在另一半中找和W差的下界即可。

代码：

    
    
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
    long long w;
    long long a[1000000];
    long long s1[1000000];
    long long s2[1000000];
    
    int main()
    {
        int t;
        scanf("%d", &t);
        int cases = 1;
        while (t--)
        {
            memset(s1, 0, sizeof(s1));
            memset(s2, 0, sizeof(s2));
            memset(a, 0, sizeof(a));
    
            scanf("%d %lld", &n, &w);
            for (int i = 0; i < n; i++)
                scanf("%lld", &a[i]);
    
            int t1 = n >> 1;
            int t2 = n - t1;
            int r1 = 1 << t1;
            int r2 = 1 << t2;
    
            for (int i = 0; i < r1; i++)
                for (int j = 0; j < t1; j++)
                {
                    if (i &(1 << j))
                        s1[i] += a[j];
                }
    
            for (int i = 0; i < r2; i++)
                for (int j = 0; j < t2; j++)
                {
                    if (i &(1 << j))
                        s2[i] += a[t1 + j];
                }
    
            sort(s2, s2 + r2 );
    
            long long ans = 0;
            for (int i = 0; i < r1; i++)
            {
                if (w - s1[i] >= 0)
                    ans += upper_bound(s2, s2 + r2, w - s1[i]) - s2;
            }
            printf("Case %d: %lld\n", cases++, ans);
        }
        return 0;
    }

