---
title: hdu 3488 Tour【二分图权匹配】
date: 2015-09-10 10:33:58
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b75158aaba
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48339879

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=3488
](http://acm.hdu.edu.cn/showproblem.php?pid=3488)

本题求最小权匹配，将边权值变为相反数，结果取相反数，KM即可求。

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
    
    const int N = 310;
    const int INF = 0x3f3f3f3f;
    
    int nx, ny;
    
    int g[N][N];
    int linker[N], lx[N], ly[N];
    int slack[N];
    bool visx[N], visy[N];
    
    bool dfs(int x)
    {
        visx[x] = true;
        for (int y = 0; y < ny; y++)
        {
            if (visy[y]) continue;
            int tmp = lx[x] + ly[y] - g[x][y];
            if (tmp == 0)
            {
                visy[y] = true;
                if (linker[y] == -1 || dfs(linker[y]))
                {
                    linker[y] = x;
                    return true;
                }
            }
            else if (slack[y] > tmp)
                slack[y] = tmp;
        }
        return false;
    }
    
    int KM()
    {
        memset(linker, -1, sizeof(linker));
        memset(ly, 0, sizeof(ly));
        for (int i = 0; i < nx; i++)
        {
            lx[i] = -INF;
            for (int j = 0; j < ny; j++)
            {
                if (g[i][j] > lx[i])
                    lx[i] = g[i][j];
            }
        }
        for (int x = 0; x < nx; x++)
        {
            for (int i = 0; i < ny; i++)
                slack[i] = INF;
            while (true)
            {
                memset(visx, false, sizeof(visx));
                memset(visy, false, sizeof(visy));
                if (dfs(x)) break;
                int d = INF;
                for (int i = 0; i < ny; i++)
                    if (!visy[i] && d > slack[i])
                        d = slack[i];
                for (int i = 0; i < nx; i++)
                    if (visx[i])
                        lx[i] -= d;
                for (int i = 0; i < ny; i++)
                {
                    if (visy[i]) ly[i] += d;
                    else slack[i] -= d;
                }
            }
        }
        int res = 0;
        for (int i = 0; i < ny; i++)
        {
            if (linker[i] != -1)
                res += g[linker[i]][i];
        }
        return res;
    }
    
    int main()
    {
        int t, n, m;
        scanf("%d",&t);
        while (t--)
        {
            scanf("%d %d", &n,&m);
            for (int i = 0;i <= n;i++)
                for (int j = 0;j <= n;j++)
                    g[i][j] = -INF;
    
            int u, v, w;
            while (m--)
            {
                scanf("%d%d%d", &u, &v, &w);
                u--, v--;
                if (g[u][v] < -w)
                    g[u][v] = -1 * w;
            }
            nx = ny = n;
            printf("%d\n", -1 * KM());
        }
        return 0;
    }

