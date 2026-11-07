---
title: UVA 10099	The Tourist Guide【floyd】
date: 2015-08-12 16:02:51
tags: ['uva']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b6bd2fd413
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47446241

题目链接：  
[
https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1040
](https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=1040)

题意：  
n个点，m条路径，每条路径最多通过人数最多为value人，求把v个游客从a点运送到b点，需要几辆车，注意导游自己也算一个人。  
思路：floyd找出两点间最大运送量，然后计算需要几躺即可

代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    
    using namespace std;
    
    int n,r;
    
    int p[110][110];
    
    int main()
    {
        int cases=1;
        while(~scanf("%d%d",&n,&r) &&n)
        {
            int a,b,c;
            for(int i=1;i<=n;i++)
                for(int j=1;j<=n;j++)
            {
                if (i == j) p[i][j] = 0;
                else p[i][j] = -1;
            }
            for(int i=1;i<=r;i++)
            {
                scanf("%d%d%d",&a,&b,&c);
                if (p[a][b] < c)
                {
                    p[a][b] = p[b][a] = c;
                }
            }
            for(int k=1;k<=n;k++)
                for(int i=1;i<=n;i++)
                    for(int j=1;j<=n;j++)
                    {
                        if(p[i][k]!=-1 && p[k][j]!=-1)
                            p[i][j] = max(p[i][j],min(p[i][k],p[k][j]));
                    }
            scanf("%d%d%d",&a,&b,&c);
           // printf("           %d\n",p[a][b]);
            int tmp=p[a][b];
            int ans = c / (tmp-1);
            if (c % (tmp-1)) ans+=1;
            printf("Scenario #%d\n",cases++);
            printf("Minimum Number of Trips = %d\n\n",ans);
        }
        return 0;
    }
    

