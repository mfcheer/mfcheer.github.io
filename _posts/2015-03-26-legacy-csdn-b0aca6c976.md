---
title: uva 11021 Tribles 【概率】
date: 2015-03-26 21:39:32
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b0aca6c976
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44656463

Description  
Tribbles  
Input: Standard Input  
Output: Standard Output  
GRAVITATION, n.  
“The tendency of all bodies to approach one another with a strength  
proportion to the quantity of matter they contain – the quantity of  
matter they contain being ascertained by the strength of their tendency  
to approach one another. This is a lovely and edifying illustration of  
how science, having made A the proof of B, makes B the proof of A.”  
Ambrose Bierce  
You have a population of kTribbles. This particular species of Tribbles live
for exactly one day and then die. Just before death, a single Tribble has the
probability Pi of giving birth to i more Tribbles. What is the probability
that after m generations, every Tribble will be dead?  
Input  
The first line of input gives the number of cases, N. N test cases follow.
Each one starts with a line containing n (1<= n<=1000) , k (0<= k<=1000) and m
(0<= m<=1000) . The next n lines will give the probabilities P0, P1, …,Pn-1.  
Output  
For each test case, output one line containing “Case #x:” followed by the
answer, correct up to an absolute or relative error of 10-6.  
Sample Input  
Sample Output  
4  
3 1 1  
0.33  
0.34  
0.33  
3 1 2  
0.33  
0.34  
0.33  
3 1 2  
0.5  
0.0  
0.5  
4 2 2  
0.5  
0.0  
0.0  
0.5  
Case #1: 0.3300000  
Case #2: 0.4781370  
Case #3: 0.6250000  
Case #4: 0.3164062

要求计算第m天k个生物全部死亡的概率，f[i]表示第i天全部死亡；

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    
    using namespace std;
    
    const int MAXN = 1010;
    double p[MAXN], f[MAXN];
    int n, k, m;
    int cases = 1;
    
    int main()
    {
        int t;
        scanf("%d",&t);
        while(t--)
        {
            scanf("%d%d%d",&n,&k,&m);
            for (int i = 0; i < n; i++)
                scanf("%lf",&p[i]);
            f[0] = 0; f[1] = p[0];//f[i]表示第i天全部死亡的概率；
            for (int i = 2; i <= m; i++)
            {
                f[i] = 0;
                for (int j = 0; j < n; j++)
                {
                    f[i] += p[j] * pow(f[i-1],j);//j个全部死亡，乘法原理
                }
            }
            printf("Case #%d: %.7lf\n",cases++,pow(f[m],k));
        }
        return 0;
    }

