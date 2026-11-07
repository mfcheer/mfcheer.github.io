---
title: UVA 567	Risk【floyd】
date: 2015-08-12 10:49:18
tags: ['uva']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-df1fe3e5ed
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47440955

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=508
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=508)

题意：20个点的任意最短路。floyd

代码：

    
    
    #include <stdio.h>
    #include <ctime>
    #include <math.h>
    #include <string>
    #include <iterator>
    #include <algorithm>
    #include <vector>
    #include <stack>
    #include <queue>
    #include <set>
    #include <map>
    #include <iostream>
    #include <ctime>
    #include <cmath>
    #include <cstring>
    
    using namespace std;
    
    int a[25][25];
    char c;
    
    int main()
    {
        int cases=1;
        int n,m;
        while (~scanf("%d",&n))
        {
            for(int i=1;i<=20;i++)
                    for(int j= 1;j<=20;j++)
                    {
                        if (i==j) a[i][j] = 0;
                        else a[i][j] = 100000000;
                    }
            while(n--)
                {
                    scanf("%d",&m);
                    a[1][m] = a[m][1] = 1;
                }
            for(int i=2;i<=19;i++)
            {
                scanf("%d",&n);
                while(n--)
                {
                    scanf("%d",&m);
                    a[i][m] = a[m][i] = 1;
                }
            }
            for(int k=1;k<=20;k++)
                for(int i=1;i<=20;i++)
                    for(int j= 1;j<=20;j++)
            {
                if (a[i][k] + a[k][j] < a[i][j])
                    a[i][j] =  a[i][k] + a[k][j];
            }
            int s,d;
            scanf("%d",&n);
            printf("Test Set #%d\n",cases++);
            while(n--)
            {
                scanf("%d%d",&s,&d);
                printf("%2d to %2d: %d\n",s,d,a[s][d]);
            }
            printf("\n");
        }
        return 0;
    }
    

