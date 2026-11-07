---
title: hdu 5326 Work【并查集】
date: 2015-07-28 20:24:57
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-627beaa53c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47110753

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5326
](http://acm.hdu.edu.cn/showproblem.php?pid=5326)

题意：n个点 ，给你m有向条边，表示起点是终点的父亲。问子孙节点个数是K的节点有几个？

解法：并查集。

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
    
    int is[110][110];
    int p[110];
    int num[110];
    int n, k;
    
    int findd(int x)
    {
        if (x == p[x])
            return x;
        else 
            return  p[x] = findd(p[x]);
    }
    
    void un(int x, int y)
    {
        int a, b;
        a = findd(x);
        b = findd(y);
        if (a == b) return;
        p[b] = a;
    }
    
    int main()
    {
        while (scanf("%d%d", &n, &k) != EOF)
        {
            memset(is, 0, sizeof(is));
            memset(num, 0, sizeof(num));
            for (int i = 1; i<=n; i++)
                p[i] = i;
    
            int x, y;
            for (int i = 1; i<n; i++)
            {
                scanf("%d%d",&x,&y);
                un(x,y);
                is[x][y] = 1;
            }
            for (int k = 1; k <= n;k++)
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                {
                    if (is[i][k] == 1 && is[k][j] == 1)
                    {
                        is[i][j] = 1;
                    }
                }
            for (int i = 1; i <= n; i++)
            {
                for (int j = 1; j <= n; j++)
                {
                    if (p[j] == p[i] && i != j && is[i][j] == 1)
                        num[i]++;
                }
            }
    
            int ans = 0;
            for (int i = 1; i <= n; i++)
                if (num[i] == k) ans++;
    
            printf("%d\n", ans);
        }
    }

