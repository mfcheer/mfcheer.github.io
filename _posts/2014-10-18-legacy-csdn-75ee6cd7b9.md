---
title: poj-1611
date: 2014-10-18 11:07:06
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-75ee6cd7b9
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40209551

寻找根节点为 0  的节点的个数

  

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <algorithm>
    #include <string.h>
    
    using namespace std;
    
    int p[30005];
    int rankk[30005];
    
    int findd (int x)
    {
        if (x == p[x])
            return x;
        else return  p[x]=findd(p[x]);
    }
    
    void un(int x, int y)
    {
        int a,b;
    	a = findd(x);
    	b = findd(y);
    	if (a == b)
    		return;
    	if (rankk[a] > rankk[b])
    		p[b] = a;
    	else {
    		p[a] = b;
    		if (rankk[a] == rankk[b])
    			rankk[b]++;
    	}
    }
    
    int main()
    {
        int n,m;
        while (scanf("%d%d",&n,&m) && (n || m) )
        {
                for (int i=0;i<n;i++)
            {
                p[i]=i;
                rankk[i]=0;
            }
            int num;
            int k,kk;
    
            for (int i=0;i<m;i++)
            {
                scanf ("%d",&num);
    
                if (num>=1)
                scanf ("%d",&k);
    
                for (int j=1;j<num;j++)
                {
                    scanf("%d",&kk);
                    un(k,kk);
                }
    
            }
    
            int ans = 1 ;
    
            for (int i=1;i<n;i++)
            {
                if ( findd(i) == findd(0) )
                    ans++;
            }
    
            printf("%d\n",ans);
        }
    }
    

  
  

