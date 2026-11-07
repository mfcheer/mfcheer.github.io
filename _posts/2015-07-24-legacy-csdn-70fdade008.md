---
title: Lightoj 1062 - Crossed Ladders【二分】
date: 2015-07-24 19:50:32
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-70fdade008
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47045881

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1062
](http://www.lightoj.com/volume_showproblem.php?problem=1062)

题意： 两个梯子靠墙放，一个长度是x一个长度是y，它们交点到地面的距离是c。求这两个梯子底部的距离。

思路：二分底部的距离t，往计算t’ ，根据t和t’的大小关系更新上下界即可。  
设宽为mid，那么可以求得  
c/sqrt( y^2 - mid^2 ) + c/sqrt( x^2 - mid ^2 ) = 1

代码：

    
    
    #include <stdio.h>
    #include <ctime>
    #include <math.h>
    #include <limits.h>
    #include <complex>
    #include <string>
    #include <functional>
    #include <iterator>
    #include <algorithm>
    #include <vector>
    #include <stack>
    #include <queue>
    #include <set>
    #include <map>
    #include <list>
    #include <bitset>
    #include <sstream>
    #include <iomanip>
    #include <fstream>
    #include <iostream>
    #include <ctime>
    #include <cmath>
    #include <cstring>
    #include <cstdio>
    #include <time.h>
    #include <ctype.h>
    #include <string.h>
    #include <assert.h>
    
    using namespace std;
    
    double x, y, c;
    
    int main()
    {
        int t;
        scanf("%d",&t);
        int cases = 1;
        while (t--)
        {
            cin >> x >> y >> c;
    
            double left = 0, right = min(x, y);
            double mid;
    
            while (left + 0.0000000000001 <= right)
            {
                mid = (left + right) / 2;
                double t1 = sqrt(x*x - mid*mid);
                double t2 = sqrt(y*y - mid*mid);
                double tmp = c / t1 + c / t2;
                if (tmp >= 1) right = mid;
                else left = mid;
            }
    
            printf("Case %d: ", cases++);
            printf("%.8lf\n",right);
        }
        return 0; 
    }
    

