---
title: HDU 2896 病毒侵袭 【AC自动机】
date: 2015-06-05 23:48:22
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-dbcdbd83eb
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383457

病毒侵袭  
Time Limit:1000MS Memory Limit:32768KB 64bit IO Format:%I64d & %I64u

Submit Status  
Description

当太阳的光辉逐渐被月亮遮蔽，世界失去了光明，大地迎来最黑暗的时刻。。。。在这样的时刻，人们却异常兴奋――我们能在有生之年看到500年一遇的世界奇观，那是多么幸福的事儿啊~~  
但网路上总有那么些网站，开始借着民众的好奇心，打着介绍日食的旗号，大肆传播病毒。小t不幸成为受害者之一。小t如此生气，他决定要把世界上所有带病毒的网站都找出来。当然，谁都知道这是不可能的。小t却执意要完成这不能的任务，他说：“子子孙孙无穷匮也！”（愚公后继有人了）。  
万事开头难，小t收集了好多病毒的特征码，又收集了一批诡异网站的源码，他想知道这些网站中哪些是有病毒的，又是带了怎样的病毒呢？顺便还想知道他到底收集了多少带病毒的网站。这时候他却不知道何从下手了。所以想请大家帮帮忙。小t又是个急性子哦，所以解决问题越快越好哦~~  
Input

第一行，一个整数N（1<=N<=500），表示病毒特征码的个数。  
接下来N行，每行表示一个病毒特征码，特征码字符串长度在20―200之间。  
每个病毒都有一个编号，依此为1―N。  
不同编号的病毒特征码不会相同。  
在这之后一行，有一个整数M（1<=M<=1000），表示网站数。  
接下来M行，每行表示一个网站源码，源码字符串长度在7000―10000之间。  
每个网站都有一个编号，依此为1―M。  
以上字符串中字符都是ASCII码可见字符（不包括回车）。  
Output

依次按如下格式输出按网站编号从小到大输出，带病毒的网站编号和包含病毒编号，每行一个含毒网站信息。  
web 网站编号: 病毒编号 病毒编号 …  
冒号后有一个空格，病毒编号按从小到大排列，两个病毒编号之间用一个空格隔开，如果一个网站包含病毒，病毒数不会超过3个。  
最后一行输出统计信息，如下格式  
total: 带病毒网站数  
冒号后有一个空格。  
Sample Input

3 aaa bbb ccc 2 aaabbbccc bbaacc  
Sample Output

web 1: 1 2 3 total: 1

代码：

    
    
    #include <iostream>  
    #include <cstdio>  
    #include <cstring>  
    #include <algorithm>  
    #include <string>  
    #include <queue>  
    
    using namespace std;
    
    struct Trie
    {
        int next[500010][128], fail[500010];
        int end[500010];//Trie树使用
    
        int root, L;
        int newnode()
        {
            for (int i = 0; i < 128; i++)
                next[L][i] = -1;
            end[L++] = -1;
            return L - 1;
        }
        void init()//初始化
        {
            L = 0;
            root = newnode();
        }
        void insert(char buf[],int id)
        {
            int len = strlen(buf);
            int now = root;
            for (int i = 0; i < len; i++)
            {
                if (next[now][buf[i]] == -1)
                    next[now][buf[i]] = newnode();
                now = next[now][buf[i]];
            }
            end[now] = id;//Trie树根节点
        }
        void build()
        {
            queue<int>Q;
            fail[root] = root;
            for (int i = 0; i <128; i++)
                if (next[root][i] == -1)
                    next[root][i] = root;
                else
                {
                    fail[next[root][i]] = root;
                    Q.push(next[root][i]);
                }
            while (!Q.empty())
            {
                int now = Q.front();
                Q.pop();
                for (int i = 0; i < 128; i++)
                    if (next[now][i] == -1)
                        next[now][i] = next[fail[now]][i];
                    else
                    {
                        fail[next[now][i]] = next[fail[now]][i];
                        Q.push(next[now][i]);
                    }
            }
        }
        bool used[1010];
        int query(char buf[],int n,int id)
        {
            int len = strlen(buf);
            int now = root;
            memset(used, false, sizeof(used)); 
            int ok = 0;
    
            for (int i = 0; i < len; i++)
            {
                now = next[now][buf[i]];
                int temp = now;
                while (temp != root)
                {
                    if (end[temp] != -1)
                    {
                        used[end[temp]] = true;
                        ok = 1;
                    }
                    temp = fail[temp];
                }
            }
            if (!ok)
                return 0;
            printf("web %d:",id);
            for (int i = 1; i <= n; i++)
                if (used[i]) printf(" %d",i);
            printf("\n");
            return 1;
        }
    
    }ac;
    
    char buf[1000010];
    int n, m;
    
    int main()
    {
        while (scanf("%d", &n) != EOF)
        {
            ac.init();
            for (int i = 1; i <= n; i++)
            {
                scanf("%s", buf);
                ac.insert(buf,i);
            }
            ac.build();
            int ans = 0;
            scanf("%d",&m);
            for (int i = 1; i <= m; i++)
            {
                scanf("%s", buf);
                if (ac.query(buf,n,i))
                    ans++;
            }
    
            printf("total: %d\n",ans);
        }
        return 0;
    }

