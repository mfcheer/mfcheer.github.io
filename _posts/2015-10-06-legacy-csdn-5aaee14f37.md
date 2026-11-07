---
title: hdu 3605 Escape【二分图多重匹配】
date: 2015-10-06 19:07:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-5aaee14f37
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48933401

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=3605
](http://acm.hdu.edu.cn/showproblem.php?pid=3605)

多重匹配

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
    #include <string>
    
    using namespace std;
    
    const int MAXN = 101000;//左点数
    const int MAXM = 12;//右
    int un, vn;
    
    int g[MAXN][MAXM];
    int linker[MAXM][MAXN];
    bool used[MAXM];
    int num[MAXM];
    
    bool dfs(int u)
    {
        for (int v = 0;v < vn;v++)
        {
            if (g[u][v] && !used[v])
            {
                used[v] = true;
                if (linker[v][0] < num[v])
                {
                    linker[v][++linker[v][0]] = u;
                    return true;
                }
                for (int i = 1;i <= num[v];i++)
                {
                    if (dfs(linker[v][i]))
                    {
                        linker[v][i] = u;
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    bool hungry()
    {
        int res = 0;
        for (int i = 0;i < vn;i++)
            linker[i][0] = 0;
        for (int i = 0;i < un;i++)
        {
            memset(used, false, sizeof(used));
            if (!dfs(i)) return false;
        }
        return true;
    }
    
    int main()
    {
        while (scanf("%d%d", &un, &vn) != EOF)
        {
            memset(g, 0, sizeof(g));
            memset(num, 0, sizeof(num));
            memset(linker,0,sizeof(linker));
    
            for (int i = 0;i < un;i++)
                for (int j = 0;j < vn;j++)
                    scanf("%d", &g[i][j]);
            for (int i = 0;i < vn;i++)
                scanf("%d", &num[i]);
            if (hungry()) puts("YES");
            else puts("NO");
        }
        return 0;
    }
    

