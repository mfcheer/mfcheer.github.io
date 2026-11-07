---
title: LA 3708 GRAVEYARD
date: 2015-06-05 23:44:33
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-67de0abe17
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383433

题意：

在一个具有n个等距建筑的圆形中插入m个，使得保持等距，求最短移动距离；

代码：

    
    
    #include <iostream>  
    #include <cstdio>  
    #include <cstring>  
    #include <algorithm>  
    #include <string>  
    #include <queue>  
    
    using namespace std;
    
    int n, m;
    double tol = 10000;
    
    int main()
    {
        while (scanf("%d%d", &n, &m) != EOF)
        {
            double ans = 0;
            for (int i = 1; i < n; i++)
            {
                double pos = (double)i / n*(n + m);
                ans += fabs(pos- floor(pos+0.5) )/ (n + m);
            }
            printf("%.4lf\n",ans*tol);
        }
        return 0;
    }

