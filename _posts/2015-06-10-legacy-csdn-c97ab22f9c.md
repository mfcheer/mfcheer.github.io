---
title: LightOJ 1004 - Monkey Banana Problem 【DP】
date: 2015-06-10 15:06:20
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c97ab22f9c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46442033

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1004
](http://www.lightoj.com/volume_showproblem.php?problem=1004)  
题意：两个数塔相接，求最大的路径和。  
解法：简单ＤＰ。  
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
    
    int t, n;
    int dp[220][220];
    int p[220][220];
    
    int main()
    {
        scanf("%d",&t);
        for (int ca = 1; ca <= t;ca++)
        {
            scanf("%d",&n);
            int tmp = n - 1;
            int tmp2 = n - 1;
    
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= i; j++)
                    scanf("%d",&p[i][j]);
            for (int i = n + 1; i <= 2 * n - 1; i++)
                for (int j = 1; j <= 2 * n - i; j++)
                    scanf("%d", &p[i][j]);
    
            memset(dp,0,sizeof(dp));
    
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= i; j++)
                    dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - 1]) + p[i][j];
    
            for (int i = n + 1; i <= 2 * n - 1; i++)
                for (int j = 1; j <= 2 * n - i; j++)
                    dp[i][j] = max(dp[i-1][j],dp[i-1][j+1])+p[i][j];
    
            printf("Case %d: %d\n",ca,dp[2*n - 1][1]);
        }
        return 0;
    }

