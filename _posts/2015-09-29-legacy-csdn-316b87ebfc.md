---
title: hdu 5492 Find a path【dp】
date: 2015-09-29 19:08:54
tags: ['dp']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-316b87ebfc
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48809987

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5492
](http://acm.hdu.edu.cn/showproblem.php?pid=5492)

原来公式（n+m-1）* ∑（ai - ai_ave）^2,求公式的最小值，即最小方差路径。  
公式展开化简后可以得到 (n+m-1)*s1-s2  
s1为ai平方和，s2为和的平方。  
dp[i][j][k] 表示 到达i行，j列时，ai的和为k时的最小平方和。

代码：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <string>
    #include <algorithm>
    #include <cmath>
    
    using namespace std;
    
    const int inf = 0x3f3f3f3f;
    
    int n, m;
    int dp[32][32][2000];
    int a[32][32];
    
    int main()
    {
        int t, cases = 1;
        scanf("%d",&t);
        while (t--)
        {
            memset(dp, inf, sizeof(dp));
            memset(a, 0, sizeof(a));
    
            scanf("%d%d", &n, &m);
            for (int i = 0;i < n;i++)
                for (int j = 0;j < m;j++)
                    scanf("%d", &a[i][j]);
    
            dp[0][0][a[0][0]] = a[0][0] * a[0][0];
    
            for (int i = 0;i < n;i++)
                for (int j = 0;j < m;j++)
                {
                    if (i + 1 < n)
                    {
                        for (int k = 0;k <= 59 * 30;k++)
                            if (dp[i][j][k] != inf)
                                dp[i + 1][j][k + a[i + 1][j]] = min(dp[i + 1][j][k + a[i + 1][j]], dp[i][j][k] + a[i + 1][j] * a[i + 1][j]);
                    }
                    if (j + 1 < m)
                    {
                        for (int k = 0;k <= 59 * 30;k++)
                            if (dp[i][j][k] != inf)
                                dp[i][j + 1][k + a[i][j + 1]] = min(dp[i][j + 1][k + a[i][j + 1]], dp[i][j][k] + a[i][j + 1] * a[i][j + 1]);
                    }
                }
            int ans = inf;
            for (int i = 0;i <= 59 * 30;i++)
                if (dp[n-1][m-1][i]!=inf)
                ans = min(ans, (n + m - 1)*dp[n - 1][m - 1][i] - i*i);
            printf("Case #%d: %d\n", cases++, ans);
        }
        return 0;
    }

