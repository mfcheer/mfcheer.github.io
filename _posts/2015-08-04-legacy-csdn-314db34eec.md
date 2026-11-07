---
title: Codeforces Round #311 (Div. 2)  C. Arthur and Table
date: 2015-08-04 10:49:57
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-314db34eec
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47273501

C. Arthur and Table

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

Arthur has bought a beautiful big table into his new flat. When he came home,
Arthur noticed that the new table is unstable.

In total the table Arthur bought has  _n_ legs, the length of the  _i_ -th leg
is  _l_ _i_ .

Arthur decided to make the table stable and remove some legs. For each of them
Arthur determined number  _d_ _i_ — the amount of energy that he spends to
remove the  _i_ -th leg.

A table with  _k_ legs is assumed to be stable if there are more than half
legs of the maximum length. For example, to make a table with  5  legs stable,
you need to make sure it has at least three (out of these five) legs of the
maximum length. Also, a table with one leg is always stable and a table with
two legs is stable if and only if they have the same lengths.

Your task is to help Arthur and count the minimum number of energy units
Arthur should spend on making the table stable.

Input

The first line of the input contains integer  _n_ (  1 ≤ _n_ ≤ 10  5  ) — the
initial number of legs in the table Arthur bought.

The second line of the input contains a sequence of  _n_ integers  _l_ _i_ (
1 ≤ _l_ _i_ ≤ 10  5  ), where  _l_ _i_ is equal to the length of the  _i_ -th
leg of the table.

The third line of the input contains a sequence of  _n_ integers  _d_ _i_ (  1
≤ _d_ _i_ ≤ 200  ), where  _d_ _i_ is the number of energy units that Arthur
spends on removing the  _i_ -th leg off the table.

Output

Print a single integer — the minimum number of energy units that Arthur needs
to spend in order to make the table stable.

Sample test(s)

input

    
    
    2
    1 5
    3 2
    

output

    
    
    2
    

input

    
    
    3
    2 4 4
    1 1 1
    

output

    
    
    0
    

input

    
    
    6
    2 2 1 1 3 3
    4 3 5 5 2 1
    

output

    
    
    8
    

  

题意：

给你一张桌子，有n条腿，告诉每条腿的长度（l）以及砍掉这条腿的花费（d），当最长腿的数量超过总数量的1/2，那么合法。问如何使得花费最小达到合法情况。  

  

解法：

分别枚举以当前长度为最长的长度，砍去所有长度大于它的。删去长度小于它且花费最少的。

  

代码：

    
    
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
    #include <assert.h>
    
    using namespace std;
    
    const int MAXN = 100010;
    
    int n;
    int cnt[100010];
    int val[100010];
    int cost[210];
    
    struct node
    {
    	int L;
    	int D;
    }a[MAXN], aa[MAXN];
    
    bool cmp1(node a, node b)
    {
    	if (a.L != b.L)
    		return a.L < b.L;
    	return a.D < b.D;
    }
    
    
    int main()
    {
    	while (cin >> n)
    	{
    		memset(cnt, 0, sizeof(cnt));
    		memset(val, 0, sizeof(val));
    		memset(cost, 0, sizeof(cost));
    
    		for (int i = 1; i <= n; i++)
    		{
    			cin >> a[i].L;
    			cnt[a[i].L]++;
    		}
    		for (int i = 1; i <= n; i++)
    			cin >> a[i].D;
    			
    		sort(a + 1, a + 1 + n, cmp1);
    
    		int sum = 0;
    		for (int i = n; i >= 1; i--)
    		{
    			sum += a[i].D;
    			if (a[i].L != a[i - 1].L)
    			{
    				val[a[i - 1].L] = sum;// 比a[i-1].l 长的桌腿的权值和是多少
    			}
    		}
    
    		int ans = val[a[1].L];
    		cost[a[1].D]++;
    		
    		for (int i = 2; i <= n;i++)
    		{
    			if (a[i].L != a[i - 1].L)
    			{
    
    				int tmp = val[a[i].L];
    				int num_k = i - cnt[a[i].L];
    
    				if (num_k > 0)
    				{
    					for (int k = 1; k <= 200; k++)
    					{
    						if (cost[k])
    						{
    							if (cost[k] >= num_k)
    							{
    								tmp += k * num_k;
    								num_k = 0;
    								break;
    							}
    							else
    							{
    								tmp += k * cost[k];
    								num_k -= cost[k];
    							}
    						}
    					}
    				}
    				ans = min(ans, tmp);
    			}
    			cost[a[i].D]++;
    		}
    
    		cout << ans << endl;
    	}
    	return 0;
    }

  
  

  

  

