---
title: DP经典5题 【DP】
date: 2015-06-05 23:38:32
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2cdde8c4ca
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383371

1.最大子段和

给定n个整数的序列{ N1, N2, …, Nn }，其任意连续子序列可表示为{ Ni, Ni+1, …, Nj }，其中 1 <= i <= j <=
K。最大连续子序列是所有连续子序中元素和最大的一个， 例如给定序列{ -2, 11, -4, 13, -5, -2 }，其最大连续子序列为{ 11, -4,
13 }，最大和为20。

    
    
    int n, a[100];
    int b = 0, ans = -1e9;
    void solve()
    {
        for (int i = 0; i < n; i++)
        {
            if (b > 0) b += a[i];
            else b = a[i];
            ans = max(ans, b);
        }
    }

2.数塔问题

要求从顶层走到底层，若每一步只能走到相邻的结点，则经过的结点的数字之和最大是多少？

自下而上进行状态转移。

    
    
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
    
    int dp[510][510];  
    
    int main ()  
    {  
        int n;  
        cin>>n;  
    
            memset (dp,0,sizeof(dp));  
            for (int i=1;i<=n;i++)  
                for (int j=1;j<=i;j++)  
                cin>>dp[i][j];  
    
            for (int i=n-1;i>=1;i--)  
            {  
                for (int j=1;j<=i;j++)  
                    dp[i][j]+=max (dp[i+1][j],dp[i+1][j+1]);  
            }  
            cout<<dp[1][1]<<endl;  
    
        return 0;  
    }

3.最长上升子序列

给你一个数组p[MAXN],求最长上升子序列长度（不要和字串搞混）。

    
    
    #include<stdio.h>  
    #include<iostream>  
    #include<math.h>  
    #include<stdlib.h>  
    #include<ctype.h>  
    #include<algorithm>  
    #include<vector>  
    #include<string>  
    #include<queue>  
    #include<stack>  
    #include<set>  
    #include<map>  
    
    using namespace std;  
    
    int n,p[1010],dp[1010];  
    
    int main()  
    {  
        while (scanf("%d", &n) != EOF)  
        {  
            for (int i = 1; i <= n; i++)  
                scanf("%d",&p[i]);  
    
            for (int i = 1; i <= n; i++)  
            {  
                dp[i] = 1;  
                for (int j = 1; j < i; j++)  
                {  
                    if (p[i] > p[j])  
                        dp[i] = max(dp[i],dp[j] + 1);  
                }  
            }  
            int ans = -1;  
            for (int i = 1; i <= n; i++)  
                ans = max(ans,dp[i]);  
            printf("%d\n",ans);  
        }  
        return 0;  
    }

4.最长公共子序列(LCS)  
两个数组s[100],t[100];

状态转移方程:

if (s[i+1]==t[j+1]) dp[i+1][j+1] = max(dp[i][j]+1,dp[i][j+1],dp[i+1][j])

else dp[i+1][j+1] = max(dp[i][j+1],dp[i+1][j])

    
    
    int s[100], t[100], n, m;
    int dp[110][110];
    void solve()
    {
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
            {
                if (s[i] == t[j])
                    dp[i + 1][j + 1] = max(dp[i][j] + 1, max(dp[i][j + 1], dp[i + 1][j]));
                else
                    dp[i + 1][j + 1] = max(dp[i][j + 1], dp[i + 1][j]);
            }
        int ans = dp[n][m];
    }

5.01背包问题

有编号分别为a,b,c,d,e的五件物品，它们的重量分别是2,2,6,5,4，它们的价值分别是6,3,5,4,6，现在给你个承重为10的背包，如何让背包里装入的物品具有最大的价值总和？

    
    
    #include<stdlib.h>  
    #include<ctype.h>  
    #include<algorithm>  
    #include<vector>  
    #include<string>  
    #include<queue>  
    #include<stack>  
    #include<set>  
    #include<map>  
    #include <string>  
    #include <sstream>  
    
    using namespace std;
    
    int main()
    {
        int t;
        scanf("%d", &t);
        int a[1000], c[1000], dp[10000];
        while (t--)
        {
            int n, v;
            scanf("%d%d", &n, &v);
    
            for (int i = 0; i<n; i++)
                scanf("%d", &a[i]);
            for (int i = 0; i<n; i++)
                scanf("%d", &c[i]);
    
            memset(dp, 0, sizeof(dp));
    
            for (int i = 0; i<n; i++)
                for (int j = v; j >= 0; j--)
                {
                    if (j - c[i] >= 0)
                        dp[j] = max(dp[j], dp[j - c[i]] + a[i]);
                }
            printf("%d\n", dp[v]);
        }
    }

