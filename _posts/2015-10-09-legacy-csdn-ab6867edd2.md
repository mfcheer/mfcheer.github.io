---
title: poj 3280 Cheapest Palindrome【区间DP】
date: 2015-10-09 17:57:09
tags: ['poj', 'dp']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ab6867edd2
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49003459

题目链接： [ http://poj.org/problem?id=3280 ](http://poj.org/problem?id=3280)

题意：  
给你一个字符串以及添加和删除每个字符的代价，求使得原串变为回文串的最小的代价。

解法：  
dp[i][j]表示使得i到j变为回文的最小代价。  
dp[i][j] =
min(dp[i+1][j]+add[i],dp[i+1][j]+del[i],dp[i][j-1]+add[j],dp[i][j-1]+del[j])  
如果i j 相同 dp[i][j] = min(dp[i][j],dp[i+1][j-1]);

代码：

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    #include <ctype.h>
    #include <algorithm>
    #include <vector>
    #include <string.h>
    #include <queue>
    #include <stack>
    #include <set>
    #include <map>
    #include <string>
    #include <sstream>
    #include <malloc.h>
    
    using namespace std;
    
    int n, m;
    char s[5010];
    
    struct Node
    {
        int add;
        int es;
    }a[100];
    
    int dp[3010][3010];
    
    int main()
    {
        while (scanf("%d%d", &n, &m) != EOF)
        {
            scanf("%s", s + 1);
            char c[5];
            int u, v;
    
            memset(dp, 0, sizeof(dp));
    
            for (int i = 1;i <= n;i++)
            {
                cin >> c >> u >> v;;
                a[c[0] - 'a'].add = u;
                a[c[0] - 'a'].es = v;
            }
            for (int i = m - 1;i >= 1;i--)
            {
                for (int j = i;j <= m;j++)
                {
                    dp[i][j] = min(dp[i + 1][j] + a[s[i] - 'a'].add, dp[i + 1][j] + a[s[i] - 'a'].es);
                    int tmp = min(dp[i][j - 1] + a[s[j] - 'a'].add, dp[i][j - 1] + a[s[j] - 'a'].es);
                    dp[i][j] = min(dp[i][j], tmp);
                    if (s[i] == s[j])
                        dp[i][j] = min(dp[i][j], dp[i + 1][j - 1]);
                }
            }
            printf("%d\n", dp[1][m]);
        }
        return 0;
    }

