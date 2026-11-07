---
title: BZOJ 1050 [HAOI2006]旅行comf
date: 2015-10-08 19:26:57
tags: ['bzoj', '排序', '联通']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-63c4c9e7cb
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48976655

题目链接：1050: [HAOI2006]旅行comf

求起点到终点的一条路径，使得路径最长边与最短边比值最小。  
边按小到大排序。枚举最小边值依次加边，直至起点终点联通，更新答案。

代码：

    
    
    #include <iostream>
    #include <algorithm>
    #include <set>
    #include <map>
    #include <string.h>
    #include <queue>
    #include <sstream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    #include <string>
    
    using namespace std;
    
    struct  Node
    {
        int x,y;
        int w;
    }a[500010];
    
    bool cmp(Node a,Node b)
    {
        return a.w < b.w;
    }
    
    int gcd(int a,int b)
    {
        if (b == 0) return a;
        else return gcd(b,a%b);
    }
    
    int f[10010];
    int fi(int x)
    {
        if(f[x] == -1) return x;
        else return f[x] = fi(f[x]);
    }
    
    void un(int x,int y)
    {
        int fx = fi(x);
        int fy = fi(y);
        if (fx != fy)
            f[fx] = fy;
    }
    
    int n,m;
    
    int main()
    {
        while (scanf("%d%d",&n,&m) != EOF)
        {
            int s,t;
            for(int i=1;i<=m;i++)
                scanf("%d%d%d",&a[i].x,&a[i].y,&a[i].w);
            scanf("%d%d",&s,&t);
            sort(a+1,a+1+m,cmp);
    
            int ans1,ans2;
            double tmp = 1e8;
    
            for(int i=1;i<=m;i++)
            {
                memset(f,-1,sizeof(f));
                int ok = 0;
                int MIN = a[i].w;
                int MAX;
                for(int j=i;j<=m;j++)
                {
                    MAX = a[j].w;
                    un(a[j].x,a[j].y);
                    if (fi(s) == fi(t))
                    {
                        ok = 1;
                        double tt = (double)(MAX*1.0/MIN);
                        if (tt < tmp)
                        {
                            tmp = tt;
                            ans1 = MAX;
                            ans2 = MIN;
                        }
                        break;
                    }
                    if (ok) break;
                }
            }
            if (tmp == 1e8) puts("IMPOSSIBLE");
            else
            {
                int tt = gcd(ans1,ans2);
                if (ans2 == tt)
                    printf("%d",ans1/ans2);
                else
                    printf("%d/%d\n",ans1/tt,ans2/tt);
            }
        }
        return 0;
    }
    

