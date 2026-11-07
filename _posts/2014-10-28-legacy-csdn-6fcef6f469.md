---
title: hdu-1176
date: 2014-10-28 18:46:13
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-6fcef6f469
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40544263

数塔DP的变形

引：可将所有的时间段和馅饼看成是一个矩阵，时间就是行数，掉馅饼的就是列数，则就是数字三角形问题，从最底层找一条路径，使得路径上的和最大。

状态转移方程为p[i][j]=max(p[i+1][j-1]，p[i+1][j，p[i+1][j-1])+p[i][j]。p[i][j]为时间i时在j位置掉的馅饼数目。

  

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    
    using namespace std;
    
    int p[100101][15];
    
    int main ()
    {
        int n;
        int x,t,t1;
        while (scanf ("%d",&n)!=EOF && n)
        {
            t1=-1;
            memset (p,0,sizeof(p));
            for (int i =1 ;i<=n;i++)
            {
                scanf ("%d%d",&x,&t);
                p[t][x]++;
                t1=max(t1,t);
            }
    
            for (int i=t1-1;i>=0;i--)
            {
                 for (int j=0 ;j<=10 ;j++)
                {
                    if(j==0)
                    {
                        p[i][j] = max (p[i+1][j],p[i+1][j+1])+p[i][j];
                    }
                    else if (j==10)
                    {
                        p[i][j]=max(p[i+1][j-1],p[i+1][j])+p[i][j];
                    }
                    else
                    {
                        p[i][j]=max (p[i+1][j], max(p[i+1][j-1],p[i+1][j+1]))+p[i][j];
                    }
                }
            }
            printf("%d\n",p[0][5]);
        }
        return 0;
    }
    

  
  

