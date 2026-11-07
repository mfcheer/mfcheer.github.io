---
title: hdu-1372
date: 2014-10-30 21:01:43
tags: ['搜索', 'iostream', 'algorithm']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c0fe490ee0
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40627317

广度优先搜索模板题

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    
    using namespace std;
    
    char A[5],B[5];
    
    struct node
    {
        int x;
        int y;
        int num;
    }s,e,p,pp;
    
    int vis[10][10];
    
    int x[10]={1,2,-1,-2,1,2,-1,-2};
    int y[10]={2,1,2,1,-2,-1,-2,-1};
    
    int main ()
    {
        while (scanf("%s %s",A,B)!=EOF)
        {
    
            queue<node> q;
    
            memset (vis,0,sizeof(vis));
    
            s.x=A[0]-'a'+1;
            s.y=A[1]-'0';
            e.x=B[0]-'a'+1;
            e.y=B[1]-'0';
    
            vis[s.x][s.y]=1;
    
            q.push(s);
    
            while (!q.empty())
            {
                p=q.front();
                q.pop();
    
                if (p.x == e.x && p.y == e.y)
                    break;
    
                for (int i =0;i<8;i++)
                {
                    if (p.x+x[i] >= 1 && p.x+x[i] <= 8 && p.y+y[i] >= 1 && p.y+y[i] <= 8 && !vis[p.x+x[i]][p.y+y[i]])
                    {
                        pp.x=p.x+x[i];
                        pp.y=p.y+y[i];
                        vis[pp.x][pp.y]=vis[p.x][p.y]+1;
                        q.push(pp);
                    }
                }
            }
            printf("To get from %s to %s takes %d knight moves.\n",A,B,vis[e.x][e.y]-1);
        }
        return 0;
    }
    

  
  

