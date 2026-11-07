---
title: hdu-1789
date: 2014-10-29 15:47:16
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c7d94e87db
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40587325

贪心算法，把作业按照分值大到小排序，如果能完成作业，则记录其完成时间，不能完成，扣分。

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    
    using namespace std;
    
    struct q
    {
        int time ;
        int grade;
    }p[10010];
    
    int m[10010];
    
    bool cmp (q a ,q b)
    {
        return a.grade>b.grade;
    }
    
    int main()
    {
        int t,n;
        scanf ("%d",&t);
        while (t--)
        {
            memset (m,0,sizeof (m));
            scanf ("%d",&n);
            for (int i =1 ;i<=n;i++)
                scanf ("%d",&p[i].time);
            for (int i =1 ;i<=n;i++)
                scanf ("%d",&p[i].grade);
            sort (p+1,p+1+n,cmp);
    
            int ans = 0;
            int day = n;
            for (int i =1 ;i<=n;i++)
            {
                int j;
                for ( j = p[i].time;j>=1;j--)
                {
                    if (!m[j])
                    {
                        m[j]=1;
                        break;
                    }
                }
                if (j==0)
                    ans += p[i].grade;
            }
            printf("%d\n",ans);
        }
        return 0;
    }
    

  
  

