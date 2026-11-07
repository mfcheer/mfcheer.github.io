---
title: light oj 1236 【大数分解】
date: 2015-03-11 21:49:33
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c9dbebaeea
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44205833

给定一个大数，分解质因数，每个质因子的个数为e1,e2,e3,……em，

则结果为((1+2*e1)*(1+2*e2)……(1+2*em)+1)/2.

    
    
    //light oj 1236 大数分解素因子
    
    #include <stdio.h>  
    #include <iostream>  
    #include <string.h>  
    #include <algorithm>  
    #include <math.h>  
    #include <ctype.h>  
    #include <time.h>  
    #include <queue>  
    #include <iterator>  
    
    const int MAXN = 10000200;
    
    bool com[MAXN];
    int primes;
    long long prime[MAXN/10];
    long long ans, t, n;
    
    void init(int n)
    {
    	primes = 0;
    	memset(com, false, sizeof(com));
    	com[0] = com[1] = true;
    	for (int i = 2; i <= n; ++i)
    	{
    		if (!com[i])
    		{
    			prime[++primes] = i;
    		}
    		for (int j = 1; j <= primes && i*prime[j] <= n; ++j)
    		{
    			com[i*prime[j]] = true;
    			if (!(i % prime[j]))
    				break;
    		}
    	}
    }
    
    long long solve(long long n)//大数分解
    {
    	ans = 1;
    	for (int i = 1; i<=primes && prime[i] * prime[i] <= n; i++)
    	{
    		if (n % prime[i] == 0)
    		{
    			t = 1;
    			n /= prime[i];
    			while (n%prime[i] == 0)
    			{
    				t++;
    				n /= prime[i];
    			}
    			ans *= (1 + 2 * t);
    		}
    	}
    	if (n > 1)
    		ans *= 3;
    	return (1+ans) / 2;
    }
    
    int main()
    { 
    	init(10000000);
    	int tt, cases = 1;
    	scanf("%d",&tt);
    	while (tt--)
    	{
    		scanf("%lld",&n);
    		long long res = solve(n);
    		printf("Case %d: %lld\n",cases++,res);
    	}
    	return 0;
    }

  
  

