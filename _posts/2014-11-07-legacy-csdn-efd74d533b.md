---
title: HDU-1421
date: 2014-11-07 21:43:51
tags: ['acm', 'dp']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-efd74d533b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40900153

题目传送门： [ hdu1421 ](http://acm.hdu.edu.cn/showproblem.php?pid=1421)

解题思路：

一道DP题

给定n个物品，每个物品有重量，  
从中选出m对，使得这m对物品重量差的平方和最小。  
疲劳度：m对物品重量差的平方和  
分析与解题思路  
先对n中物品的重量排序  
令dp[i][j]表示前i个物品中选j对的最小疲劳度。  
则dp[i][j]可能含有第i个物品(这种情况下,第i种物品一定是和第i-1个物品配对)，  
则dp[i][j]=dp[i-2][j-1]+(val[i]-val[i-1])*(val[i]-val[i-1])  
dp[i][j]的j对也可能不含有第i个物品，此时有  
dp[i][j]=dp[i-1][j]  
状态转移方程  
dp[i][j]=min{dp[i-2][j-1]+(val[i]-val[i-1])*(val[i]-val[i-1]),dp[i-1][j]

  

    
    
    #include<stdio.h>
    #include<stdlib.h>
    #include<malloc.h>
    #include<string.h>
    #include<string.h>
    #include<algorithm>
    
    using namespace std;
    
    int n,k;
    long long  dp[2005][1005];
    long long  p[2005];
    
    long long  min (long long  a ,long long  b )
    {
    	return a<b?a:b;
    }
    
    int cmp(const void* a,const void* b)  
    {  
      return *(int*)a-*(int*)b;  
    }  
    
    int main()
    {
    	while (scanf ("%d%d",&n,&k) != EOF)
    	{
    		for (int i =1 ;i<=n;i++)
    			scanf ("%I64d",&p[i]);
    
    		qsort (p+1,n,sizeof (p[0]),cmp);
    
    		for (int i =1 ;i<=n;i++)
    			for (int j=1 ;j<=k;j++)
    			{
    				dp[i][j]=2147483646 ;
    			}
    
    		for (int i = 2 ;i<=n;i++ )
    		{
    			for (int j=1 ;j*2<=i;j++)
    			{
    				dp[i][j] = min ( dp[i-1][j],dp[i-2][j-1] + (p[i]-p[i-1])*(p[i]-p[i-1]) );
    			}
    
    		}
    		printf("%I64d\n",dp[n][k]);
    	}
    	return 0;
    }
    

  
  

