---
title: hdu 5336 XYZ and Drops 【BFS模拟】
date: 2015-07-31 23:44:00
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4df618aa2d
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47177775

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5336
](http://acm.hdu.edu.cn/showproblem.php?pid=5336)

题意：给你一个r*c的网格，有的网格为空，有的有水，再给出一个爆炸点，从这个点向四周爆出四个水滴，若碰到水则融为一体，若碰到其他水滴直接跑过去互不影响，每秒可跑一格，若水中水滴数量超过4则爆开，问T秒后网格的状态是怎样的。

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
    #include <string>
    #include <assert.h>
    #pragma comment(linker,"/STACK:1024000000,1024000000")
    
    using namespace std;
    
    const int MAXN = 110;
    
    int r, c, n, t;
    int dir[][2] = { { 0,0 },{ 1,0 },{ -1,0 },{ 0,1 },{ 0,-1 } };
    int s[MAXN][MAXN];// 地图，记录水滴的数目
    int ans[MAXN][MAXN];// 记录（i,j）位置的爆裂时间
    
    struct water // 询问的n个水坑
    {
        int x, y;// 坐标
        int t;
    }p[MAXN];
    
    struct node// 水滴
    {
        // 坐标，方向
        int x, y, dir;
        int t;
    };
    
    int sx, sy;
    
    bool is_ok(int x, int y)
    {
        if (x<1 || x>r || y<1 || y>c) return false;
        return true;
    }
    
    void bfs()
    {
        queue<node> q;
        while (!q.empty()) q.pop();
    
        node tmp;
        for (int i = 1; i <= 4; i++)
        {
            tmp.x = sx;
            tmp.y = sy;
            tmp.dir = i;//水滴运动的方向
            q.push(tmp);
        }
    
        node qq,qqq;
    
        for (int k = 1; k <= t; k++)
        {
            int len = q.size();
            if (len == 0) break;
            for (int kk = 0; kk < len;kk++)
            {
                qq = q.front();
                q.pop();
                int x = qq.x; int y = qq.y; int d = qq.dir;
                int xx = qq.x + dir[d][0];
                int yy = qq.y + dir[d][1];
    
                if (is_ok(xx, yy))
                {
                    if (ans[xx][yy] == k) continue;
    
                    if (s[xx][yy])//有水被吸收
                    {
                        s[xx][yy]++;
                        if (s[xx][yy] > 4)
                        {
                            if (ans[xx][yy] == 0)
                            {
                                ans[xx][yy] = k;
                                s[xx][yy] = 0;
                            }
                            for (int i = 1; i <= 4; i++)
                            {
                                tmp.x = xx;
                                tmp.y = yy;
                                tmp.dir = i;//水滴运动的方向
                                q.push(tmp);
                            }
                        }
                    }
                    else //没水继续走
                    {
                        tmp.x = xx;
                        tmp.y = yy;
                        tmp.dir = d;//水滴运动的方向
                        q.push(tmp);
                    }
                }
    
            }
        }
        return;
    }
    
    int main()
    {
        while (~scanf("%d%d%d%d", &r, &c, &n, &t))
        {
            memset(s, 0, sizeof(s));
            memset(ans, 0, sizeof(ans));
            int x, y, z;
    
            for (int i = 1; i <= n; i++)
            {
                scanf("%d%d%d", &x, &y, &z);
                p[i].x = x; p[i].y = y;
                s[x][y] = z;
            }
    
            scanf("%d%d", &sx, &sy);
            bfs();
    
            for (int i = 1; i <= n; i++)
            {
                if (ans[p[i].x][p[i].y])
                    printf("0 %d\n", ans[p[i].x][p[i].y]);
                else 
                    printf("1 %d\n", s[p[i].x][p[i].y]);
            }
        }
        return 0;
    }

