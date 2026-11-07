---
title: UVA 10457 - Magic Car【最小瓶颈树】
date: 2015-08-10 21:04:54
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f08bdd3d38
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47404989

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=600&problem=1398&mosmsg=Submission+received+with+ID+14106648
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=600&problem=1398&mosmsg=Submission+received+with+ID+14106648)

题意：  
m条路，每条路上必须维持速度v，现在有一辆车，启动能量和结束能量为a,
b，途中消耗能量为经过路径最大速度减去最小速度，现在每次循环给定起点终点，问最小能量花费

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <algorithm>
    #include <string.h>
    #include <queue>
    #include <math.h>
    #include <string>
    
    using namespace std;
    
    const int MAXN = 410000;//点
    const int MAXM = 410000;//边
    
    struct Edge
    {
        int u, v;
        int w;
        friend bool operator < (Edge a, Edge b)
        {
            return a.w < b.w;
        }
    }edge[MAXM];
    
    int f[MAXN];
    int find(int x)
    {
        if (f[x] == x) return x;
        else return f[x] = find(f[x]);
    }
    
    int main()
    {
        int n, m, k;
        while (scanf("%d%d", &n, &m) != EOF)
        {
            int x, y, z;
            for (int i = 0; i < m; i++)
            {
                scanf("%d%d%d", &edge[i].u, &edge[i].v, &edge[i].w);
            }
            sort(edge, edge + m);
            scanf("%d%d", &x, &y); int ans = x + y;
            scanf("%d",&k);
            while (k--)
            {
                scanf("%d%d", &x, &y);
                int tmp = 1000000000;
    
                for (int i = 0; i < m; i++)
                {
                    for (int j = 1; j <= n; j++) f[j] = j;
                    for (int j = i; j < m; j++)
                    {
                        int t1 = find(edge[j].u);
                        int t2 = find(edge[j].v);
                        if (t1 != t2) f[t1] = t2;
                        if (find(x) == find(y))
                        {
                            tmp = min(tmp, edge[j].w - edge[i].w);
                            break;
                        }
                    }
                }
                printf("%d\n", ans + tmp);
            }
        }
        return 0;
    }

