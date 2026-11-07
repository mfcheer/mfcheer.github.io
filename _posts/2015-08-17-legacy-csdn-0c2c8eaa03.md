---
title: UVA 11991	Easy Problem from Rujia Liu?【STL】
date: 2015-08-17 19:21:37
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-0c2c8eaa03
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47729955

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=3142
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=3142)

题意：  
给一个长度n的序列，有m询问，每个询问会问第k个出现的数字的下标是多少  
用map记录

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <algorithm>
    #include <string.h>
    #include <queue>
    #include <stack>
    #include <map>
    
    using namespace std;
    
    int n, m;
    map<int ,vector<int> > mp;
    
    int c[1001000];
    
    int main()
    {
        while (~scanf("%d%d", &n, &m))
        {
            mp.clear();
            memset(c, 0, sizeof(c));
    
            int tmp;
            for (int i = 1; i <= n; i++)
            {
                scanf("%d", &tmp);
                mp[tmp].push_back(i);
            }
            int a, b;
            while (m--)
            {
                scanf("%d%d", &a, &b);
                if (mp[b].size() < a) printf("0\n");
                else printf("%d\n", mp[b][a - 1]);
            }
        }
        return 0;
    }

