---
title: poj 2096 Collecting Bugs【概率DP】
date: 2015-06-08 21:44:07
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ace6bfbce8
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46418345

题目链接： [ http://poj.org/problem?id=2096 ](http://poj.org/problem?id=2096)  
题意：  
一个软件有s个子系统，会产生n种bug。  
某人一天发现一个bug，这个bug属于某种bug，发生在某个子系统中。  
求找到所有的n种bug，且每个子系统都找到bug，这样所要的天数的期望。  
需要注意的是：bug的数量是无穷大的，所以发现一个bug，出现在某个子系统的概率是1/s，  
属于某种类型的概率是1/n。  
解法：  
dp[i][j]表示已经找到i种bug，并存在于j个子系统中，要达到目标状态的天数的期望。  
显然，dp[n][s]=0，因为已经达到目标了。而dp[0][0]就是我们要求的答案。  
dp[i][j]状态可以转化成以下四种：  
dp[i][j] 发现一个bug属于已经找到的i种bug和j个子系统中  
dp[i+1][j] 发现一个bug属于新的一种bug，但属于已经找到的j种子系统  
dp[i][j+1] 发现一个bug属于已经找到的i种bug，但属于新的子系统  
dp[i+1][j+1]发现一个bug属于新的一种bug和新的一个子系统  
所以：

dp[i][j] = i/n*j/s*dp[i][j] + (n-i)/n*j/s*dp[i+1][j] + i/n*(s-j)/s*dp[i][j+1]
+ (n-i)/n*(s-j)/s*dp[i+1][j+1] +1

移项得：

(1-i*j/n/s) _dp[i][j] = (n-i)/n*j/s*dp[i+1][j] + i/n_ (s-j)/s*dp[i][j+1] +
(n-i)/n*(s-j)/s*dp[i+1][j+1] +1

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
    
    double dp[1010][1010];
    int n, s;
    
    int main()
    {
        while (cin >> n >> s)
        {
            memset(dp,0,sizeof(dp));
    
            for (int i = n; i >= 0; i--)
                for (int j = s; j >= 0; j--)
                {
                    if (i == n && j == s) continue;
                    double ans1 = (double (n - i)*j)/n/s* dp[i + 1][j];
                    double ans2 = (double (s - j)*i)/n/s* dp[i][j + 1];
                    double ans3 = (double (n - i)*(s - j))/n/s* dp[i + 1][j + 1];
                    dp[i][j] = (ans1 + ans2 + ans3 + 1) / (1.0 - (double (i)*j/n/s));
                }
            printf("%.4lf",dp[0][0]);
        }
        return 0;
    }

