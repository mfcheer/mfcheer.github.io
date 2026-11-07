---
title: LightOJ 1067 - Combinations【Lucas定理】
date: 2016-03-14 08:46:07
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4793cabcd8
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/50883535

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1067
](http://www.lightoj.com/volume_showproblem.php?problem=1067)

题意： 组合数求模，Lucas定理

代码：

    
    
    #include <stdio.h>  
    #include <math.h>  
    #include <stdlib.h>  
    #include <algorithm>  
    #include <string.h>    
    #include <iostream>
    
    using namespace std;
    
    const long long MOD = 1000003;
    
    long long pow(long long a, long long b, long long c)
    {
        long long tmp = 1;
        while (b)
        {
            if (b & 1) tmp = (tmp*a) % c;
            a = (a*a) % c;
            b >>= 1;
        }
        return tmp;
    }
    
    long long fac[1000005];
    
    void get_fac(long long p)
    {
        fac[0] = 1;
        for (int i = 1;i <= p;i++)
            fac[i] = (fac[i - 1] * i) % p;
    }
    
    long long Lucas(long long n, long long m, long long p)
    {
        long long tmp = 1;
        while (n && m)
        {
            long long a = n%p, b = m%p;
            if (a < b) return 0;
            tmp = (tmp * fac[a] * pow(fac[b] * fac[a - b] % p, p - 2, p)) % p;
    
            n /= p;
            m /= p;
        }
        return tmp;
    }
    
    int n, m;
    
    int main()
    {
        get_fac(MOD);
        int T;
        scanf("%d", &T);
        for (int t = 1;t <= T;t++)
        {
            scanf("%d %d", &n, &m);
            int ans = Lucas(n, m, MOD);
            printf("Case %d: %d\n", t, ans);
        }
        return 0;
    }

