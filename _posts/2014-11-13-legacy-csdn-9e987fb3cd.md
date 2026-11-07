---
title: hdu-2845
date: 2014-11-13 15:34:37
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9e987fb3cd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41080193

  

**题目链接：[ http://acm.hdu.edu.cn/showproblem.php?pid=2845
](http://acm.hdu.edu.cn/showproblem.php?pid=2845) **

**思路：动态规划**

**对于一行来说，相邻的数不可同时取，** **容易得到状态转移方程：**

dp[i]=max(dp[i-2]+a[i],dp[i-1]); **然后取每一行的最大得b[i] ,又可看作一行相同处理**

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string.h>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    #include<sstream>
    #include<time.h>
    #include<utility>
    #include<malloc.h>
    #include<stdexcept>
    
    using namespace std;
    
    int n,m;
    
    int p[200010];
    int q[200010];
    int dp[200010];
    
    int main()
    {
        while (scanf ("%d %d",&n,&m)!=EOF)
        {
            for(int i=1 ;i<=n;i++)
            {
                memset(dp,0,sizeof(dp));
                for(int j=1 ;j<=m;j++)
                    scanf("%d",&p[j]);
    
                dp[0]=p[0]=0;
                dp[1] = p[1];
                for(int j=2 ;j<=m;j++)
                    dp[j] = max ( dp[j-2] + p[j] ,dp[j-1]);
    
                q[i]= dp[m];
            }
    
            dp[0] = q[0] =0;
            dp[1] = q[1];
            for(int i=2 ;i<=n;i++)
                dp[i]=max(dp[i-2] + q[i] ,dp[i-1]);
    
            printf("%d\n",dp[n]);
        }
        return 0;
    }
    

  
  

