---
title: RC4加密算法
date: 2015-09-27 21:00:43
tags: ['加密', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ce83ccfb3e
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48769443

代码：

    
    
    #include <iostream>
    #include <cstring>
    #include <cstdio>
    #include <map>
    #include <algorithm>
    
    using namespace std;
    
    int S[300];
    int T[300];
    int K[300];
    
    int main()
    {
        int len;
        scanf("%d", &len);
        for (int i = 0;i < len;i++) scanf("%d",&K[i]);
        for (int i = 0;i <= 255;i++)
        {
            S[i] = i;
            T[i] = K[i%len];
        }
        int j = 0;
        for (int i = 0;i <= 255;i++)
        {
            j = (j + S[i] + T[i]) % 256;
            swap(S[i], S[j]);
        }
    
        int clear_text[300];
        int cnt;
        scanf("%d", &cnt);
        for (int i = 0;i < cnt;i++) scanf("%d", &clear_text[i]);
        int tmp[300];
        int num = 0;
    
        int i = 0;
        j = 0;
        while (1)
        {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            swap(S[i], S[j]);
            int t = (S[i] + S[j]) % 256;
            tmp[num++] = S[t];
            if (num == cnt) break;
        }
        int ans[300];
        for (int i = 0;i < strlen(clear_text);i++)
            ans[i] = (tmp[i] ^ clear_text[i]);
        for (int i = 0;i < strlen(clear_text);i++) cout << ans[i] << " ";cout << endl;
        return 0;
    }

