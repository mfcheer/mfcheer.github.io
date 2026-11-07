---
title: poj-3069
date: 2014-10-24 00:23:54
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bd32ecc0b0
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40411205

贪心算法

  

    
    
    #include "stdio.h"
    #include "string.h"
    #include "math.h"
    #include "stdlib.h"
    #include <iostream>
    #include <algorithm>
    #include <stdlib.h>
    #include <queue>
    
    using namespace std;
    
    int a[1010];
    
    int main()
    {
        int r ,n,i;
        while (scanf ("%d%d",&r,&n)!=EOF && (r!=-1 && n != -1) )
        {
            for (i=1;i<=n;i++)
            {
                scanf ("%d",&a[i]);
            }
            sort(a+1,a+1+n);
            i=1;
            int ans =0 ;
            while (i<=n)
            {
                int s = a[i++];//没有被覆盖最左端的点
                while (i<=n && a[i] <= s+r)
                    i++;
                int p=a[i-1];
                while (i<=n && a[i] <= p+r)
                    i++;
    
                ans ++;
            }
            printf("%d\n",ans);
        }
        return 0;
    }
    

  

