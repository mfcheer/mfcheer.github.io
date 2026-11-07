---
title: poj-2229
date: 2014-10-18 10:22:24
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-deb7e1deab
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40208871

DP问题

状态转移方程：如果i%2！=0

dp[i]=dp[i-1]

否则

dp[i]=dp[i-1]+dp[i/2]

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <string.h>
    #include <string>
    #include <sstream>
    #include <stdlib.h>
    #include <malloc.h>
    
    using namespace std;
    
    int dp[1000010];
    
    int main ()
    {
        dp[1]=1;
        dp[2]=2;
        for (int i=3;i<=1000002;i++)
        {
            if (i%2 != 0)
                dp[i]=dp[i-1];
            else
            {
                dp[i]=dp[i-1]+dp[i/2];
                dp[i]=dp[i]%1000000000;
            }
        }
        int n;
        while (cin>>n)
        {
    
        cout<<dp[n]<<endl;
        }
        return 0;
    }

  
  

