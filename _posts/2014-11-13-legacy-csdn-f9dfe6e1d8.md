---
title: hdu-1505
date: 2014-11-13 18:37:26
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f9dfe6e1d8
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41084283

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=1505
](http://acm.hdu.edu.cn/showproblem.php?pid=1505)

1506的加强版

  

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string.h>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    #include<sstream>
    #include<time.h>
    #include<utility>
    #include<malloc.h>
    #include<stdexcept>
    
    using namespace std;
    
    int n,m;
    int t,tt;
    char s[5];
    int p[1005][1005];
    int l[1005];
    int r[1005];
    
    int main()
    {
        scanf("%d",&tt);
        while (tt--)
        {
            memset (p,0,sizeof(p));
    
            scanf ("%d %d",&n,&m);
            for(int i=1 ;i<=n;i++)
                for(int j=1 ;j<=m;j++)
                {
                    scanf ("%s",s);
                    if (s[0] == 'F')
                        p[i][j] = p[i-1][j] + 1;
                    else
                        p[i][j] = 0;
                }
    
            int ans = -1;
    
            for(int i=1 ;i<=n;i++)
            {
                for(int j=1;j<=m;j++)
                    l[j]=r[j]=j;
    
                    p[i][0]=p[i][m+1]=-1;
    
                    for(int k=2 ;k<=m;k++)
                    {
                        t=k;
                        while ( t > 1 && p[i][k] <= p[i][t-1])
                            t=l[t-1];
                        l[k]=t;
                    }
    
                    for(int k=m-1 ;k>=1;k--)
                    {
                        t=k;
                        while ( t < n && p[i][k] <= p[i][t+1])
                            t=r[t+1];
                        r[k]=t;
                    }
    
                    for(int j=1 ;j<=m;j++)
                    {
                        ans = max( ans , p[i][j] * (r[j]-l[j]+1));
                    }
            }
            printf("%d\n",ans * 3);
        }
        return 0;
    }
    

  
  

