---
title: poj-1661 Help Jimmy 【DP】
date: 2015-03-04 12:36:28
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-7d0c94fb8a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44058587

Help Jimmy

**Time Limit:** 1000MS  |  |  **Memory Limit:** 10000K  
---|---|---  
**Total Submissions:** 8955  |  |  **Accepted:** 2871  
  
Description

"Help Jimmy" 是在下图所示的场景上完成的游戏。  
![](http://poj.org/images/1661_1.jpg)  
场景中包括多个长度和高度各不相同的平台。地面是最低的平台，高度为零，长度无限。  
  
Jimmy老鼠在时刻0从高于所有平台的某处开始下落，它的下落速度始终为1米/秒。当Jimmy落到某个平台上时，游戏者选择让它向左还是向右跑，它跑动的速度也是1米/秒。当Jimmy跑到平台的边缘时，开始继续下落。Jimmy每次下落的高度不能超过MAX米，不然就会摔死，游戏也会结束。  
  
设计一个程序，计算Jimmy到底地面时可能的最早时间。  

Input

第一行是测试数据的组数t（0  <= t <=
20）。每组测试数据的第一行是四个整数N，X，Y，MAX，用空格分隔。N是平台的数目（不包括地面），X和Y是Jimmy开始下落的位置的横竖坐标，MAX是一次下落的最大高度。接下来的N行每行描述一个平台，包括三个整数，X1[i]，X2[i]和H[i]。H[i]表示平台的高度，X1[i]和X2[i]表示平台左右端点的横坐标。1
<= N <= 1000，-20000 <= X, X1[i], X2[i] <= 20000，0 < H[i] < Y <= 20000（i =
1..N）。所有坐标的单位都是米。  
  
Jimmy的大小和平台的厚度均忽略不计。如果Jimmy恰好落在某个平台的边缘，被视为落在平台上。所有的平台均不重叠或相连。测试数据保证问题一定有解。  

Output

对输入的每组测试数据，输出一个整数，Jimmy到底地面时可能的最早时间。

Sample Input

    
    
    1
    3 8 17 20
    0 10 8
    0 10 13
    4 14 3

Sample Output

    
    
    23

  

    
    
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
    
    int n, x, y, MAX, t, i, j, ok;
    
    struct node
    {
    	int l, r, h;
    }p[1010];
    
    bool cmp(node a, node b)//低到高排序
    {
    	return a.h <= b.h;
    }
    
    int dp[1010][2];
    
    int main()
    {
    	cin >> t;
    	while (t--)
    	{
    		cin >> n >> x >> y >> MAX;
    		for (i = 0; i < n; i++)
    			cin >> p[i].l >> p[i].r >> p[i].h;
    		sort(p,p+n,cmp);
    		p[n].l = x; p[n].r = x; p[n].h = y;
    		dp[0][0] = dp[0][1] =  p[0].h;
    		//从下向上DP,dp[i][0] 左侧最短时间 / dp[i][1] 右侧最短时间
    		for (i = 1; i <= n; i++)
    		{
    			dp[i][0] = dp[i][1] = 100000000;
    			ok = 0;
    			for (j = i-1; j >=0 ; j--)
    				if (p[i].l >= p[j].l && p[i].l <= p[j].r)//左	
    				{
    					ok = 1; break;
    				}
    			if (ok)
    			{
    				if (p[i].h - p[j].h <= MAX)
    					dp[i][0] = min(dp[j][0] + p[i].l - p[j].l, dp[j][1] + p[j].r - p[i].l) + p[i].h - p[j].h;
    			}
    			else if (p[i].h <= MAX)
    					dp[i][0]  = p[i].h;
    			ok = 0;
    			for (j = i-1; j >=0 ; j--)
    				if (p[i].r >= p[j].l && p[i].r <= p[j].r)//右
    				{
    					ok = 1;
    					break;
    				}
    			if (ok)
    			{
    				if (p[i].h - p[j].h <= MAX)
    					dp[i][1] = min(dp[j][0] + p[i].r - p[j].l, dp[j][1] + p[j].r - p[i].r) + p[i].h - p[j].h;
    			}
    			else if(p[i].h <= MAX)
    				dp[i][1] = p[i].h;	
    		}
    		cout << dp[n][0] << endl;
    	}
    	return 0;
    }
    

  
  

  

  

  

