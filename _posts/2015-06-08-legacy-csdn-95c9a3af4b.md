---
title: LightOJ 1030 Discovering Gold【概率】
date: 2015-06-08 20:26:31
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-95c9a3af4b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46417221

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1030
](http://www.lightoj.com/volume_showproblem.php?problem=1030)  
题意：基础概率题。  
代码：

    
    
    #include <stdio.h>
    #include <string.h>
    #include <vector>  
    #include <string>  
    #include <algorithm>  
    #include <iostream>
    #include <iterator>
    #include <fstream>
    #include <set>
    #include <map>
    #include <math.h>
    
    using namespace std;
    
    double dp[1010];
    
    int main()
    {
        int i, j, t, n, ca = 0;
        cin >> t;
        while (t--)
        {
            memset(dp, 0,sizeof(dp));
            cin >> n;
            for (int i = 1; i <= n;i++)
                scanf("%lf", &dp[i]);
    
            for (int i = n-1; i >= 1; i--)
                for (int j = 1; j <= 6; j++)
                    dp[i] += dp[i+j] / min(6, n - i);
            printf("Case %d: %.6lf\n", ++ca, dp[1]);
    
        }
        return 0;
    }

