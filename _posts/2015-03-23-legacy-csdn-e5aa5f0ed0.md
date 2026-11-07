---
title: uva 10689 Yet another Number Sequence【矩阵快速幂】
date: 2015-03-23 17:14:45
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e5aa5f0ed0
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44566343

Yet another Number Sequence  
Time Limit:3000MS Memory Limit:0KB 64bit IO Format:%lld & %llu  
Submit

Status  
Description  
Download as PDF  
Problem B  
Yet another Number Sequence  
Input: standard input  
Output: standard output  
Time Limit: 3 seconds

Let’s define another number sequence, given by the following function:  
f(0) = a  
f(1) = b  
f(n) = f(n-1) + f(n-2), n > 1  
When a = 0 and b = 1, this sequence gives the Fibonacci Sequence. Changing the
values of a and b , you can get many different sequences. Given the values of
a, b, you have to find the last m digits of f(n) .  
Input

The first line gives the number of test cases, which is less than 10001. Each
test case consists of a single line containing the integers a b n m. The
values of a and b range in [0,100], value of n ranges in [0, 1000000000] and
value of m ranges in [1, 4].

Output  
For each test case, print the last m digits of f(n). However, you should NOT
print any leading zero.

Sample Input Output for Sample Input  
4  
0 1 11 3  
0 1 42 4  
0 1 22 4  
0 1 21 4

89  
4296  
7711  
946  
Problem setter: Sadrul Habib Chowdhury  
Special Thanks: Derek Kisman, Member of Elite Problem Setters’ Panel

矩阵快速幂；构建矩阵

    
    
    base.m[0][0] = 0;base.m[0][1] = 1;
    base.m[1][0] = 1;base.m[1][1] = 1;
    
    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    struct node
    {
        int m[2][2];
    }ans, base;
    
    int a,b,n,m;
    
    node multi(node a, node b)
    {
        node tmp;
        for (int i = 0; i<2; i++)
            for (int j = 0; j<2; j++)
            {
                tmp.m[i][j] = 0;
                for (int k = 0; k<2; k++)
                {
                    tmp.m[i][j] += (a.m[i][k] * b.m[k][j]);
                    tmp.m[i][j] %= m;
                }
            }
        return tmp;
    }
    
    void fast_mod(int n)// 求矩阵 base 的  n 次幂 
    {
        base.m[0][1] = base.m[1][0] = base.m[1][1] = 1;
        base.m[0][0] = 0;
        ans.m[0][0] = ans.m[1][1] = 1;// ans 初始化为单位矩阵
        ans.m[0][1] = ans.m[1][0] = 0;
        while (n)
        {
            if (n & 1) //实现 ans *= t; 其中要先把 ans赋值给 tmp，然后用 ans = tmp * t 
                ans = multi(ans, base);
            base = multi(base, base);
            n >>= 1;
        }
    }
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while (t--)
        {
            scanf("%d%d%d%d",&a,&b,&n,&m);      
            m = pow(10, m);
            if (n == 0)
            {
                printf("%d\n", (a%m + m) % m);
                continue;
            }
            if (n == 1)
            {
                printf("%d\n", (b%m + m) % m);
                continue;
            }
            fast_mod(n-1);
            int tmp = ((ans.m[1][0] * a + ans.m[1][1] * b) % m + m) % m;
            printf("%d\n", tmp);
        }
        return 0;
    }

