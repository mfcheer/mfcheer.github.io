---
title: poj-3660 Cow Contest
date: 2015-01-29 11:16:55
tags: ['acm', 'poj', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-cb0f71d1e3
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43268559

题目链接： [ http://poj.org/problem?id=3660 ](http://poj.org/problem?id=3660)

利用floyd进行闭包的传递确定胜负关系。
这样所有点a能走到的点都是排名在a以后的。所有能走到点a的点都是排名在a以前的。如a点，排名在它之前的和排名在它之后的点之和为n-1，那么它的排名就是确定的。

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    #include <stdlib.h>
    #include <time.h>
    
    using namespace std;
    
    const int MAX = 110;
    
    int n,m;
    int rank[MAX][MAX];
    int in[MAX] ,out[MAX];
    int ans;
    
    int main ()
    {
        int a,b;
        while (cin>>n>>m)
        {
            memset(rank,0,sizeof(rank));
            memset(in,0,sizeof(in));
            memset(out,0,sizeof(out));
            ans = 0;
            while (m--)
            {
                cin>>a>>b;
                rank[a][b] = 1;
            }
            for(int k=1;k<=n;k++)
                for(int i=1;i<=n;i++)
                for(int j=1;j<=n;j++)
            {
                if (rank[i][k] == 1 && rank[k][j] == 1)
                    rank[i][j] =1;
            }
            for(int i=1;i<=n;i++)
            {
                int res = 0;
                for(int j=1;j<=n;j++)
                    res += rank[i][j] + rank[j][i];
                if (res == n-1)
                    ans++;
            }
            cout<<ans<<endl;
        }
        return 0;
    }
    

  
  

  

