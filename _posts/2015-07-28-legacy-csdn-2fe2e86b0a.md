---
title: hdu 5317 RGCDQ
date: 2015-07-28 20:39:47
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2fe2e86b0a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47110993

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5317
](http://acm.hdu.edu.cn/showproblem.php?pid=5317)

题意：F[i]表示i的因子的数目。 询问区间 [L,R] 中 gcd(F[i],F[j]) （L<= i <= R,L<= j <= R）的最大值

解法：用sum[i][j] 表示 前 i 个F值中有多少 j

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
    
    #define N 1000000
    int f[N + 7];
    int sum[N][8];//sum[i][j] 表示 前 i  F 值中有多少 j
    
    void init()
    {
        memset(f, 0, sizeof(f));
        memset(sum, 0, sizeof(sum));
        for (int i = 2; i <= N; i++)
        {
            if (f[i] == 0)
            {
                for (int j = i; j <= N; j += i)
                    f[j]++;
            }
        }
        for (int i = 1; i <= N; i++)
        {
            for (int j = 1; j <= 7; j++)
                sum[i][j] = sum[i - 1][j];
            sum[i][f[i]]++;
        }
    }
    
    int main()
    {
        init();
        int T;
        scanf("%d", &T);
        int sb[8];
        while (T--)
        {
            int l, r;
            scanf("%d %d", &l, &r);
            for (int i = 1; i <= 7; i++)
            {
                sb[i] = sum[r][i] - sum[l - 1][i];
            }
            int ans;
            for (int i = 1; i <= 7; i++)
            {
                if (sb[i] >= 2)
                    ans = i;
            }
            if (sb[2] && sb[4])
                ans = max(ans, 2);
            if (sb[2] && sb[6])
                ans = max(ans, 2);
            if (sb[4] && sb[6])
                ans = max(ans, 2);
            if (sb[3] && sb[6])
                ans = max(ans, 3);
            printf("%d\n", ans);
        }
        return 0;
    }

