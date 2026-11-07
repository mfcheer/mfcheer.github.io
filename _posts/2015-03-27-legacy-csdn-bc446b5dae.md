---
title: poj 1006 生理周期 【中国剩余定理】
date: 2015-03-27 16:31:04
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bc446b5dae
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44678667

生理周期  
Time Limit: 1000MS Memory Limit: 10000K  
Total Submissions: 117999 Accepted: 37040  
Description

人生来就有三个生理周期，分别为体力、感情和智力周期，它们的周期长度为23天、28天和33天。每一个周期中有一天是高峰。在高峰这天，人会在相应的方面表现出色。例如，智力周期的高峰，人会思维敏捷，精力容易高度集中。因为三个周期的周长不同，所以通常三个周期的高峰不会落在同一天。对于每个人，我们想知道何时三个高峰落在同一天。对于每个周期，我们会给出从当前年份的第一天开始，到出现高峰的天数（不一定是第一次高峰出现的时间）。你的任务是给定一个从当年第一天开始数的天数，输出从给定时间开始（不包括给定时间）下一次三个高峰落在同一天的时间（距给定时间的天数）。例如：给定时间为10，下次出现三个高峰同天的时间是12，则输出2（注意这里不是3）。  
Input

输入四个整数：p, e, i和d。 p, e, i分别表示体力、情感和智力高峰出现的时间（时间从当年的第一天开始计算）。d 是给定的时间，可能小于p, e,
或 i。 所有给定时间是非负的并且小于365, 所求的时间小于21252。

当p = e = i = d = -1时，输入数据结束。  
Output

从给定时间起，下一次三个高峰同天的时间（距离给定时间的天数）。

采用以下格式：  
Case 1: the next triple peak occurs in 1234 days.

注意：即使结果是1天，也使用复数形式“days”。  
Sample Input

0 0 0 0  
0 0 0 100  
5 20 34 325  
4 5 6 7  
283 102 23 320  
203 301 203 40  
-1 -1 -1 -1   
Sample Output

Case 1: the next triple peak occurs in 21252 days.  
Case 2: the next triple peak occurs in 21152 days.  
Case 3: the next triple peak occurs in 19575 days.  
Case 4: the next triple peak occurs in 16994 days.  
Case 5: the next triple peak occurs in 8910 days.  
Case 6: the next triple peak occurs in 10789 days.  
Source

East Central North America 1999

裸的中国剩余定理

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    int p, e, i, d;
    
    long long ext_gcd(long long a, long long b, long long &x, long long &y)
    {
        if (a == 0 && b == 0) return -1;
        if (b == 0)
        {
            x = 1;
            y = 0;
            return a;
        }
        long long d = ext_gcd(b, a%b, y, x);
        y -= a / b*x;
        return d;
    }
    
    //求逆元素
    // ax=1(mod n)
    long long mod_reverse(long long a, long long n)
    {
        long long x, y;
        long long d = ext_gcd(a, n, x, y);
        if (d == 1)
            return (x%n + n) % n;
        else
            return -1;
    }
    
    int cases = 1;
    
    int main()
    {
        while (cin >> p >> e >> i >> d)
        {
            if (p == -1 && e == -1 && i == -1 && d == -1)
                return 0;
            int d1 = p * 33 * 28 * mod_reverse(33 * 28, 23);
            int d2 = e * 23 * 33 * mod_reverse(23 * 33, 28);
            int d3 = i * 23 * 28 * mod_reverse(23 * 28, 33);
            int ans = ((d1 + d2 + d3 - d) % (23 * 28 * 33) + (23 * 28 * 33)) % (23 * 28 * 33);
            if (ans == 0) ans = (23 * 28 * 33);
            printf("Case %d: the next triple peak occurs in %d days.\n",cases++,ans);
        }
        return 0;
    }

