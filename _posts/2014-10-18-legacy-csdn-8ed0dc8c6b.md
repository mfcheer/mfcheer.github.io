---
title: poj-2236
date: 2014-10-18 14:28:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-8ed0dc8c6b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40211197

并查集：

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <string.h>
    #include <string>
    #include <sstream>
    #include <stdlib.h>
    #include <malloc.h>
    
    using namespace std;
    
    int n,t;
    
    struct pp
    {
        int x;
        int y;
    }p[10000];
    
    int makedis(pp a,pp b)//计算两点距离
    {
        return (double (a.x*1.0-b.x*1.0)*(a.x*1.0-b.x*1.0)+(a.y*1.0-b.y*1.0)*(a.y*1.0-b.y*1.0) );
    }
    
    int ran[10000];
    int qq[10000];
    int pq[10000];
    
    int findd (int x)
    {
        if (x == pq[x])
            return x;
        else
            return pq[x]=findd(pq[x]);
    }
    
    int un(int a,int b)
    {
        int fa = findd(a);
        int fb = findd(b);
        if (fa == fb )
            return 0;
        else
        {
            if (ran[fa]>ran[fb])
            {
                pq[fb]=fa;
            }
            else
            {
                pq[fa]=fb;
                if (fa==fb)
                    ran[fa]++;
            }
        }
    }
    
    int main ()
    {
        int n,d;
        while (cin>>n>>d)
        {
            memset(ran,0,sizeof(ran));
            memset(qq,0,sizeof(qq));
            memset(pq,0,sizeof(pq));
    
            for (int i=1;i<=n;i++)
            {
                cin>>p[i].x>>p[i].y;
                pq[i]=i;
            }
    
            char q[5];
            int x,y;
            while (cin>>q)
            {
                if (!strcmp(q,"O"))
                {
                    cin>>x;
                    qq[x]=1;
                    for (int i=1;i<=n;i++)
                    {
                        if (makedis(p[i],p[x])<=d*d && qq[i] && i!=x &&(  findd(x)!=findd(i) ))
                        {
                            un(i,x);
                        }
                    }
                }
                else if (!strcmp(q,"S"))
                {
                    cin>>x>>y;
                    if (findd(x)==findd(y))
                        printf("SUCCESS\n");
                    else
                        printf("FAIL\n");
                }
            }
        }
        return 0;
    }

  
  

