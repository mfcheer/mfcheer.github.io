---
title: LightOJ 1433 - Minimum Arc Distance
date: 2015-10-29 21:03:34
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-da41acc1f3
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/49496939

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1433
](http://www.lightoj.com/volume_showproblem.php?problem=1433)

题意：给你圆心坐标及圆上的两点坐标，求两点距离。  
求对应的圆心角度再求距离。水~

代码：

    
    
    #include <iostream>
    #include <stdio.h>
    #include <cmath>
    #include <string>
    #include <string.h>
    
    using namespace std;
    
    int main()
    {
        double x0, y0, x1, y1, x2, y2;
        int t, cases1 = 1;
        scanf("%d", &t);
        while (t--)
        {
            scanf("%lf%lf%lf%lf%lf%lf", &x0, &y0, &x1, &y1, &x2, &y2);
            printf("Case %d: ", cases1++);
            double dis1 = sqrt((x1 - x0)*(x1 - x0) + (y1 - y0)*(y1 - y0));
            double dis2 = sqrt((x1 - x2)*(x1 - x2) + (y1 - y2)*(y1 - y2));
    
            double tmp = asinf(dis2*1.0 / 2 / dis1);
    
            double l = 2.0 *dis1;
    
            double ans = (tmp) * l;
            printf("%.6lf\n",ans);
        }
        return 0;
    }

