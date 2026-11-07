---
title: hdu 2594 Simpsons’ Hidden Talents 【KMP】
date: 2015-06-05 17:08:45
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-0b3fb7fc0f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46379531

题目链接： [ http://acm.acmcoder.com/showproblem.php?pid=2594
](http://acm.acmcoder.com/showproblem.php?pid=2594)

题意：求最长的串 同时是s1的前缀又是s2的后缀。输出子串和长度。

思路：kmp

代码：

    
    
    #include <vector>
    #include <string>
    #include <algorithm>
    #include <iostream>
    #include <stdio.h>
    #include <string.h>
    
    using namespace std;
    
    char s1[500010],s2[500010];
    char ANS[500010];
    
    void get_next(char x[], int m, int Next[])
    {
        int i, j;
        j = Next[0] = -1;
        i = 0;
        while (i < m)
        {
            while (-1 != j && x[i] != x[j]) j = Next[j];
            Next[++i] = ++j;
        }
    }
    
    int Next[1001000];
    int KMP(char x[], int m, char y[], int n)//x模式串 y主串
    {
        int i, j;
        i = j = 0;
        get_next(x, m, Next);
        if (n > m) i = n - m;
    
        while (i < n)
        {
             if (j == -1 || y[i] == x[j])
            {
                i++;
                j++;
            }
            else j = Next[j];
        }
        return j;
    }
    
    int main()
    {
        while (cin>>s1>>s2)
        {
            int len1 = strlen(s1);
            int len2 = strlen(s2);
            int ans =  KMP(s1, len1, s2, len2);
            if (ans !=0 )
            {
                for(int i=0;i<ans;i++) cout<<s1[i];cout<<" ";
            }
            cout<<ans<<endl;
        }
        return 0;
    }

