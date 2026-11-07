---
title: Codeforces Round #316 (Div. 2)
date: 2015-08-20 00:55:59
tags: ['codeforces', 'struct']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9b68c8dbec
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47796031

A [ http://codeforces.com/contest/570/problem/A
](http://codeforces.com/contest/570/problem/A)  
简单题

    
    
    int n, m;
    
    long long  cnt[1000];
    
    struct node
    {
        long long nb;
        long long sum;
    }res[1000],ans[1000];
    
    bool cmp(node a, node b)
    {
        if (a.sum != b.sum)
            return a.sum > b.sum;
        else
            return a.nb < b.nb;
    }
    
    bool cmp2(int a, int b)
    {
    
        return a > b;
    }
    
    
    
    int main()
    {
        while (~scanf("%d%d", &n, &m))
        {
            memset(ans, 0, sizeof(ans));
            memset(cnt, 0, sizeof(cnt));
    
            long long t;
            for (int i = 1; i <= m; i++)
            {
                memset(res, 0, sizeof(res));
                for (int j = 1; j <= n; j++)
                {
                    scanf("%lld",&t);
                    res[j].sum += t;
                    res[j].nb = j;
                }
                sort(res + 1, res + 1 + n, cmp);
                cnt[res[1].nb]++;
            }
            long long  MAX = -1;
            for (int i = 0; i <= n; i++)
                MAX = max(MAX, cnt[i]);
            for (int i = 0; i <= n; i++)
            {
                if (cnt[i] == MAX)
                {
                    printf("%d\n", i);
                    break;
                }
            }
        }
        return 0;
    }

B [ http://codeforces.com/contest/570/problem/B
](http://codeforces.com/contest/570/problem/B)  
简单题

    
    
    int n, m;
    
    int main()
    {
        while (~scanf("%d%d", &n, &m))
        {
            if (n == 1 && m == 1)
            {
                printf("1\n");
                continue;
            }
            int ans = n / 2;
            if (ans >= m) ans = m+1;
            else ans = m - 1;
            printf("%d\n",ans);
        }
        return 0;
    }

C [ http://codeforces.com/contest/570/problem/C
](http://codeforces.com/contest/570/problem/C)  
思路见代码

    
    
    int n, m;
    char s[300010];
    
    int main()
    {
        while (~scanf("%d%d", &n, &m))
        {
            scanf("%s", s+1);
            int pos;
            char c[10];
            int ans = 0;
            for (int i = 1; i < n; i++) if (s[i] == '.' && s[i + 1] == '.') ans++;
            while (m--)
            {
                scanf("%d%s", &pos, c);
                if (pos > 1 && s[pos] == '.' && s[pos - 1] == '.') ans--;
                if (pos + 1 <= n && s[pos] == '.' && s[pos + 1] == '.') ans--;
                s[pos] = c[0];
                if (pos > 1 && s[pos] == '.' && s[pos - 1] == '.') ans++;
                if (pos + 1 <= n && s[pos] == '.' && s[pos + 1] == '.') ans++;
                printf("%d\n",ans);
            }
        }
        return 0;
    }

D [ http://codeforces.com/contest/570/problem/D
](http://codeforces.com/contest/570/problem/D)  
代码TLE了。。。之后改

    
    
    int n, m;
    int deep[500010];
    int fa[500010];
    char s[500010];
    char ss[30] = {'a','q','w','e','r','t','y','u','i','o','p','a','s','d','f','g','h','j','k','l','z','x','c','v','b','n','m'};
    map<char, int>mp;
    vector<int> g[500010];
    
    void dfs(int x,int d)
    {
        if (deep[x] == d)
            mp[s[x]]++;
        for (int i = 0; i < g[x].size(); i++)
        {
            if (fa[g[x][i]] == x)
                dfs(g[x][i], d);
        }
    }
    
    int main()
    {
        while (~scanf("%d%d", &n, &m))
        {
            memset(fa, -1, sizeof(fa));
            for (int i = 1; i <= n; i++) g[i].clear();
            fa[1] = 1;
            deep[1] = 1;
            int max_deep = 1;
    
            int tmp;
            for (int i = 2; i <= n; i++)
            {
                scanf("%d", &tmp);
                g[tmp].push_back(i);
                fa[i] = tmp;
                deep[i] = deep[fa[i]] + 1;
                max_deep = max(max_deep, deep[i]);
            }
            scanf("%s", s + 1);
            int a, b;
            while (m--)
            {
                scanf("%d%d", &a, &b);
                if (b > max_deep)
                {
                    puts("Yes");
                    continue;
                }
                if (deep[a] > deep[b])
                {
                    puts("Yes");
                    continue;
                }
    
                mp.clear();
                dfs(a, b);
                int cnt = 0;
                for (int i = 1; i <= 26; i++)
                {
                    if (mp[ss[i]] % 2 == 1) cnt++;
                    if (cnt > 1) break;
                }
                //cout << "  ***  " << str << endl;
                if (cnt > 1) puts("No");
                else puts("Yes");
            }
        }
        return 0;
    }

