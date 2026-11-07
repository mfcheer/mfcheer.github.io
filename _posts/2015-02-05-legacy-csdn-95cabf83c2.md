---
title: hdu 1260 Tickets 【dp】
date: 2015-02-05 15:58:41
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-95cabf83c2
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43529219

#  Tickets

** Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65536/32768 K
(Java/Others)  
Total Submission(s): 1258    Accepted Submission(s): 599  
**  
  

Problem Description

Jesus, what a great movie! Thousands of people are rushing to the cinema.
However, this is really a tuff time for Joe who sells the film tickets. He is
wandering when could he go back home as early as possible.  
A good approach, reducing the total time of tickets selling, is let adjacent
people buy tickets together. As the restriction of the Ticket Seller Machine,
Joe can sell a single ticket or two adjacent tickets at a time.  
Since you are the great JESUS, you know exactly how much time needed for every
person to buy a single ticket or two tickets for him/her. Could you so kind to
tell poor Joe at what time could he go back home as early as possible? If so,
I guess Joe would full of appreciation for your help.  

  

Input

There are N(1 <=N<=10) different scenarios, each scenario consists of 3 lines:  
1) An integer K(1<=K<=2000) representing the total number of people;  
2) K integer numbers(0s<=Si<=25s) representing the time consumed to buy a
ticket for each person;  
3) (K-1) integer numbers(0s<=Di<=50s) representing the time needed for two
adjacent people to buy two tickets together.  

  

Output

For every scenario, please tell Joe at what time could he go back home as
early as possible. Every day Joe started his work at 08:00:00 am. The format
of time is HH:MM:SS am|pm.  

  

Sample Input

2 2 20 25 40 1 8

  

Sample Output

08:00:40 am 08:00:08 am

  

    
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    
    using namespace std;
    
    int t, n;
    int a[10010], b[10010],dp[2100];
    char hh[4], ff[4], mm[4];
    int main()
    {
    	scanf("%d",&t);
    
    	while (t--)
    	{
    		memset(dp,0,sizeof(dp));
    		scanf("%d",&n);
    		for (int i = 1; i <= n; i++)
    			scanf("%d",&a[i]);
    		for (int i = 2; i <= n; i++)
    			scanf("%d",&b[i]);
    
    		dp[1] = a[1];
    
    		for (int i = 2; i <= n; i++)
    			dp[i] = min(dp[i - 1] + a[i], dp[i - 2] + b[i]);
    		int h = dp[n] / (60 * 60); 
    		int f = (dp[n] - (3600 * h))/60;
    		int m = dp[n] % 60;
    		h += 8;
    		hh[0] = h / 10 + '0', hh[1] = h % 10 + '0';
    		ff[0] = f / 10 + '0'; ff[1] = f % 10 + '0';
    		mm[0] = m / 10 + '0'; mm[1] = m % 10 + '0'; 
    		if (h <= 12)
    			printf("%s:%s:%s am\n",hh,ff,mm);
    		else
    			printf("%s:%s:%s pm\n", hh, ff, mm);
    
    	}
    	return 0;
    }
    

  
  

  

