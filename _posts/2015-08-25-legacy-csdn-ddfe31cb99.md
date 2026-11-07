---
title: poj 3687 Labeling Balls 【拓扑排序】
date: 2015-08-25 20:49:26
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ddfe31cb99
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47983237

题目链接： [ http://poj.org/problem?id=3687 ](http://poj.org/problem?id=3687)

注意重边

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
    
    int in[210];
    int is[210][210];
    int ans[210];
    int n, m;
    
    int main()
    {
        int t;
        int n, m;
        scanf("%d", &t);
        while (t--)
        {
            memset(in, 0, sizeof(in));
            memset(is, 0, sizeof(is));
            memset(ans, 0, sizeof(ans));
    
            scanf("%d%d", &n, &m);
            int ok = 1;
            int a, b;
            while (m--)
            {
                scanf("%d%d", &a, &b);
                if (a == b) ok = 0;
                if (is[a][b] == 1) ok = 0;
                if (is[b][a] == 0) in[a]++;
                is[b][a] = 1;
            }
            int num = 1;
            int cnt = 0;
            if (!ok) puts("-1");
            else
            {
                for (int k = n;k >= 1 ;k--)
                {
                    int i = n;
                    while (in[i] != 0 && i>=1) i--;
                    in[i] = -1;ans[i] = k;
    
                    if (i >= 1) cnt++;
    
                    for (int j = 1;j <= n;j++)
                    {
                        if (is[i][j])
                            in[j]--;
                    }
                }
                if (cnt != n) puts("-1");
                else
                {
                    for (int i = 1;i < n;i++)
                        printf("%d ", ans[i]);
                    printf("%d\n", ans[n]);
                }
            }
        }
        return 0;
    }

