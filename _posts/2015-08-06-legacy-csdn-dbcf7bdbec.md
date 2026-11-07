---
title: hdu 5352 MZL's City 【二分图】
date: 2015-08-06 00:12:47
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-dbcf7bdbec
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47306961

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=5352
](http://acm.hdu.edu.cn/showproblem.php?pid=5352)

题意：  
给你n,m,k  
表示n个建筑 m次操作，修复操作每次最多修复k个建筑。  
有三种操作  
1.修复x点周围建筑（<=k）  
2.x,y建筑间建边  
3.x,y间删边  
修复建筑时候拆点建图。反着求最大匹配，保证字典序最小。

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
    #pragma comment (linker, "/STACK:102400000,102400000")
    
    using namespace std;
    
    template <class T>
    inline bool scan_d(T &ret)
    {
        char c; int sgn;
        if (c = getchar(), c == EOF) return 0; //EOF  
        while (c != '-' && (c<'0' || c>'9')) c = getchar();
        sgn = (c == '-') ? -1 : 1;
        ret = (c == '-') ? 0 : (c - '0');
        while (c = getchar(), c >= '0'&&c <= '9') ret = ret * 10 + (c - '0');
        ret *= sgn;
        return 1;
    }
    
    const int MAXN = 100100;
    const int N = 210;
    // 200 500 200
    int n, m, k;
    
    int mp[N][N];
    int book[N];
    int match[N];
    int path[N];
    int len;
    int vis[N];
    vector<int> g[MAXN];
    int ans[N*3], res;
    int cc;
    
    void get_path(int u)
    {
        vis[u] = 1;
        path[len++] = u;
        for (int i = 1; i <= n; i++)
        {
            if (!vis[i] && mp[u][i] == 1)
            {
                get_path(i);
            }
        }
    }
    
    bool dfs(int u)
    {
        int i;
        for (i = 0; i < g[u].size(); i++)
        {
            int v = g[u][i];
            if (book[v] == 0)
            {
                book[v] = 1;
                if (match[v] == 0 || dfs(match[v]))
                {
                    match[v] = u;
                    return true;
                }
            }
        }
        return false;
    }
    
    void hungry()
    {
        for (int i = cc-1; i >= 0; i--)//保证字典序小 优先匹配后面的
        {
            for (int j = i*k; j < i*k + k; j++)
            {
                memset(book, 0, sizeof(book));
                if (dfs(j))
                    ans[i]++;
            }
            res += ans[i];
        }
    }
    
    void init()
    {
        cc = 0;
        res = 0;
        for (int i = 0; i < 100010; i++) g[i].clear();
        memset(mp, 0, sizeof(mp));
        memset(match, 0, sizeof(match));
        memset(ans, 0, sizeof(ans));
    }
    
    int main()
    {
        int t;
        scan_d(t);
        while (t--)
        {
            scan_d(n);
            scan_d(m);
            scan_d(k);
            init();
            while(m--)
            {
                int p, q;
                int x, y;
                scan_d(p);
                if (p == 1)
                {
                    scan_d(x);
                    memset(vis, 0, sizeof(vis));
                    len = 0;
                    get_path(x);
                    for (int i = 0; i < len; i++)
                    {
                        for (int j = cc*k; j < (cc + 1)*k; j++)
                            g[j].push_back(path[i]);
                    }
                    cc++;
                }
                else if (p == 2)
                {
                    scan_d(x);
                    scan_d(y);
                    mp[x][y] = mp[y][x] = 1;
                }
                else if (p == 3)
                {
                    scan_d(q);
                    while (q--)
                    {
                        scan_d(x);
                        scan_d(y);
                        mp[x][y] = mp[y][x] = 0;
                    }
                }
            }
    
            hungry();
            printf("%d\n", res);
            for (int i = 0; i < cc - 1; i++)
                printf("%d ", ans[i]); printf("%d\n", ans[cc - 1]);
    
        }
        return 0;
    }
    

