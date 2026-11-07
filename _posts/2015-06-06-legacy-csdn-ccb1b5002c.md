---
title: 信息论与编码 上机
date: 2015-06-06 00:07:25
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ccb1b5002c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383595

香农：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <bitset>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    #include <map>
    #include <set>
    
    using namespace std;
    
    const int MAXN = 11000;
    
    double p[MAXN], sump[MAXN], li[MAXN];
    int n, LI[MAXN];
    char code[MAXN][100];
    bool cmp(double a, double b)
    {
        return a > b;
    }
    void init()
    {
        cout << "请依次输入信源符号的概率：";
        memset(p, 0, sizeof(p));
        memset(sump, 0, sizeof(sump));
        for (int i = 1; i <= n; i++)
            cin >> p[i];
        sort(p + 1, p + 1 + n, cmp);
        for (int i = 2; i <= n; i++)
            sump[i] = sump[i - 1] + p[i - 1];
    }
    
    void solve()
    {
        for (int i = 1; i <= n; i++)
        {
            li[i] = (-1)*(log10(p[i]) / log10(2));
            LI[i] = ceil(li[i]);
        }
    
        for (int i = 1; i <= n; i++)
        {
            for (int j = 0; j < LI[i]; j++)
            {
                sump[i] *= 2;
    
                if (sump[i] - 1 >= 0)
                {
                    code[i][j] = '1';
                    sump[i] -= 1;
                }
                else
                    code[i][j] = '0';
            }
        }
        cout << "编码为：" << endl;
        for (int i = 1; i <= n; i++)
            cout << code[i] << " ";
        cout << endl;
    }
    
    int main()
    {
        cout << "请输入信源符号个数n：";
        cin >> n;
        {
            init();
            solve();
        }
        return 0;
    }
    /*
    测试数据：
    7
    0.20 0.19 0.18 0.17 015 0.10 0.01
    */

费诺：

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <bitset>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    #include <map>
    #include <set>
    #include <iomanip>
    
    using namespace std;
    
    int n;
    double p[10000];
    string *code;
    
    void fano(int a, int b)     
    {
        if ((b - a) >= 1)       
        {
            double sum = 0;
            for (int i = a; i <= b; i++)
                sum += p[i];
            double s1 = 0, *s = new double[10];
            for (int i = a; i <= b; i++)
            {
                s1 += p[i]; s[i] = fabs(2 * s1 - sum) / sum;
            }
            double min = s[a];  int c;
            for (int i = a; i <= b; i++)
                if (s[i] <= min)
                {
                    min = s[i];     c = i;      
                }
            for (int i = a; i <= b; i++)
            {
                if (i <= c) code[i] += "0"; 
                else code[i] += "1";        
            }
    
            if (c == a)
                fano(c + 1, b);
            else if (c == b - 1)
                fano(a, c);
            else
            {
                fano(a, c); fano(c + 1, b);
            }
        }
    }
    void init()
    {
        cout << "请输入信源符号个数n：";
        cin >> n;
        code = new string[n];
        cout << "请依次输入信源符号的概率：";
        for (int i = 0; i<n; i++) cin >> p[i];
        for (int i = 0; i<n - 1; i++)
            for (int j = i + 1; j<n; j++)
                if (p[i] < p[j])
                {
                    double temp = p[i]; p[i] = p[j]; p[j] = temp;
                }
    }
    
    void solve()
    {
        fano(0, n - 1);
        cout << endl << endl << setw(8) << "概率" << setw(8) << "码字"  << endl;
        for (int i = 0; i<n; i++)
            cout << setw(8) << p[i] << setw(8) << code[i] << setw(8) << endl;
        delete[]code;
    }
    
    int main()
    {
        init();
        solve();
        return 0;
    }
    
    /*
    测试数据：
    6
    0.32 0.22 0.18 0.16 0.08 0.04
    8
    0.25 0.25 0.125 0.125 0.0625 0.0625 0.0625 0.0625
    */

尾随后缀：

    
    
    //代码：
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
    #include <map>
    #include <sstream>
    #include <time.h>
    
    using namespace std;
    
    int n, ok, num;
    char s[100000][100], tmp[100];
    char F[100000][100];
    set<string> Ftmp;
    
    void input()
    {
        puts("请输入码字的个数：");
        cin >> n;
        puts("请输入码字：");
        for (int i = 1; i <= n; i++)
            scanf("%s", s[i]);
    }
    
    void Sort()
    {
        for (int i = 1; i <= n; i++)
        {
            for (int j = i; j <= n; j++)
            {
                int len1 = strlen(s[i]);
                int len2 = strlen(s[j]);
                if (len1 > len2)
                {
                    strcpy(tmp, s[i]);
                    strcpy(s[i], s[j]);
                    strcpy(s[j], tmp);
                }
            }
        }
    }
    
    bool isok(char a[], char b[])
    {
        int len1 = strlen(a);
        int len2 = strlen(b);
        for (int i = 0; i < len1; i++)
        {
            if (a[i] != b[i])
                return false;
        }
        return true;
    }
    
    void init()
    {
        Ftmp.clear();
        ok = 0;
        num = 0;
        for (int i = 1; i < n; i++)
        {
            for (int j = i + 1; j <= n; j++)
            {
                int len1 = strlen(s[i]);
                int len2 = strlen(s[j]);
                if (isok(s[i], s[j]))
                {
                    strcpy(tmp, s[j] + len1);
                    strcpy(F[num++], tmp);
                }
            }
        }
        for (int i = 0; i < num; i++)
            Ftmp.insert(F[i]);
    }
    
    void solve()
    {
        int pos = 0;
        for (int i = 0; i < num; i++)
        {
            for (int j = 1; j <= n; j++)
            {
                int len1 = strlen(F[i]);
                int len2 = strlen(s[j]);
                if (len1 < len2)
                {
                    if (isok(F[i], s[j]))
                    {
                        strcpy(tmp, s[j] + len1);
                        strcpy(F[num++], tmp);
    
                        int size = Ftmp.size();
                        Ftmp.insert(tmp);
                        if (Ftmp.size() == size)
                            num -= 1;
                    }
    
                }
            }
        }
    }
    
    void test()
    {
        puts("检验结果：");
        int ok = 0;
        for (int i = 0; i < num; i++)
        {
            if (ok) break;
            for (int j = 1; j <= n; j++)
            {
                if (!strcmp(F[i], s[j]))
                {
                    puts("非唯一可译码");
                    ok = 1;
                    break;
                }
            }
        }
        if (!ok) puts("是唯一可译码");
        printf("\n");
        puts("尾随后缀集合是：");
        for (int i = 0; i < num; i++)
            Ftmp.insert(F[i]);
        set<string> ::iterator it;
        for (it = Ftmp.begin(); it != Ftmp.end(); it++)
            cout << *it << " "; cout << endl;
    
    }
    
    int main()
    {
        input();
        Sort();
        init();
        solve();
        test();
        return 0;
    }
    
    
    //测试数据
    /*
    6
    0 10 1100 1110 1011 1101
    
    5
    110 11 100 00 10
    */

