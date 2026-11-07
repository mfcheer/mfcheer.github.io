---
title: LightOJ 1031 - Easy Game【区间dp】
date: 2016-02-28 16:58:40
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b43fcc6d00
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/50760717

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1031
](http://www.lightoj.com/volume_showproblem.php?problem=1031)

题意:  
给一个序列，两个人轮流在序列的两边取任意个数的number，但每次只能从选定的那一边取，问取得数字的和的较大者比较小者多多少？

思路：  
dp[i][j]表示i-j区间的最优解，然后枚举区间。

代码：

    
    
    #include <cstdio>
    #include <cstring>
    #include <queue>
    #include <algorithm>
    #include <iostream>
    
    using namespace std;
    
    int n;
    int a[110], sum[110];
    int dp[110][110];
    
    int main()
    {
        int t, cases = 1;
        scanf("%d", &t);
        while (t--)
        {
            memset(a, 0, sizeof(a));
            memset(dp, 0, sizeof(dp));
            memset(sum, 0, sizeof(sum));
    
            scanf("%d", &n);
            for (int i = 1;i <= n;i++)
            {
                scanf("%d", &a[i]);
                sum[i] = sum[i - 1] + a[i];
                dp[i][i] = a[i];
            }
    
            for (int p = 1;p <= n;p++)
            {
                for (int i = 1;i <= n - p;i++)
                {
                    int j = i + p;
                    dp[i][j] = sum[j] - sum[i - 1];
                    for (int k = i;k < j;k++)
                    {
                        int tmp = max(sum[k] - sum[i-1] - dp[k+1][j], sum[j] - sum[k] - dp[i][k]);
                        dp[i][j] = max(dp[i][j], tmp);
                    }
                }
            }
    
            printf("Case %d: %d\n", cases++, dp[1][n]);
        }
        return 0;
    }

