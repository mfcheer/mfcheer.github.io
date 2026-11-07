---
title: poj-3253
date: 2014-10-18 16:36:43
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-3a76eb59dd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40212451

贪心算法：哈夫曼编码思想：

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <string.h>
    #include <sstream>
    #include <stdlib.h>
    #include <malloc.h>
    #include <vector>
    #include <queue>
    #include<functional>
    
    using namespace std;
    
    priority_queue < int, vector<int> , greater<int> > q;
    
    int a;
    int main ()
    {
        int n;
        while (cin>>n)
        {
            for (int i=0;i<n;i++)
           {
               cin >>a;
               q.push(a);
           }
            long long  ans = 0;
            int m1,m2;
    
            while (q.size()>1)
            {
                m1=q.top();
                q.pop();
                m2=q.top();
                q.pop();
                ans=ans+m1+m2;
                q.push(m1+m2);
            }
    
            cout<<ans<<endl;
        }
        return 0;
    }

  
  

