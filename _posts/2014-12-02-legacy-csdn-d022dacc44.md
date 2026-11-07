---
title: hdu-5122
date: 2014-12-02 23:29:47
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-d022dacc44
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41686995

  

[ http://acm.hdu.edu.cn/showproblem.php?pid=5122
](http://acm.hdu.edu.cn/showproblem.php?pid=5122)

  

简单题

  

    
    
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
    
    int t ;
    int n;
    int  k = 1;
    
    int ans ;
    int p[1000005];
    
    
    int main()
    {
        scanf("%d",&t);
    	while (t--)
    	{
    		ans = 0;
    		scanf("%d",&n);
    		for(int i=1;i<=n;i++)
    		{
    			scanf("%d",&p[i]);
    		}
    
    		for(int i=n-1;i>=1;i--)
    		{
    			if (p[i+1] < p[i])
    				{
    					swap(p[i+1],p[i]);
    					ans++;
    				}
    		}
    
    		printf("Case #%d: %d\n",k++,ans);
    
    	}
        return 0;
    }

  
  

  

