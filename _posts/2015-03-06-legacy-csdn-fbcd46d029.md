---
title: hdu-2087 剪花布条 【kmp】
date: 2015-03-06 21:21:23
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-fbcd46d029
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44105315

#  剪花布条

** Time Limit: 1000/1000 MS (Java/Others)    Memory Limit: 32768/32768 K
(Java/Others)  
Total Submission(s): 10026    Accepted Submission(s): 6482  
**  
  

Problem Description

一块花布条，里面有些图案，另有一块直接可用的小饰条，里面也有一些图案。对于给定的花布条和小饰条，计算一下能从花布条中尽可能剪出几块小饰条来呢？  

  

Input

输入中含有一些数据，分别是成对出现的花布条和小饰条，其布条都是用可见ASCII字符表示的，可见的ASCII字符有多少个，布条的花纹也有多少种花样。花纹条和小饰条不会超过1000个字符长。如果遇见#字符，则不再进行工作。  

  

Output

输出能从花纹布中剪出的最多小饰条个数，如果一块都没有，那就老老实实输出0，每个结果之间应换行。  

  

Sample Input

abcde a3 aaaaaa aa #

  

Sample Output

0 3

  

Author

qianneng

  

Source

[ 冬练三九之二
](http://acm.hdu.edu.cn/search.php?field=problem&key=%B6%AC%C1%B7%C8%FD%BE%C5%D6%AE%B6%FE&source=1&searchmode=source)

  

  

母串最多可分出几个字串

    
    
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
    #include<sstream>
    #include<time.h>
    #include<malloc.h>
    
    using namespace std;
    
    char a[100000500], b[10005000];
    int Next[10005000], ans;
    
    void get_next(char b[], int m)
    {
    	int i = 0;
    	Next[0] = -1;
    	int j = -1;
    	while (i<m)
    	{
    		if (j == -1 || b[i] == b[j])
    		{
    			++i;
    			++j;
    			if (b[i] == b[j])
    				Next[i] = Next[j];
    			else
    				Next[i] = j;
    		}
    		else
    			j = Next[j];
    	}
    }
    int KMP(char a[], int n, char b[], int m, int Next[], int pos)
    {
    	int i = pos;
    	int j = 0;
    	while (i<n&&j<m)
    	{
    		if (j == -1 || a[i] == b[j])
    		{
    			++i;
    			++j;
    		}
    		else
    			j = Next[j];
    		if (j == m)
    		{
    			ans++;
    			j = Next[j];
    			i += j;
    		}
    	}
    	return ans;
    
    }
    int main()
    {
    	int test, n, m, i, j;
    	while (scanf("%s", a)!=EOF && a[0] != '#')
    	{
    		scanf("%s",b);
    		ans = 0;
    		n = strlen(a);
    		m = strlen(b);
    		get_next(b,m);
    		KMP(a,n,b,m,Next,0);
    		printf("%d\n",ans);
    	}
    }

  
  

