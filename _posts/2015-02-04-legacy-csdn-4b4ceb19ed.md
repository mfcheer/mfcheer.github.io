---
title: hdu-1257 最少拦截系统
date: 2015-02-04 22:29:59
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4b4ceb19ed
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43497767

题目链接： [ http://acm.hdu.edu.cn/showproblem.php?pid=1257
](http://acm.hdu.edu.cn/showproblem.php?pid=1257)

#  最少拦截系统

** Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65536/32768 K
(Java/Others)  
Total Submission(s): 22272    Accepted Submission(s): 8722  
**  
  

Problem Description

某国为了防御敌国的导弹袭击,发展出一种导弹拦截系统.但是这种导弹拦截系统有一个缺陷:虽然它的第一发炮弹能够到达任意的高度,但是以后每一发炮弹都不能超过前一发的高度.某天,雷达捕捉到敌国的导弹来袭.由于该系统还在试用阶段,所以只有一套系统,因此有可能不能拦截所有的导弹.  
怎么办呢?多搞几套系统呗!你说说倒蛮容易,成本呢?成本是个大问题啊.所以俺就到这里来求救了,请帮助计算一下最少需要多少套拦截系统.  

  

Input

输入若干组数据.每组数据包括:导弹总个数(正整数),导弹依此飞来的高度(雷达给出的高度数据是不大于30000的正整数,用空格分隔)  

  

Output

对应每组数据输出拦截所有导弹最少要配备多少套这种导弹拦截系统.  

  

Sample Input

8 389 207 155 300 299 170 158 65

  

Sample Output

2

  

题意就不说了 ，DP题目，也有人说是贪心。。

    
    
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
    #include<string>
    #include<sstream>
    
    using namespace std;
    
    int a[30010];
    
    int main()
    {
    	int n, m;
    	while (cin>>n)
    	{
    		int i = 1;
    		int j;
    		a[0] = 33330;
    		while (n--)
    		{
    			cin >> m;
    			for (j = 0; j <= i; j++)
    			{
    				if (a[j] >= m)
    				{
    					a[j] = m;
    					break;
    				}
    			}
    			if (j>i)
    				a[++i] = m;
    		}
    		cout << i << endl;
    	}
    	return 0;
    }

  
  

  

  

