---
title: 图论——次小生成树
date: 2015-01-27 13:34:41
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-d459eaf80b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43193753

次小生成树模板

通过poj 1679

  

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <stack>
    #include <queue>
    #include <set>
    
    using namespace std;
    #define INF 10000000
    
    /*
     * 次小生成树
     * 求最小生成树时，用数组Max[i][j]来表示MST中i到j最大边权
     * 求完后，直接枚举所有不在MST中的边，替换掉最大边权的边，更新答案
     * 点的编号从1开始
     */
    const int MAXN=110;
    bool vis[MAXN];
    int lowc[MAXN];
    int pre[MAXN];//记录前驱节点
    int Max[MAXN][MAXN];//Max[i][j]表示在最小生成树中从i到j的路径中的最大边权
    bool used[MAXN][MAXN];//是否是最小生成树的边
    
    int Prim(int cost[][MAXN],int n)
    {
        int ans=0;
        memset(vis,false,sizeof(vis));
        memset(Max,0,sizeof(Max));
        memset(used,false,sizeof(used));
        memset(lowc,0,sizeof(lowc));
    
        for(int i=1;i<=n;i++)
        {
            lowc[i]=cost[1][i];
            pre[i]=1;
        }
        lowc[1]=0;
        vis[1]=true;
        pre[1]=-1; 
    
        for(int i=1;i<n;i++)
        {
            int minc=INF;
            int p=-1;
            for(int j=1;j<=n;j++)
                if(!vis[j] && minc > lowc[j])
                {
                    minc = lowc[j];
                    p = j;
                }
            if(minc==INF)
                return -1;
    
            ans += minc;
            vis[p]=true;
            used[p][pre[p]]=used[pre[p]][p]=true;
    
            for(int j=1;j<=n;j++)
            {
                if(vis[j])
                    Max[j][p]=Max[p][j]=max(Max[j][pre[p]],lowc[p]);
    
                if(!vis[j]&&lowc[j]>cost[p][j])
                {
                    lowc[j]=cost[p][j];
                    pre[j]=p;
                }
            }
        }
        return ans;
    }
    int ans;
    int smst(int cost[][MAXN],int n)//求次小生成树
    {
        int Min=INF;
        for(int i=1;i<=n;i++)
            for(int j=i+1;j<=n;j++)
                if(cost[i][j]!=INF && !used[i][j])
                {
                    Min=min(Min,ans+cost[i][j]-Max[i][j]);
                }
        if(Min==INF)
            return -1;//不存在
        return Min;
    }
    int cost[MAXN][MAXN];
    int main()
    {
        int T;
        int n,m;
        scanf("%d",&T);
        while(T--)
        {
            scanf("%d%d",&n,&m);
            int u,v,w;
            for(int i=1;i<=n;i++)
                for(int j=1;j<=n;j++)
                {
                    if(i==j)
                        cost[i][j]=0;
                    else
                        cost[i][j]=INF;
                }
            while(m--)
            {
                scanf("%d%d%d",&u,&v,&w);
                if (cost[u][v] > w)
                    cost[u][v]=cost[v][u]=w;
            }
            
            ans=Prim(cost,n);
            if(ans==smst(cost,n))
                printf("Not Unique!\n");//次小生成树和最小生成树一样大
            else
                printf("%d\n",ans);
        }
        return 0;
    }
    

  
  

