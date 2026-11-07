---
title: Codeforces Round #303 (Div. 2) A B C D
date: 2015-06-05 17:09:33
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ceac8db153
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46379571

题目链接： [ http://codeforces.com/contest/545 ](http://codeforces.com/contest/545)

A：水  
代码：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    #include <string>
    #include <queue>
    #include <set>
    
    using namespace std;
    
    int n, ans[110],tmp[21000],num;
    int p[110][110];
    
    int main()
    {
        while (cin >> n)
        {
            set<int> q; q.clear();
            num = 0;
            for (int i = 1; i <= n; i++)
                for (int j = 1; j <= n; j++)
                {
                    scanf("%d", &p[i][j]); 
                    if (p[i][j] == -1)
                    {
                        q.insert(i);
                        q.insert(j);
                    }
                    else if (p[i][j] == 0)
                    {
                        q.insert(i);
                        q.insert(j);
                    }
                    else if (p[i][j] == 1)
                    {
                        tmp[num++] = i;
                        q.insert(j);
                    }
                    else if (p[i][j] == 2)
                    {
                        tmp[num++] = j;
                        q.insert(i);
                    }
                    else if (p[i][j] == 3)
                    {
                        tmp[num++] = i;
                        tmp[num++] = j;
                    }
                }
            for (int i = 0; i < num; i++)
                q.erase(tmp[i]);
    
            set<int> ::iterator it;
            cout << q.size() << endl;
            for (it = q.begin(); it != q.end(); it++)
                cout << *it << " ";
            cout << endl;
        }
        return 0;
    }

B: s ，t 字符不同的位置 ，奇数用s 偶数t，其他位置随意。

代码：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    #include <string>
    #include <queue>
    #include <set>
    
    using namespace std;
    
    char s[100010],t[100010];
    int ans[100010];
    
    int main()
    {
        while (cin >> s >> t)
        {
            int len = strlen(s);
            int tmp = 0;
            memset(ans,0,sizeof(ans));
            int num = 0;
            for (int i = 0; i < len; i++)
            {
                if (s[i] != t[i])
                {
                    tmp++;
                    ans[i] = -1;
                }
            }
            if (tmp % 2 == 1)
                puts("impossible");
            else
            {
                for (int i = 0; i < len; i++)
                {
                    if (ans[i] == -1)
                    {
                        num++;
                        if (num % 2 == 0) printf("%d", (s[i] - '0'));
                        else  printf("%d", (t[i] - '0'));
                    }
                    else  printf("%d", (s[i] - '0'));
                }
                printf("\n");
            }
        }
        return 0;
    }

C： 贪心直接搞

代码：

    
    
    #include <vector>
    #include <string>
    #include <algorithm>
    #include <iostream>
    #include <stdio.h>
    
    using namespace std;
    
    const int MAXN=100010;
    int n;
    int dp[10010];
    
    struct node
    {
        int x;
        int y;
        int left,right;
    }p[MAXN];
    
    bool cmp(node a,node b)
    {
        return a.x < b.x;
    }
    
    int main()
    {
        while (cin>>n)
        {
            for(int i=1;i<=n;i++)
            {
                cin>>p[i].x>>p[i].y;
                p[i].left = p[i].x - p[i].y;
                p[i].right = p[i].x + p[i].y;
            }
            sort(p+1,p+1+n,cmp);
            int ans=0;
            int pos = -2000000000;
            for(int i=1;i<=n;i++)
            {
                if (p[i].x - p[i].y > pos)
                {
                    pos = p[i].x;
                    ans++;
                }
                else if (i == n || p[i].x + p[i].y < p[i+1].x)
                {
                    pos = p[i].x + p[i].y;
                    ans++;
                }
                else
                    pos = p[i].x;
            }
            cout<<ans<<endl;
        }
        return 0;
    }

D： 排序直接搞 ，不满足条件直接不选。

代码：

    
    
    #include <iostream>
    #include <cstdio>
    #include <cstring>
    #include <algorithm>
    #include <string>
    #include <queue>
    #include <set>
    
    using namespace std;
    
    int n;
    int p[100010];
    
    int main()
    {
        while (cin >> n)
        {
            for (int i = 1; i <= n; i++) cin >> p[i];
            sort(p + 1, p + 1 + n);
            long long tot = p[1];
            int ans = 1;
            for (int i = 2; i <= n; i++)
            {
                if (p[i] >= tot)
                {
                    ans++;
                    tot += p[i];
                }
            }
            printf("%d\n",ans);
        }
        return 0;
    }

