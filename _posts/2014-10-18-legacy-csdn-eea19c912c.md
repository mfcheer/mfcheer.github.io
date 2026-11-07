---
title: poj-1979
date: 2014-10-18 10:58:01
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-eea19c912c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40209481

简单题 直接上代码

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <string.h>
    #include <string>
    #include <sstream>
    #include <stdlib.h>
    #include <malloc.h>
    
    using namespace std;
    
    char a[30][30];
    int ans ;
    
    int   dfs (int x,int y)
    {
        if (a[x][y] == '#')
        {
           return 0;
        }
    
    
        if (a[x][y]== '@' || a[x][y]=='.')
        {
            ans++;
            a[x][y]='#';
        }
                dfs(x-1,y);
        dfs(x,y-1); dfs(x,y+1);
                dfs(x+1,y);
    }
    
    int main ()
    {
        int n,m;
        while (cin>>m>>n && (n || m))
        {
            memset (a,'#',sizeof (a)) ;
    
            for (int i=1;i<=n;i++)
                for (int j=1;j<=m;j++)
            {
                cin>>a[i][j];
            }
            ans=0;
            for (int i=1;i<=n;i++)
                for (int j=1;j<=m;j++)
                {
                    if (a[i][j] == '@')
                    {
                        dfs (i,j);
                    }
                }
            cout<<ans<<endl;
        }
        return 0;
    }

  

