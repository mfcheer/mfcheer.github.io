---
title: LightOJ 1201 - A Perfect Murder【二分图最大独立集】
date: 2015-08-26 21:02:31
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b1db26fac3
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48010113

链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1201
](http://www.lightoj.com/volume_showproblem.php?problem=1201)

最大独立集= 顶点数- 最大匹配

代码：

    
    
    #include <iostream>  
    #include <algorithm>  
    #include <set>  
    #include <map>  
    #include <string.h>  
    #include <queue>  
    #include <sstream>  
    #include <stdio.h>  
    #include <math.h>  
    #include <stdlib.h>  
    
    using namespace std;
    
    int n, m;
    int p[1010][1010];
    int book[1010];
    int match[1010];
    
    int dfs(int u)
    {
        int i;
        for (i = 1;i <= n;i++)
        {
            if (book[i] == 0 && p[u][i] == 1)
            {
                book[i] = 1;
                if (match[i] == 0 || dfs(match[i]))
                {
                    match[i] = u;
                    return 1;
                }
            }
        }
        return 0;
    }
    
    
    int main()
    {
        int t;
        int cases = 1;
        scanf("%d", &t);
        while (t--)
        {
            int ans = 0;
            memset(match, 0, sizeof(match));
            memset(p, 0, sizeof(p));
    
            scanf("%d%d", &n, &m);
            int a, b;
            while (m--)
            {
                scanf("%d%d", &a, &b);
                p[a][b] = p[b][a] = 1;
    
            }
    
            for (int i = 1;i <= n;i++)
            {
                memset(book, 0, sizeof(book));
                if (dfs(i))
                    ans++;
            }
            printf("Case %d: %d\n", cases++,n - ans/2);
        }
        return 0;
    }

