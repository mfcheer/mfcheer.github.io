---
title: poj-2348
date: 2014-11-17 12:25:55
tags: ['acm']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-a3c6fdf585
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41207243

    
    
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
    #include<malloc.h>
    
    using namespace std;
    
    int n,m;
    
    int main ()
    {
        while (scanf ("%d %d",&n,&m)!=EOF && m && n)
        {
            int ok = 1 ;
            for(;;)
            {
                if (n>m)
                swap(n,m);
                if (m % n ==0)
                    break;
                if (m-n > n)
                    break;
                m-=n;
                ok=!ok;
            }
            if (ok)
                printf("Stan wins\n");
            else
                printf("Ollie wins\n");
        }
        return 0;
    }
    

  

