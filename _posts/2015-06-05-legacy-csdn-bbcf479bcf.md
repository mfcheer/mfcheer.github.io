---
title: hdu 3336 Count the string 【kmp + dp】
date: 2015-06-05 18:12:20
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bbcf479bcf
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46380469

题目链接： [ http://acm.acmcoder.com/showproblem.php?pid=3336
](http://acm.acmcoder.com/showproblem.php?pid=3336)

题意：求给出的字符串的所有前缀出现的次数和。

dp的思想还是看的别人的题解。窝就不写啦。

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    #include <iterator>
    #include <vector>
    #include <set>
    
    using namespace std;
    
    const int MOD = 10007;
    int t, ans, n;
    char s[200010];
    
    void get_next(char x[], int m, int Next[])
    {
        memset(Next,0,sizeof(Next));
        int i, j;
        j = Next[0] = -1;
        i = 0;
        while (i < m)
        {
            while (-1 != j && x[i] != x[j]) j = Next[j];
            Next[++i] = ++j;
        }
    }
    
    int Next[200010];
    int dp[200010];
    
    int main()
    {
        cin >> t;
        while (t--)
        {
            ans = 0;
            memset(dp,0,sizeof(dp));
            cin >> n >> s;
            get_next(s, n, Next);
    
            for (int i = 1; i <= n; i++)
            {
                dp[i] = (dp[Next[i]] + 1) % MOD;
                ans = (ans + dp[i]) % MOD;
            }
            cout << ans << endl;
        }
        return 0;
    }

