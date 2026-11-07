---
title: 最大化平均值 【二分法】
date: 2015-03-27 18:09:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-43f85db5eb
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44680343

n个物品重量价值分别为wi,vi；取k个值使得单位重量的价值最大。  
输入：  
n k  
接下来n行表示重量  
接下来n行表示价值

分析：  
贪心是错的。  
使的vi/wi最大 ，假设单位重量的最大价值为x。  
则vi /wi >=x  
即vi-wi*x>=0  
所以按照上面公式排序二分求解。

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    const int MAXN = 1010;
    int n, k;
    struct node
    {
        double w;
        double v;
    }p[MAXN];
    
    double q[MAXN];
    
    bool cmp(double a, double b)
    {
        return a > b;
    }
    
    bool  c(double x)
    {
        for (int i = 0; i < n; i++)
            q[i] = p[i].v - x*p[i].w;
        sort(q, q + n,cmp);
        double sum = 0;
        for (int i = 0; i < k; i++)
            sum += q[i];
        if (sum >= 0)
            return true;
        else
            return false;
    }
    
    int main()
    {
        while (cin >> n>>k)
        {
            for (int i = 0; i < n; i++)
                cin >> p[i].w;
            for (int i = 0; i < n; i++)
                cin >> p[i].v;
    
            double ans = 0;
            double down = 0, up = 1e9;
    
            for (int i = 0; i < 100; i++)
            {
                double mid = (down + up) / 2;
                if (c(mid))
                    down = mid;
                else
                    up = mid;
            }
            printf("%.2lf\n",up);
        }
        return 0;
    }

