---
title: hdu 5305 Friends 【暴搜】
date: 2015-07-24 08:40:48
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-3bdd90af27
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47035305

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5305
](http://acm.hdu.edu.cn/showproblem.php?pid=5305)

题意：给一个无向图 ， 每条边可以是online边也可以是offline边，问  
有多少种方法使得每个节点的online边和offline边一样多

解法：暴搜。记录每个点连接的边数，奇数的直接不可能，偶数的分成两个数组，c1[i]表示i的在线朋友数，c2[i]表示i的离线朋友数，然后一条边一条边搜就行了。

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
    
    struct
    {
        int u;
        int v;
    }e[100];
    
    int c1[100], c2[100];
    int num[100];
    int ans;
    int n, m;
    
    void dfs(int x)
    {
        if (x == m + 1)
        {
            ans++;
            return;
        }
        int u = e[x].u;
        int v = e[x].v;
        if (c1[u] && c1[v])
        {
            c1[u] --;
            c1[v] --;
            dfs(x + 1);
            c1[u] ++;
            c1[v] ++;
        }
        if (c2[u] && c2[v])
        {
            c2[u] --;
            c2[v] --;
            dfs(x + 1);
            c2[u] ++;
            c2[v] ++;
        }
        return;
    }
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while (t--)
        {
            memset(c1, 0, sizeof(c1));
            memset(c2, 0, sizeof(c2));
            memset(num, 0, sizeof(num));
    
            scanf("%d%d",&n,&m);
            for (int i = 1; i <= m;i++)
            {
                scanf("%d%d",&e[i].u,&e[i].v);
                num[e[i].u]++;
                num[e[i].v]++;
            }
            int ok = 1;
            for (int i = 1; i <= n; i++)
            {
                c1[i] = c2[i] = num[i] / 2;
                if (num[i] & 1)
                {
                    ok = 0;
                    break;
                }
            }
            if (!ok)
            {
                printf("0\n");
                continue;
            }
            ans = 0;
            dfs(1);
            printf("%d\n",ans);
        }
        return 0;
    }

参考自： [ http://blog.csdn.net/Tc_To_Top/article/details/47027079
](http://blog.csdn.net/Tc_To_Top/article/details/47027079)

