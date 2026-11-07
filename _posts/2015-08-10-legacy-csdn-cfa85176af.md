---
title: UVA 707 - Robbery【记忆化搜索】
date: 2015-08-10 16:05:16
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-cfa85176af
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47400047

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=599&problem=648&mosmsg=Submission+received+with+ID+14106133
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=599&problem=648&mosmsg=Submission+received+with+ID+14106133)

题意：  
在一个w *
h的图上，t个时刻，然后给你一些信息，知道某些时刻没有小偷的矩阵，问哪些时刻可以唯一确定小偷所在的位置，和确定小偷是否已经逃走，如果没逃走，但是也没有时刻可以可以确定小偷位置，输出不知道

解法：记忆化搜索  
dp[i][j][t]=1 表示t时刻ij可能出现劫犯  
dp[i][j][t]=0 表示t时刻ij不可能出现劫犯

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <algorithm>
    #include <string.h>
    #include <queue>
    #include <math.h>
    #include <map>
    #include <string>
    #include <vector>
    
    using namespace std;
    
    int dir[][2] = { {0,0},{1,0},{-1,0},{0,1}, {0,-1} };
    int W, H, T;
    bool is_ok(int x, int y)
    {
        if (x >= 1 && x <= W && y >= 1 && y <= H) return true;
        return false;
    }
    int n;
    int dp[110][110][110]; //dp[i][j][t]=1 表示t时刻ij可能出现劫犯 
                         //dp[i][j][t]=0 表示t时刻ij不可能出现劫犯 
    
    vector<pair<int, int> > ans[110];
    
    int dfs(int x, int y, int t)
    {
        if (dp[x][y][t] != -1) 
            return dp[x][y][t];
    
        if (t == T)
        {
            dp[x][y][t] = 1;
            return 1;
        }
        dp[x][y][t] = 0;
    
        for (int i = 0; i < 5; i++)
        {
            int xx = x + dir[i][0];
            int yy = y + dir[i][1];
            if (!is_ok(xx, yy)) continue;
            if (dfs(xx, yy, t + 1))
                dp[x][y][t] = 1;
        }
        return dp[x][y][t];
    }
    
    int main()
    {
        int cases = 1;
        while (~scanf("%d%d%d", &W, &H, &T) && W)
        {
            memset(dp, -1, sizeof(dp));
            for (int i = 0; i <= 105;i++) ans[i].clear();
    
            scanf("%d",&n);
            int t, x, xx, y, yy;
            for (int ii = 1; ii <= n; ii++)
            {
                scanf("%d%d%d%d%d", &t, &x, &y, &xx, &yy);
                for (int i = x; i <= xx; i++)
                    for (int j = y; j <= yy; j++)
                        dp[i][j][t] = 0;
            }
    
            for (int i = 1; i <= W; i++)
                for (int j = 1; j <= H; j++)
                    dfs(i, j, 1);
    
            printf("Robbery #%d:\n", cases++);
    
            int ok;
            int res = 1;
            for (int k = 1; k <= T; k++)
            {
                ok = 0;
                for (int i = 1; i <= W; i++)
                {
                    for (int j = 1; j <= H; j++)
                    {
                        if (dp[i][j][k] == 1)
                        {
                            ans[k].push_back((make_pair(i, j)));
                            ok = 1;
                        }
                    }
                }
                if (!ok)
                {
                    res = 0;
                    break;
                }
            }
            if (!res)
            {
                puts("The robber has escaped.");
                printf("\n");
                continue;
            }
            for (int i = 1; i <= T; i++)
            {
                if (ans[i].size() == 1)
                {
                    printf("Time step %d: The robber has been at %d,%d.\n",i,ans[i][0].first,ans[i][0].second);
                    res = 0;
                }
            }
            if (res)
                puts("Nothing known.");
            printf("\n");
        }
        return 0;
    }

