---
title: hdu 4846 Big Barn【dp】
date: 2016-09-28 16:07:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9dce7e9b09
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/52691330

[ http://acm.hdu.edu.cn/showproblem.php?pid=4846
](http://acm.hdu.edu.cn/showproblem.php?pid=4846)

求矩阵中最大的仓库正方形

    
    
    #include <cstdio>
    #include <cmath>
    #include <algorithm>
    #include <iostream>
    #include <cstring>
    #include <vector>
    #include <string>
    #include <map>
    #include <set>
    
    using namespace std;
    
    int n, t;
    int a[1010][1010];
    int b[1010][1010];
    
    int main()
    {
        while (scanf("%d %d", &n, &t) != EOF)
        {
            for (int i = 0;i <= n;i++)
                for (int j = 0;j <= n;j++)
                    a[i][j] = 1;
    
            int u, v;
            //memset(b, 0, sizeof(b));
            while (t--)
            {
                scanf("%d%d", &u, &v);
                a[u][v] = 0;
            }
            for (int i = 1;i <= n;i++)
            {
                b[i][1] = a[i][1];
                b[1][i] = a[1][i];
            }
            for(int i=2;i<=n;i++)
                for (int j = 2;j <= n;j++)
                {
                    if (a[i][j] == 1)
                        b[i][j] = min(b[i - 1][j - 1], min(b[i - 1][j], b[i][j - 1])) + 1;
                    else
                        b[i][j] = 0;
                }
            int ans = 0;
            for (int i = 1;i <= n;i++)
                for (int j = 1;j <= n;j++)
                {
                    ans = max(ans, b[i][j]);
                }
            printf("%d\n", ans);
        }
        return 0;
    }

