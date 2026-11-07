---
title: The Minimum Length 【kmp】
date: 2015-03-07 14:31:56
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-70d0dcfa24
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44116355

The Minimum Length

**Time Limit:** 1000  MS **Memory Limit:** 131072  KB **64bit IO Format:**
%lld  & %llu

Submit  [ Status
](http://acm.hust.edu.cn/vjudge/contest/view.action?cid=70325#status//F/0)

Description

There is a string A. The length of A is less than 1,000,000. I rewrite it
again and again. Then I got a new string: AAAAAA...... Now I cut it from two
different position and get a new string B. Then, give you the string B, can
you tell me the length of the shortest possible string A. For example,
A="abcdefg". I got abcd ** efgabcdefgabcde  ** fgabcdefg.... Then I cut the
red part: efgabcdefgabcde as string B. From B, you should find out the
shortest A.

Input

Multiply Test Cases. For each line there is a string B which contains only
lowercase and uppercase charactors. The length of B is no more than 1,000,000.

Output

For each line, output an integer, as described above.

Sample Input

    
    
    bcabcab
    efgabcdefgabcde
    

Sample Output

    
    
    3
    7

  

同样还是循环节的考察，求最短循环节。

    
    
    #include<stdio.h>
    #include<iostream>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string.h>
    #include<queue>
    #include<stack>
    #include<set>
    #include<map>
    
    using namespace std;
    
    char  b[1000500];
    int Next[1000500];
    
    void get_next(char b[], int m)
    {
    	int i = 0,j = -1;
    	memset(Next,0,sizeof(Next));
    	Next[0] = -1;
    	while (b[i])
    	{
    		if (j == -1 || b[i] == b[j])
    		{
    			++i;
    			++j;
    			Next[i] = j;
    		}
    		else
    			j = Next[j];
    	}
    }
    
    int main()
    {
    	int cases = 1, n, m, i, j;
    	
    	while (scanf("%s",&b)!=EOF)
    	{
    		n = strlen(b);
    		get_next(b, n);
    		int ans = 0;
    
    		for (int i = 1; b[i-1]; i++)
    		{
    			int t = Next[i];
    			int s = i - t;
    			if (i % s == 0 )
    			{
    				ans = max(ans,s);
    			}
    		}
    		printf("%d\n",ans);
    	}
    	return 0;
    }
    

  
  

  

  

