---
title: Vigenere密码 Hill密码
date: 2015-09-23 20:16:48
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9257aaeab2
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48686543

Vigenere密码代码：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <math.h>
    #include <stdlib.h>
    #include <ctype.h>
    #include <algorithm>
    #include <vector>
    #include <string.h>
    #include <string>
    #include <queue>
    #include <stack>
    #include <set>
    #include <sstream>
    #include <time.h>
    
    using namespace std;
    
    char clear_text[10000];
    string ans;
    char key[10000];
    
    int main()
    {
        memset(key, 0, sizeof(key));
        ans.clear();
    
        int m;
        printf("please enter m :");
        scanf("%d", &m);
        printf("please enter key :");
        scanf("%s", &key);
        printf("please enter the clear_text :");
        scanf("%s", clear_text);
        int len = strlen(clear_text);
    
        for (int i = 0;i < len;i++)
        {
            int pos = i;
            for (int j = 0;j < m;j++)
            {
                int tmp = (clear_text[pos++] - 'a' + key[j] - 'a') % 26;
                ans += (char)(tmp + 'a');
            }
            i = i + m - 1;
        } 
        cout << ans << endl;
        return 0;
    }
    /*
    5
    hello
    university
    */

Hill:

    
    
    #include <stdio.h>
    #include <ctime>
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
    #include <string>
    #include <assert.h>
    
    using namespace std;
    
    int m;
    int mat[510][510];
    char clear[1000];
    string ans;
    
    int main()
    {
        memset(mat, 0, sizeof(mat));
        ans.clear();
    
        printf("please enter m :");
        scanf("%d",&m);
    
        printf("please enter key_mat :");
        for (int i = 0;i < m;i++)
            for (int j = 0;j < m;j++)
                scanf("%d", &mat[i][j]);
    
        printf("please enter the clear_text :");
        scanf("%s", clear);
    
        int len = strlen(clear);
        int pos = 0;
        for (int i = 0;i < len;i++)
        {
            string tmp;
            tmp.clear();
            for (int j = i;j < i + m;j++) tmp += clear[j];
    
            int pos = 0;
            int cnt = 0;
            for (int j = 0;j < m;j++)
            {
                cnt = 0;
                int t2 = 0;
                for (int k = 0;k < m;k++)
                {
                    int t1 = tmp[cnt++] - 'a';
                    t2 += mat[k][pos] * t1;
                }
                t2 %= 26;
                ans += (char)(t2 + 'a');
                pos++;
            }
            i = i + m - 1;
        }
        cout << ans << endl;
        return 0;
    }
    /*
    2
    11 8 3 7
    hill
    */

