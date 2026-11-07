---
title: Traveling 【图的性质】
date: 2015-03-29 15:11:17
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bad14ca93f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44727349

Traveling  
时间限制: 1 Sec 内存限制: 32 MB  
提交: 41 解决: 23  
[提交][状态][讨论版]  
题目描述  
SH likes traveling around the world. When he arrives at a city, he will ask
the staff about the number of cities that connected with this city directly.
After traveling around a mainland, SH will collate data and judge whether the
data is correct.  
A group of data is correct when it can constitute an undirected graph.  
输入  
There are multiple test cases. The first line of each test case is a positive
integer N (1<=N<=10000) standing for the number of cities in a mainland. The
second line has N positive integers a1, a2, …,an. ai stands for the number of
cities that connected directly with the ith city. Input will be ended by the
END OF FILE.  
输出  
If a group of data is correct, output “YES” in one line, otherwise, output
“NO”.  
样例输入  
8  
7 7 4 3 3 3 2 1  
10  
5 4 3 3 2 2 2 1 1 1  
样例输出  
NO  
YES

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    const int MAXN =10010;
    
    int p[MAXN];
    int n;
    
    int solve ()
    {
        for(int i=0;i<n;i++)
        {
            for(int j=i+1;j<n;j++)
            {
                if (p[i]>0 && p[j] >0)
                {
                    p[i]-- ;
                    p[j]--;
                }
            }
            if (p[i]!=0)
            {
                return 0;
            }
        }
        return 1;
    }
    
    int main()
    {
        while (scanf("%d",&n)!=EOF)
        {
            for(int i=0;i<n;i++)
                scanf("%d",&p[i]);
            if (solve())
                printf("YES\n");
            else
                printf("NO\n");
        }
        return 0;
    }
    

