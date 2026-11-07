---
title: hdu 2554 N对数的排列问题 【数学】
date: 2015-06-05 18:11:45
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-6c7df1ed31
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46380473

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=2554
](http://acm.hdu.edu.cn/showproblem.php?pid=2554)

题意：中文题目就不说了。

假设每个数 i 的第一次出现位置是ai ，第二次出现的位置是 bi,则可以推导出又所以解得sum of ai= n*(3n-1)/4; 要保证解为正整数。

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    #include <iterator>
    #include <vector>
    #include <set>
    
    using namespace std;
    
    long long n;
    
    int main()
    {
        while (cin >> n && n)
        {
            if (n % 4 == 0 || n*(3 * n - 1) % 4 == 0)
                puts("Y");
            else 
                puts("N");
        }
        return 0;
    }

