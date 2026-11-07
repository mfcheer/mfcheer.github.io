---
title: poj-3616 Milking Time 【DP】
date: 2015-03-02 18:31:43
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bcc5d85f90
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44021503

Milking Time

**Time Limit:** 1000MS  |  |  **Memory Limit:** 65536K  
---|---|---  
**Total Submissions:** 5251  |  |  **Accepted:** 2169  
  
Description

Bessie is such a hard-working cow. In fact, she is so focused on maximizing
her productivity that she decides to schedule her next _N_ (1 ≤ _N_ ≤
1,000,000) hours (conveniently labeled 0.. _N_ -1) so that she produces as
much milk as possible.

Farmer John has a list of _M_ (1 ≤ _M_ ≤ 1,000) possibly overlapping intervals
in which he is available for milking. Each interval _i_ has a starting hour (0
≤ _starting_hour i  _ ≤ _N_ ), an ending hour ( _starting_hour i  _ <
_ending_hour i  _ ≤ _N_ ), and a corresponding efficiency (1 ≤ _efficiency i
_ ≤ 1,000,000) which indicates how many gallons of milk that he can get out of
Bessie in that interval. Farmer John starts and stops milking at the beginning
of the starting hour and ending hour, respectively. When being milked, Bessie
must be milked through an entire interval.

Even Bessie has her limitations, though. After being milked during any
interval, she must rest _R_ (1 ≤ _R_ ≤ _N_ ) hours before she can start
milking again. Given Farmer Johns list of intervals, determine the maximum
amount of milk that Bessie can produce in the _N_ hours.

Input

* Line 1: Three space-separated integers: _N_ , _M_ , and _R_   
* Lines 2.. _M_ +1: Line _i_ +1 describes FJ's ith milking interval withthree space-separated integers: _starting_hour i  _ , _ending_hour i  _ , and _efficiency i  _

Output

* Line 1: The maximum number of gallons of milk that Bessie can product in the _N_ hours 

Sample Input

    
    
    12 4 2
    1 2 8
    10 12 19
    3 6 24
    7 10 31

Sample Output

    
    
    43

  

按照结束时间先后排序，因为需要休息实际结束时间为结束时间加上休息时间。

然后DP。

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    
    using namespace std;
    
    int n, m, r, dp[1000100];
    
    struct node
    {
    	int s, e, f;
    }p[1000100];
    
    bool cmp(node a, node b)
    {
    	return a.e < b.e;
    }
    
    int main()
    {
    	while (cin >> n >> m >> r)
    	{
    		for (int i = 0; i < m; i++)
    		{
    			
    			cin >> p[i].s >> p[i].e >> p[i].f;
    			p[i].e += r;
    		}
    
    		sort(p,p+m,cmp);
    
    		for (int i = 0; i < m; i++)
    		{
    			dp[i] = p[i].f;
    			for (int j = 0; j < i; j++)
    			{
    				if (p[i].s >= p[j].e)
    					dp[i] = max(dp[i] , dp[j] + p[i].f);
    			}
    		}
    		int ans = -1;
    		for (int i = 0; i < m; i++)
    			ans = max(ans,dp[i]);
    		cout << ans << endl;
    	}
    	return 0;
    }

  
  

  

