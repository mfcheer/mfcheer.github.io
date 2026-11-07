---
title: LightOJ 1152 - Hiding Gold【二分图】
date: 2015-08-27 19:26:42
tags: ['lightoj']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-a6d26daa1e
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48032295

题目链接： [ http://www.lightoj.com/volume_showproblem.php?problem=1152
](http://www.lightoj.com/volume_showproblem.php?problem=1152)

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
        for (int v = 0; v < n*m; v++)
        {
            if (book[v] == 0 && p[u][v] == 1)
            {
                book[v] = 1;
                if (match[v] == 0 || dfs(match[v]))
                {
                    match[v] = u;
                    return 1;
                }
            }
        }
        return 0;
    }
    
    char s[110][110];
    int dir[][2] = { {1,0},{-1,0},{0,1},{0,-1} };
    int is_ok(int x, int y)
    {
        if (x >= 0 && x < n && y >= 0 && y < m) return 1;
        return 0 ;
    }
    
    int main()
    {
        int t;
        int cases = 1;
        scanf("%d", &t);
        while (t--)
        {
            scanf("%d%d", &n, &m);
            for (int i = 0; i < n; i++) scanf("%s", s[i]);
    
            int ans = 0;
            memset(match, 0, sizeof(match));
            memset(p, 0, sizeof(p));
    
            int sum = 0;
            for (int i = 0;i < n;i++)
                for (int j = 0;j < m;j++)
                {
                    if (s[i][j] == '*')
                    {
                        sum++;
                        for (int k = 0;k < 4;k++)
                        {
                            int x = i + dir[k][0];
                            int y = j + dir[k][1];
                            if (is_ok(x, y) && s[x][y] == '*')
                                p[i*m + j][x*m + y] = 1;
                        }
                    }
                }
    
    
            for (int i = 0; i < n*m; i++)
            {
                memset(book, 0, sizeof(book));
                if (dfs(i))
                    ans++;
            }
            printf("Case %d: %d\n", cases++, sum - ans / 2);
        }
        return 0;
    }

