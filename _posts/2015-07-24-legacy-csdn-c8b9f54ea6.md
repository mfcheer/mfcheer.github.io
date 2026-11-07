---
title: hdu 5301 Buildings
date: 2015-07-24 10:14:28
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c8b9f54ea6
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47036895

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5301
](http://acm.hdu.edu.cn/showproblem.php?pid=5301)

题意：
n*m的矩阵，删除一个格子x,y。用矩形来填充矩阵。且矩形至少有一边是在矩阵的边缘上。求满足条件的矩形填充方式中面积最大的矩形，要使得该最大矩形的面积最小。

解法见代码

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
    
    int n, m, x, y;
    
    int main()
    {
        while (cin >> n >> m >> x >> y)
        {
            if (n > m)
            {
                swap(n, m);
                swap(x, y);
            }
            int ans;
            int res = (n + 1) / 2;
    
            int left = y;
            int right = m - y + 1;
            int up = x - 1;
            int down = n - x;
    
            ans = res;
            if (min(left, right) > res && up != down)
                ans = min(max(up, down), min(left, right));
            if (n == m && n & 1 && x == res && x == y)
                ans = res - 1;
            printf("%d\n",ans);
        }
        return 0;
    }

