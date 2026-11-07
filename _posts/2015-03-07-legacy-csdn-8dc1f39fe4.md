---
title: poj-2406 Power Strings 【kmp】
date: 2015-03-07 14:52:59
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-8dc1f39fe4
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44116531

Power Strings

**Time Limit:** 3000MS  |  |  **Memory Limit:** 65536K  
---|---|---  
**Total Submissions:** 34716  |  |  **Accepted:** 14367  
  
Description

Given two strings a and b we define a*b to be their concatenation. For
example, if a = "abc" and b = "def" then a*b = "abcdef". If we think of
concatenation as multiplication, exponentiation by a non-negative integer is
defined in the normal way: a^0 = "" (the empty string) and a^(n+1) = a*(a^n).

Input

Each test case is a line of input representing s, a string of printable
characters. The length of s will be at least 1 and will not exceed 1 million
characters. A line containing a period follows the last test case.

Output

For each s you should print the largest n such that s = a^n for some string a.

Sample Input

    
    
    abcd
    aaaa
    ababab
    .
    

Sample Output

    
    
    1
    4
    3
    

Hint

This problem has huge input, use scanf instead of cin to avoid time limit
exceed.

Source

[ Waterloo local 2002.07.01
](http://poj.org/searchproblem?field=source&key=Waterloo+local+2002.07.01)

  

循环节 ，求字符串的循环的最大数量。

  

    
    
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
    	int cases = 1, n, m, i, j, ans;
    	
    	while (scanf("%s",&b)!=EOF && b[0]!='.')
    	{
    		n = strlen(b);
    		get_next(b, n);
    		
    		int t = Next[n];
    
    		int s = n - t;
    		if (n % s == 0)
    			ans = n / s;
    		else
    			ans = 1;
    		printf("%d\n",ans);
    	}
    	return 0;
    }
    

  
  

