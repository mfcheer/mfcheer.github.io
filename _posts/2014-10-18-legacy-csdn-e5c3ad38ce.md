---
title: hud-1556
date: 2014-10-18 11:42:28
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-e5c3ad38ce
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40210047

树状数组：

  

    
    
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
    
    int n;
    int ar[100010];
    
    int lowbit (int t)
    {
        return  t&(-t);
    }
    
    void add (int i,int v)
    {
        while (i<=n)
        {
            ar[i]+=v;
            i+=lowbit(i);
        }
    }
    int sum (int i)
    {
        int ret =0 ;
        while (i>0)
        {
            ret += ar[i];
            i-=lowbit (i);
        }
        return ret;
    }
    
    
    int main()
    {
        while (scanf ("%d",&n)!=EOF && n )
        {
            int a,b;
            memset (ar,0,sizeof (ar));
            int t=n;
            while (t--)
            {
                scanf ("%d%d",&a,&b);
                add(a,1);
                add(b+1,-1);
            }
    
            for (int i=1;i<n;i++)
                printf("%d ",sum(i));
                printf("%d\n",sum(n));
        }
        return 0;
    }

  
  

