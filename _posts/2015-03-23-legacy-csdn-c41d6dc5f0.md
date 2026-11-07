---
title: Jzzhu and Sequences 【矩阵快速幂】
date: 2015-03-23 12:20:21
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c41d6dc5f0
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44562509

Jzzhu and Sequences  
Time Limit:1000MS Memory Limit:262144KB 64bit IO Format:%I64d & %I64u  
Submit

Status  
Description  
Jzzhu has invented a kind of sequences, they meet the following property:

![这里写图片描述](https://img-blog.csdn.net/20150323164556402)  
You are given x and y, please calculate fn modulo 1000000007(109 + 7).

Input  
The first line contains two integers x and y(|x|, |y| ≤ 109). The second line
contains a single integer n(1 ≤ n ≤ 2·109).

Output  
Output a single integer representing fn modulo 1000000007(109 + 7).

Sample Input  
Input  
2 3  
3  
Output  
1  
Input  
0 -1  
2  
Output  
1000000006  
Hint  
In the first sample, f2 = f1 + f3, 3 = 2 + f3, f3 = 1.

In the second sample, f2 =  - 1;  - 1 modulo (109 + 7) equals (109 + 6).

构造矩阵 ![这里写图片描述](https://img-blog.csdn.net/20150323121929167) 之后套模板即可；

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    const long long MOD = 1000000007;
    
    struct node
    {
        long long m[2][2];
    }ans,base;
    long long a,b;
    int n;
    
    node multi(node a,node b)
    {
        node tmp;
        for(int i=0;i<2;i++)
            for(int j=0;j<2;j++)
        {
            tmp.m[i][j] = 0;
            for(int k=0;k<2;k++)
            {
                tmp.m[i][j] = ((tmp.m[i][j] + a.m[i][k] * b.m[k][j]) % MOD + MOD)%MOD;
            }
        }
        return tmp;
    }
    
    void fast_mod(int n)// 求矩阵 base 的  n 次幂
    {
        base.m[0][0] = 0;base.m[0][1] = 1;
        base.m[1][0] = -1;base.m[1][1] = 1;
        ans.m[0][0] = ans.m[1][1] = 1;// ans 初始化为单位矩阵
        ans.m[0][1] = ans.m[1][0] = 0;
        while (n)
        {
            if (n&1) //实现 ans *= t; 其中要先把 ans赋值给 tmp，然后用 ans = tmp * t
                ans = multi(ans,base);
            base = multi(base,base);
            n>>=1;
        }
    }
    
    int main()
    {
        while (scanf("%lld %lld %d",&a,&b,&n)!=EOF)
        {
            if (n==1)
            {
                printf("%lld\n",(a%MOD + MOD)%MOD);
                continue;
            }
            if (n==2)
            {
                printf("%lld\n",(b%MOD + MOD)%MOD);
                continue;
            }
            fast_mod(n-2);
            long long anss = (((ans.m[1][0]*a+ans.m[1][1]*b) % MOD) + MOD) % MOD;
            printf("%lld\n",anss);
        }
        return 0;
    }
    

