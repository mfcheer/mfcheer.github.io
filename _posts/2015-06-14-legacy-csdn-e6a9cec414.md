---
title: hdu 1054 Strategic Game 【匈牙利算法】
date: 2015-06-14 15:18:16
tags: ['算法', '图']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e6a9cec414
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46491443

题目链接： [ http://acm.acmcoder.com/showproblem.php?pid=1054
](http://acm.acmcoder.com/showproblem.php?pid=1054)  
题意：求无向图的最小顶点覆盖 = 最大匹配数 / 2;  
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
    
    int n, m, k, num;
    int p[1510][1510];
    int book[1510];
    int match[1510];
    int t, tt;
    int a, b;
    char tmp;
    
    bool dfs(int u)
    {
        int i;
        for (i = 0; i < n; i++)
        {
            if (book[i] == 0 && p[u][i] == 1)
            {
                book[i] = 1;
                if (match[i] == 0 || dfs(match[i]))
                {
                    match[i] = u;
                    return true;
                }
            }
        }
        return false;
    }
    
    
    int main()
    {
        while (scanf("%d", &n) != EOF)
        {
            memset(p,0,sizeof(p));
            memset(match, 0, sizeof(match));
    
            for (int i = 0; i < n; i++)
            {
                scanf("%d%c%c%d%c",&m,&tmp,&tmp,&k,&tmp);
                for (int j = 1; j <= k; j++)
                {
                    scanf("%d",&num);
                    p[m][num] = 1;
                    p[num][m] = 1;
                }
            }
    
            int ans = 0;
    
            for (int i = 0; i < n; i++)
            {
                memset(book, 0, sizeof(book));
                if (dfs(i))
                    ans++;
            }
            cout << ans/2 << endl;
        }
        return 0;
    }

