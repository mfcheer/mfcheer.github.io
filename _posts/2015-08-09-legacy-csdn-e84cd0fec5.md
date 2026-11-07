---
title: UVA 538 - Balancing Bank Accounts
date: 2015-08-09 23:55:55
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e84cd0fec5
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47382737

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=599&problem=479&mosmsg=Submission+received+with+ID+14105881
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&category=599&problem=479&mosmsg=Submission+received+with+ID+14105881)

题意：  
给定一些人的欠钱关系，要求在n-1次内还清钱，问方案

解法：所有人与第n个人结账。计算关系。

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
    
    int n, m;
    map<string, int> Hash;
    int is[100];
    string name[100];
    
    int main()
    {
        int cases = 1;
        while (cin >> n >> m)
        {
            if (n == 0 && m == 0) break;
            memset(is, 0, sizeof(is));
            Hash.clear();
            string s,ss;
            int tmp;
            for (int i = 1; i <= n; i++)
            {
                cin >> name[i];
                Hash[name[i]] = i;
            }
            for (int i = 1; i <= m; i++)
            {
                cin >> s >> ss >> tmp;
                is[Hash[s]] += tmp;
                is[Hash[ss]] -= tmp;
            }
            printf("Case #%d\n",cases++);
            for (int i = 1; i < n; i++)
            {
                if (is[i] > 0)
                    cout << name[n] << " " << name[i] << " " << is[i] << endl;
                else 
                    cout << name[i] << " " << name[n] << " " << -is[i] << endl;
                is[n] -= is[i];
            }
            cout << endl;
        }
        return 0;
    }

