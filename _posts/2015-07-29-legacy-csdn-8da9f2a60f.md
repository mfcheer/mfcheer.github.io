---
title: hdu 5323 Solve this interesting problem 【DFS】
date: 2015-07-29 20:54:36
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-8da9f2a60f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47133651

题目链接: [ http://acm.hdu.edu.cn/showproblem.php?pid=5323
](http://acm.hdu.edu.cn/showproblem.php?pid=5323)

题意：给你一个线段树区间【L,R】问你是否有线段树出现这个区间。有的话输出满足条件的最小的n。（比赛的时候居然没看这个题！）

解法：暴力枚举区间

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
    
    //#pragma comment(linker,"/STACK:1024000000,1024000000")  
    
    using namespace std;
    
    long long l, r;
    long long ans;
    
    void dfs(long long x, long long y)
    {
        if (x == 0)
        {
            ans = min(ans, y);
            return;
        }
        if (x < 0 || y >= ans)
            return;
        if (x > y) return;
    
        long long len = y - x + 1;
        if (len > x) return;// 
    
        if (x != y) dfs(x, y + y - x);
        dfs(x, y + y - x + 1);
        dfs(x + x - y - 1, y);
        dfs(x + x - y - 2, y);
    }
    
    int main()
    {
        while (~scanf("%lld%lld", &l, &r))
        {
            ans = 1e17;
            if (l > r) printf("-1\n");
            else if (l == r) printf("%d\n", l);
            else
            {
                dfs(l, r);
                if (ans == 1e17) ans = -1;
                printf("%lld\n",ans);
            }
        }
        return 0;
    }
    

