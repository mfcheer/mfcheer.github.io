---
title: poj 2195 Going Home【最小费用最大流】
date: 2015-08-07 20:19:15
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-69ccff3cdd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47344457

题目链接：  
[ http://poj.org/problem?id=2195 ](http://poj.org/problem?id=2195)

题意：给你一些人的位置，和屋子的位置，求使得所有人回到屋子的最小花费是多少。每个屋子只能装一人。人每横着或竖着走一步，花费为1。

解法：最小费用流。bin神板子  
建图是原点到人 ，人到屋子， 屋子到汇点。流量均为1，人与屋子费用为距离。其他费用为0；

代码：

    
    
    /*
    POJ 2195 Going Home
    邻接矩阵形式最小费用最大流
    */
    
    #include<stdio.h>
    #include<iostream>
    #include<algorithm>
    #include<string.h>
    #include<queue>
    using namespace std;
    
    
    //************************************************************
    //最小费用最大流算法
    //SPFA求最短路
    //邻接矩阵形式
    //初始化:cap:容量，没有边为0
    //cost:耗费，对称形式，没有边的也为0
    //c是最小费用
    //f是最大流
    //*******************************************************
    const int MAXN=500;
    const int INF=0x3fffffff;
    int cap[MAXN][MAXN];//容量，没有边为0
    int flow[MAXN][MAXN];
    //耗费矩阵是对称的，有i到j的费用，则j到i的费用为其相反数
    int cost[MAXN][MAXN];//花费
    
    
    int n;//顶点数目0~n-1
    int f;//最大流
    int c;//最小费用
    int start,end;//源点和汇点
    
    bool vis[MAXN];//在队列标志
    int que[MAXN];
    int pre[MAXN];
    int dist[MAXN];//s-t路径最小耗费
    bool SPFA()
    {
        int front=0,rear=0;
        for(int u=0;u<=n;u++)
        {
            if(u==start)
            {
                que[rear++]=u;
                dist[u]=0;
                vis[u]=true;
            }
            else
            {
                dist[u]=INF;
                vis[u]=false;
            }
        }
        while(front!=rear)
        {
            int u=que[front++];
            vis[u]=false;
            if(front>=MAXN)front=0;
            for(int v=0;v<=n;v++)
            {
                if(cap[u][v]>flow[u][v]&&dist[v]>dist[u]+cost[u][v])
                {
                    dist[v]=dist[u]+cost[u][v];
                    pre[v]=u;
                    if(!vis[v])
                    {
                        vis[v]=true;
                        que[rear++]=v;
                        if(rear>=MAXN)rear=0;
                    }
                }
            }
        }
        if(dist[end]>=INF)return false;
        return true;
    }
    
    void minCostMaxflow()
    {
        memset(flow,0,sizeof(flow));
        c=f=0;
        while(SPFA())
        {
            int Min=INF;
            for(int u=end;u!=start;u=pre[u])
               Min=min(Min,cap[pre[u]][u]-flow[pre[u]][u]);
            for(int u=end;u!=start;u=pre[u])
            {
                flow[pre[u]][u]+=Min;
                flow[u][pre[u]]-=Min;
            }
            c+=dist[end]*Min;
            f+=Min;
        }
    }
    //************************************************************
    
    struct Node
    {
        int x,y;
    };
    
    Node node1[MAXN],node2[MAXN];
    char str[MAXN][MAXN];
    
    int main()
    {
        int N,M;
        while(~scanf("%d%d",&N,&M))
        {
            if(N==0&&M==0)break;
    
            int tol1=0,tol2=0;
            //人和房子的数目 从 1 开始
    
            for(int i=0;i<N;i++)
            {
                scanf("%s",&str[i]);
    
                for(int j=0;j<M;j++)
                {
                    if(str[i][j]=='m')
                    {
                        tol1++;
                        node1[tol1].x=i;
                        node1[tol1].y=j;
                    }
                    else if(str[i][j]=='H')
                    {
                        tol2++;
                        node2[tol2].x=i;
                        node2[tol2].y=j;
                    }
                }
            }
    
            start=0;
    
            n=tol1+tol2+1;
    
            end=tol1+tol2+1;
    
            memset(cap,0,sizeof(cap));
            memset(cost,0,sizeof(cost));
    
            for(int i=1;i<=tol1;i++)
            {
                cost[0][i]=cost[i][0]=0;
                cap[0][i]=1;
            }
    
            for(int i=1;i<=tol2;i++)
            {
                cost[tol1+i][end]=0;
                cap[tol1+i][end]=1;
            }
    
            for(int i=1;i<=tol1;i++)
              for(int j=1;j<=tol2;j++)
              {
                  cost[i][tol1+j]=abs(node1[i].x-node2[j].x)+abs(node1[i].y-node2[j].y);
    
                  cost[tol1+j][i]=-cost[i][tol1+j];
    
                  cap[i][tol1+j]=1;
              }
    
            minCostMaxflow();
            printf("%d\n",c);
        }
        return 0;
    }
    

