---
title: Codeforces Round #306 (Div. 2) A B C
date: 2015-06-05 15:57:46
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-38ae4ede94
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46377991

题目链接： [ http://codeforces.com/contest/550 ](http://codeforces.com/contest/550)  
A  
暴力一发。  
代码：

    
    
    #include <iostream>
    #include <stdio.h>
    #include <math.h>
    #include <string>
    #include <string.h>
    #include <set>
    #include <map>
    #include <vector>
    #include <algorithm>
    
    using namespace std;
    
    const int MAXN =100010;
    
    char s[MAXN];
    int pos1[MAXN];
    int pos2[MAXN];
    
    int main()
    {
        while (cin>>s)
        {
            int ok1 = 0,ok2 = 0;
            int tmp = 0;
            int len = strlen(s);
            int num1 = 0,num2 = 0;
    
            for(int i = 0;i < len - 1;i++)
            {
                if (s[i] == 'A' && s[i+1]=='B')
                {
                    ok1 = 1;
                    pos1[num1++] = i;
                }
                if (s[i] == 'B' && s[i+1]=='A')
                {
                    ok2 = 1;
                    pos2[num2++] = i;
                }
            }
            int ok=0;
            if (ok1 == 1 && ok2 == 1)
            {
                for(int i=0;i < num1;i++)
                {
                    if(ok) break;
                    for(int j=0;j < num2;j++)
                    {
                        if (abs(pos1[i] - pos2[j]) != 1)
                        {
                            ok=1;
                            break;
                        }
                    }
                }
            }
            if (ok) puts("YES");
            else puts("NO");
        }
        return 0;
    }

B 再暴力一发

    
    
    #include <math.h>
    #include <limits.h>
    #include <complex>
    #include <string>
    #include <functional>
    #include <iterator>
    #include <algorithm>
    #include <vector>
    #include <stack>
    #include <queue>
    #include <set>
    #include <map>
    #include <list>
    #include <bitset>
    #include <sstream>
    #include <iomanip>
    #include <fstream>
    #include <iostream>
    #include <ctime>
    #include <cmath>
    #include <cstring>
    #include <cstdio>
    #include <time.h>
    #include <ctype.h>
    #include <string.h>
    #include <assert.h>
    
    using namespace std;
    
    int n, l, r, X, a[100];
    int ans;
    
    void rec(int x, int sum, int mn, int mx, int cnt) 
    {
        if (x == n) 
        {
            if ((cnt >= 2) && (sum >= l) && (sum <= r) && (mx - mn >= X)) ans++;
            return;
        }
        rec(x + 1, sum, mn, mx, cnt);
        rec(x + 1, sum + a[x], min(mn, a[x]), max(mx, a[x]), cnt + 1);
    }
    
    int main() {
    
        while(~scanf("%d%d%d%d", &n, &l, &r, &X))
        {
            for (int i = 0; i < n; i++) 
                scanf("%d", &a[i]);
            rec(0, 0, 1e9, -1e9, 0);
            printf("%d\n", ans);
        }
    }

C 再再暴力一发  
代码:

    
    
    #include <math.h>
    #include <limits.h>
    #include <complex>
    #include <string>
    #include <functional>
    #include <iterator>
    #include <algorithm>
    #include <vector>
    #include <stack>
    #include <queue>
    #include <set>
    #include <map>
    #include <list>
    #include <bitset>
    #include <sstream>
    #include <iomanip>
    #include <fstream>
    #include <iostream>
    #include <ctime>
    #include <cmath>
    #include <cstring>
    #include <cstdio>
    #include <time.h>
    #include <ctype.h>
    #include <string.h>
    #include <assert.h>
    
    using namespace std;
    
    char s [1010];
    
    void solve()
    {
        int len = strlen(s);
        for(int i=0;i<len;i++)
        {
            if((s[i] - 48) % 8 == 0)
            {
                puts("YES");
                printf("%c\n",s[i]);
                return;
            }
        }
        for(int i=0;i<len;i++)
        {
            for(int j=i+1;j<len;j++)
            {
                int num = s[i] - 48;
                num = num *10 + s[j]-48;
                if (num % 8 == 0)
                {
                    puts("YES");
                    printf("%d\n",num);
                    return;
                }
            }
        }
        for(int i=0;i<len;i++)
        {
            if (s[i] != '0')
                for(int j=i+1;j<len;j++)
                    for(int k=j+1;k<len;k++)
                    {
                        int num = s[i]-48;
                        num = num*10 + s[j] - 48;
                        num = num*10 + s[k] - 48;
                        if (num % 8 == 0)
                        {
                            puts("YES");
                            printf("%d\n",num);
                            return ;
                        }
    
                    }
    
        }
        puts("NO");
    }
    
    int main()
    {
        while (cin>>s)
        {
            int len = strlen(s);
            solve();
        }
        return 0;
    }

