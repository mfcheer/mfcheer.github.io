---
title: poj-3061
date: 2014-10-24 15:02:31
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-064ecc8f1c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40427637

首先计算出在前 i 项的和 然后快速枚举 计算最小值 ：

  

    
    
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    #include <algorithm>
    #include <queue>
    #include <iostream>
    
    using namespace std;
    
    int a[100100];
    int sum[100100];
    
    int main ()
    {
       int t;
       cin>>t;
       while (t--)
       {
            int n,m;
            cin>>n>>m;
            for (int i=1;i<=n;i++)
                cin>>a[i];
    
            sum[0]= 0;
            for (int i=1;i<=n;i++)
                sum[i]=sum[i-1]+a[i];
    
            int ans = n;
            int ok =1 ,ko;
            if ( sum[n] < m )
                ok = 0;
    
            int i = 1;
            for (int j=1;j<=n;j++)
            {
                ko=0;
                while (sum [j] - sum [i] >= m)
                {
                    i++;
                    ko=1;
                }
                if (ko)
                ans = min (ans , j - i + 1 );
            }
    
            if (ok)
                printf("%d\n",ans);
            else
                printf ("0\n");
       }
       return 0;
    }
    

  
  

