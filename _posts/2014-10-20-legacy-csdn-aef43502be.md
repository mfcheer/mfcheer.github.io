---
title: hdu-1875
date: 2014-10-20 23:55:10
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-aef43502be
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40325685

最小生成树 注意浮点型 ：

  

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string.h>
    #include<queue>
    #include <stdio.h>
    #include <string.h>
    #define N 1100
    
    using namespace std;
    
    double  p[110][110];
    double  low[1000];
    int vis[1000];
    
    int n;
    
    struct qq
    {
        int x;
        int y;
    }q[10000];
    
    double getdis (qq a, qq b)
    {
        return (  double (a.x*1.0-b.x*1.0)*(a.x*1.0-b.x*1.0)  + (a.y*1.0-b.y*1.0)*(a.y*1.0-b.y*1.0) ) ;
    }
    
    double  prim ()
    {
        int i,j,pos;
        double res,min;
        memset (vis,0,sizeof (vis));
        res=0;
        pos=1;vis[1]=1;
    
        for (int i=1;i<=n;i++)
        {
            if (i!=pos)
                low[i]= p[i][pos];
        }
        for (int j=1 ;j<n;j++)
        {
            min = 1000000;
            for (int i=1;i<=n;i++)
            {
                if (!vis [i] && min > low[i] )
                {
                    pos =i;
                    min = low[i];
                }
            }
            if (min == 1000000)
                return -1;
            res+=min;
            vis[pos]=1;
    
            for (int i=1;i<=n;i++)
            {
                if (!vis[i] && low[i] > p[i][pos])
                {
                    low[i]= p[i][pos];
                }
            }
        }
        return res*100;
    }
    
    int main ()
    {
        int t;
        cin >>t;
        while (t--)
        {
            cin >>n;
            for (int i=1;i<=n;i++)
            {
                cin>>q[i].x>>q[i].y;
            }
    
            for (int i=1;i<=n;i++)
                for (int j=1;j<=n;j++)
            {
                if (i!=j)
                    p[i][j] = 10000000;
                else
                    p[i][j]=0;
            }
    
            for (int i=1;i<=n;i++)
                for (int j=1;j<=n;j++)
            {
                if (getdis(q[i],q[j]) >=10*10 && getdis(q[i],q[j])<= 1000*1000)
                {
                    p[i][j] = sqrt( 1.0*getdis(q[i],q[j]) ) ;
                }
            }
            if ( prim() == -1)
                printf("oh!\n");
            else
                printf("%0.1f\n",prim());
        }
        return 0;
    }
    

  
  

