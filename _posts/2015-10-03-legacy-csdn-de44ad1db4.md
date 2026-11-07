---
title: 51nod 1181 质数中的质数（质数筛法）
date: 2015-10-03 02:04:04
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-de44ad1db4
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48872087

####  题目链接： [
http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1181
](http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1181)

代码：

    
    
    #include <stdio.h>  
    #include <iostream>  
    #include <string.h>  
    #include <algorithm>  
    #include <math.h>  
    #include <stack>  
    #include <queue>  
    
    using namespace std;
    const int MAXN = 10000010;
    
    bool com[MAXN];
    int primes, prime[MAXN / 10];
    int num[MAXN];
    
    void solve(int n)
    {
        primes = 0;
        memset(com, false, sizeof(com));
        com[0] = com[1] = true;
        for (int i = 2; i <= n; ++i)
        {
            if (!com[i])
            {
                prime[++primes] = i;
                num[i] = primes;
            }
            for (int j = 1; j <= primes && i*prime[j] <= n; ++j)
            {
                com[i*prime[j]] = true;
                if (!(i % prime[j]))
                    break;
            }
        }
    }
    
    int main()
    {
        solve(1000010);
        int n;
        while (cin >> n)
        {
            while (!(!com[n] && !com[num[n]]))
            n++;
            cout << n << endl;
        }
        return 0;
    }
    

