---
title: hdu 4857 逃生【反向拓扑排序】
date: 2015-08-13 21:06:43
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ddf818a3ca
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47620875

题目链接：  
[ http://acm.hdu.edu.cn/showproblem.php?pid=4857
](http://acm.hdu.edu.cn/showproblem.php?pid=4857)

题意:中文不解释

解法：

input:  
1  
3 1  
3 1  
answer:  
3 1 2  
而不是  
2 3 1  
所以逆向建边 拓扑

代码：

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    #include<string.h>
    
    using namespace std;
    
    int n, m;
    int a, b;
    int in[30010];
    int ans[30010];
    vector<int> g[30010];
    
    struct cmp
    {
        bool operator()(int &a, int &b)
        {
            return a < b;
        }
    };
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while (t--)
        {
            scanf("%d%d",&n,&m);
            memset(in, 0, sizeof(in));
            for (int i = 1; i <= n; i++) g[i].clear();
            while (m--)
            {
                scanf("%d%d",&a,&b);
                g[b].push_back(a);
                in[a]++;
            }
            priority_queue<int,vector<int>,cmp> que;
            while (!que.empty()) que.pop();
            for (int i = 1; i <= n; i++)
                if (in[i] == 0) que.push(i);
            int cnt = 0;
            while (!que.empty())
            {
                int t = que.top(); que.pop();
                ans[cnt++] = t;
                for (int i = 0; i < g[t].size(); i++)
                {
                    in[g[t][i]] --;
                    if (in[g[t][i]] == 0)
                        que.push(g[t][i]);
                }
            }
            for (int i = cnt - 1; i >= 0; i--)
            {
                printf("%d",ans[i]); 
                if (i == 0) printf("\n"); else printf(" ");
            }
        }
        return 0;
    }

