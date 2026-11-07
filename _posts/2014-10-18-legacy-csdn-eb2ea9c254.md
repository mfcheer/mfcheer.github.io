---
title: hdu-2120
date: 2014-10-18 11:45:02
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-eb2ea9c254
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40210063

并查集判环：

  

    
    
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
    int p[1000000];
    int num;
    
    int find (int x)
    {
        if (x == p[x])
            return x ;
        else return find (p[x]); 
    
    }
    
    void un(int a ,int b)
    {
        int fa = find (a);
        int fb = find (b);
        if (fa==fb)
        {
            num++;
            return ;
    
        }
        else
        {
            if (fa>fb)
                p[fa]=fb;
            else 
                p[fb]=fa;
        }
    }
    
    int main ()
    {
        int n,m;
        
        while (scanf ("%d%d",&n,&m)!=EOF )
        {
            num=0;
            for (int i=0;i<n;i++)
                p[i]=i;
            int a,b;
            for (int i=0;i<m;i++)
            {
                scanf ("%d%d",&a,&b);
                un(a,b);
            }
            
            printf("%d\n",num);
        }
        return 0;
    }
    

  
  

