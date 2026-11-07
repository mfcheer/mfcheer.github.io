---
title: UVA 11573 - Ocean Currents【BFS+优先队列】
date: 2015-08-09 20:37:27
tags: ['uva', 'bfs']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-1c2f9effac
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47379671

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=2620
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=2620)

题意：给定一个海面，数字分别代表海流方向，顺着海流不用费能量，逆海流要费1点能量，每次询问给一个起点一个终点，问起点到终点耗费的最小能量

思路：广搜，队列用优先队列，每次取能量最低的点。

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <algorithm>
    #include <string.h>
    #include <queue>
    #include <math.h>
    #include <map>
    #include <string>
    
    using namespace std;
    
    int dir[10][2] = { { -1, 0 },{ -1, 1 },{ 0, 1 },{ 1, 1 },{ 1, 0 },{ 1, -1 },{ 0, -1 },{ -1, -1 } };
    
    int r, c;
    char p[1010][1010];
    int vis[1010][1010];
    int x1, y11, x2, y2;
    
    bool is_ok(int x, int y)
    {
        if (x >= 1 && x <= r && y >= 1 && y <= c) return true;
        return false;
    }
    
    struct node
    {
        int x, y;
        int t;
        node() {}
        friend bool operator < (node a,node b) 
        {
            return a.t > b.t;
        }
    };
    
    int main()
    {
        while (scanf("%d%d",&r,&c) != EOF)
        {
            for (int i = 1; i <= r; i++)
                scanf("%s", p[i] + 1);
    
            int n;
            cin >> n;
            while(n--)
            {
                int ans = 0;
                cin >> x1 >> y11 >> x2 >> y2;
                priority_queue<node> que;
                while (!que.empty()) que.pop();
                memset(vis, -1, sizeof(vis));
    
                vis[x1][y11] = 0;
                node a;
                a.x = x1, a.y = y11, a.t = 0;
                que.push(a);
    
                while (!que.empty())
                {
                    node tmp = que.top(); que.pop();
                    if (tmp.x == x2 && tmp.y == y2)
                    {
                        ans = tmp.t;
                        break;
                    }
                    node res;
                    for (int i = 0; i < 8; i++)
                    {
                        int x = tmp.x + dir[i][0];
                        int y = tmp.y + dir[i][1];
                        if (!is_ok(x, y)) continue;
                        //if (!is_ok(x, y) && vis[x][y] != -1) continue;
                        res.x = x; res.y = y; 
                        if (p[tmp.x][tmp.y]-'0' == i) res.t = tmp.t;
                        else  res.t = tmp.t + 1;
    
                        if (vis[x][y] == -1 || res.t < vis[x][y])
                        {
                            vis[x][y] = res.t;
                            que.push(res);
                        }
                    }
                }
                printf("%d\n",ans);
            }
        }
        return 0;
    }
    

