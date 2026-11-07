---
title: hdu 2686 Matrix【多线程DP】
date: 2015-10-11 10:35:52
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-3e8abe1c7a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49046141

####  题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=2686
](http://acm.hdu.edu.cn/showproblem.php?pid=2686)

代码：

    
    
    #include<stdio.h>
    #include<iostream>
    #include<algorithm>
    #include<string.h>
    #include<queue>
    
    using namespace std;
    
    int n;
    int a[50][50];
    int dp[35][35][35][35];
    
    int main()
    {
        while (scanf("%d", &n) != EOF)
        {
            for (int i = 1;i <= n;i++)
                for (int j = 1;j <= n;j++)
                {
                    scanf("%d", &a[i][j]);
                }
    
            memset(dp,0,sizeof(dp));
    
            for (int i = 1;i <= n;i++)
                for (int j = 1;j <= n;j++)
                    for (int k = 1;k <= n;k++)
                        for (int l = 1;l <= n;l++)
                        {
                            if (i == k && j == l)
                            {
                                dp[i][j][k][l] = max(dp[i - 1][j][k - 1][l], max(dp[i-1][j][k][l-1],max(dp[i][j-1][k][l-1], dp[i][j-1][k-1][l]))) + a[i][j];
                            }
                            else 
                                dp[i][j][k][l] = max(dp[i - 1][j][k - 1][l], max(dp[i][j - 1][k - 1][l], max(dp[i - 1][j][k][l - 1], dp[i][j - 1][k][l - 1]))) + a[i][j] + a[k][l];
    
                        }
            printf("%d\n", dp[n][n][n][n]);
        }
        return 0;
    }

