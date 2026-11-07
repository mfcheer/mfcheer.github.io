---
title: 51nod 1242 斐波那契数列的第N项【矩阵快速幂】
date: 2015-10-03 01:36:57
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4cbc03e08a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48871469

####  题目链接： [
http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1242
](http://www.51nod.com/onlineJudge/questionCode.html#!problemId=1242)

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    const int MOD = 1000000009;
    
    struct node
    {
        long long m[2][2];
    }ans, base;
    
    long long n;
    
    node multi(node a, node b)
    {
        node tmp;
        for (int i = 0;i<2;i++)
            for (int j = 0;j<2;j++)
            {
                tmp.m[i][j] = 0;
                for (int k = 0;k<2;k++)
                {
                    tmp.m[i][j] += (a.m[i][k] * b.m[k][j]);
                    tmp.m[i][j] %= MOD;
                }
            }
        return tmp;
    }
    
    long long fast_mod(long long n)// 求矩阵 base 的  n 次幂 
    {
        base.m[0][0] = base.m[0][1] = base.m[1][0] = 1;
        base.m[1][1] = 0;
        ans.m[0][0] = ans.m[1][1] = 1;// ans 初始化为单位矩阵
        ans.m[0][1] = ans.m[1][0] = 0;
        while (n)
        {
            if (n & 1) //实现 ans *= t; 其中要先把 ans赋值给 tmp，然后用 ans = tmp * t 
                ans = multi(ans, base);
            base = multi(base, base);
            n >>= 1;
        }
        return ans.m[0][1];
    }
    
    int main()
    {
        while (scanf("%lld", &n) != EOF)
        {
            int ans = fast_mod(n);
            printf("%lld\n", ans);
        }
        return 0;
    }

