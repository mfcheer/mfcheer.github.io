---
title: UVA 10034	Freckles 【最小生成树】
date: 2015-08-12 11:08:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-05fedb6f51
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47441425

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=975
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=975)

题意：裸的最小生成树

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    
    using namespace std;
    using namespace std;
    
    #define INF 999999
    
    double map[130][130],dis[130];
    int v[130];
    
    double prim(int n)
    {
        int i,j,k;
        double min,sum=0;
        for(i=1;i<=n;i++)
            dis[i]=map[1][i];
        memset(v,0,sizeof(v));
        v[1]=1;
        dis[1]=0;
        for(i=2;i<=n;i++)
        {
            k=1;
            min=INF;
            for(j=1;j<=n;j++)
                if(!v[j]&&min>dis[j])
                {
                    k=j;
                    min=dis[j];
                }
            sum+=min;
            v[k]=1;
            for(j=1;j<=n;j++)
                if(!v[j]&&dis[j]>map[k][j])
                    dis[j]=map[k][j];
        }
        return sum;
    }
    
    struct node
    {
        double x,y;
    }p[110];
    
    double get_dis(node a,node b)
    {
        return sqrt((a.x - b.x) *(a.x - b.x) + (a.y - b.y)*(a.y - b.y));
    }
    
    int main()
    {
        int n;
        int t;
        scanf("%d",&t);
        while(t--)
        {
            scanf("%d",&n);
            for(int i=1;i<=n;i++)
                for(int j=1;j<=n;j++)
                   {
                       if (i!=j) map[i][j]=INF;
                       else map[i][j] = 0;
                   }
            for(int i=1;i<=n;i++)
                scanf("%lf%lf",&p[i].x,&p[i].y);
            for(int i=1;i<=n;i++)
                for(int j = 1;j<=n;j++)
                map[i][j] = get_dis(p[i],p[j]);
    
            printf("%.2lf\n",prim(n));
            if (t) printf("\n");
        }
        return 0;
    }
    

