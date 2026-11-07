---
title: 快速乘法计算模幂
date: 2015-03-15 21:01:40
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-8beecee685
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44280737

一般的快速模幂可能会产生整数溢出的情况 ，可以用快速乘法解决此问题 。

模板如下：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    #include <string>
    
    using namespace std;
    
    long long mult_mod(long long a, long long b, long long c)
    {
    	a %= c;
    	b %= c;
    	long long ret = 0;
    	long long tmp = a;
    	while (b)
    	{
    		if (b & 1)
    		{
    			ret += tmp;
    			if (ret > c)ret -= c;//直接取模慢很多
    		}
    		tmp <<= 1;
    		if (tmp > c)tmp -= c;
    		b >>= 1;
    	}
    	return ret;
    }
    long long pow_mod(long long a, long long n, long long mod)
    {
    	long long ret = 1;
    	long long temp = a%mod;
    	while (n)
    	{
    		if (n & 1)ret = mult_mod(ret, temp, mod);
    		temp = mult_mod(temp, temp, mod);
    		n >>= 1;
    	}
    	return ret;
    }
    
    int main()
    {
    	long long a, n, mod;
    	while (scanf("%lld%lld%lld", &a, &n, &mod) != EOF)
    	{
    		printf("%lld\n",pow_mod(a,n,mod));//a^n%mod
    	}
    }
    

  
  

  

  

  

