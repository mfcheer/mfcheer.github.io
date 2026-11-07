---
title: hdu-1257
date: 2014-10-27 16:55:42
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-3ad7e6a54b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40509927

刚开始单纯的以为 a[i] >= a[i+1] ， 导弹的个数就会加一，结果可想而知。

思路：每次拿到一个值，判断他与前面的下降子序列中的最小值最接近的那个序列，然后把那个序列的最小值更新，如果前面的下降子序列

的最小值没有比这个值大的，就另开数组把他当成一个新的子序列的起点。

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    
    using namespace std;
    
    int a[30010];
    
    int main ()
    {
        int n,m;
        while (scanf ("%d",&n) != EOF)
        {
           int i =1;
           int j;
           a[0]=33330;
           for (int k=0;k<n;k++)
           {
               cin>>m;
               for (j=0;j<=i;j++)
               {
                   if ( a[j]>=m )
                   {
                       a[j]=m;
                       break;
                   }
               }
               if (j>i)
                   a[++i] = m;
           }
           printf("%d\n",i);
        }
        return 0;
    }
    

  
  

