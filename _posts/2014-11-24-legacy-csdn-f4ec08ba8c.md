---
title: hdu-1301
date: 2014-11-24 20:43:57
tags: ['acm']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f4ec08ba8c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41451633

模板题

    
    
    #include<iostream>
    #define INF 999999
    using namespace std;
    int map[30][30],dis[30],v[30];
    int prim(int n)
    {
        int i,j,k,min,sum=0;
        for(i=1;i<=n;i++)
            dis[i]=map[1][i];
        memset(v,0,sizeof(v));
        v[1]=1;
        dis[1]=0;
        for(i=2;i<=n;i++)
        {
            k=1;
            min=INF;
            for(j=1;j<=n;j++)
                if(!v[j]&&min>dis[j])
                {
                    k=j;
                    min=dis[j];
                }
            sum+=min;
            v[k]=1;
            for(j=1;j<=n;j++)
                if(!v[j]&&dis[j]>map[k][j])
                    dis[j]=map[k][j];
        }
        return sum;
    }
    int main()
    {
        int n;
        while(~scanf("%d",&n),n)
        {
            int i,m,q,j;
            char ch,cc;
            for(i=1;i<=n;i++)
                for(j=1;j<=n;j++)
                    map[i][j]=INF;
            getchar();
            for(i=1;i<=n-1;i++)
            {
                scanf("%c%d",&ch,&m);
                getchar();
                while(m--)
                {
                    scanf("%c%d",&cc,&q);
                    getchar();
                    if(map[ch-'A'+1][cc-'A'+1]>q)
                        map[ch-'A'+1][cc-'A'+1]=map[cc-'A'+1][ch-'A'+1]=q;
                }
            }
            printf("%d\n",prim(n));    
        }
        return 0;
    }

  
  

