---
title: hdu-3068 最长回文 【Manacher算法】
date: 2015-03-04 20:36:37
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4d30dccc4c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44065307

Manacher算法学习资料： [ http://blog.csdn.net/dyx404514/article/details/42061017
](http://blog.csdn.net/dyx404514/article/details/42061017)

  

#  最长回文

** Time Limit: 4000/2000 MS (Java/Others)    Memory Limit: 32768/32768 K
(Java/Others)  
Total Submission(s): 9282    Accepted Submission(s): 3194  
**  
  

Problem Description

给出一个只由小写英文字符a,b,c...y,z组成的字符串S,求S中最长回文串的长度.  
回文就是正反读都是一样的字符串,如aba, abba等

  

Input

输入有多组case,不超过120组,每组输入为一行小写英文字符a,b,c...y,z组成的字符串S  
两组case之间由空行隔开(该空行不用处理)  
字符串长度len  <= 110000

  

Output

每一行一个整数x,对应一组case,表示该组case的字符串中所包含的最长回文长度.  

  

Sample Input

aaaa abab

  

Sample Output

4 3

  

Source

[ 2009 Multi-University Training Contest 16 - Host by NIT
](http://acm.hdu.edu.cn/search.php?field=problem&key=2009+Multi-
University+Training+Contest+16+-+Host+by+NIT&source=1&searchmode=source)

  

  

    
    
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
    
    const int N = 110055;
    
    int p[2 * N];//记录回文半径
    char str0[N];//原始串
    char str[2 * N];//转换后的串
    
    void init()
    {
    	int i, l;
    	str[0] = '@'; str[1] = '#';
    	for (i = 0, l = 2; str0[i]; i++, l += 2)
    	{
    		str[l] = str0[i];
    		str[l + 1] = '#';
    	}
    	str[l] = 0;
    }
    int solve()
    {
    	int ans = 0;
    	int i, mx, id;
    	mx = 0;//mx即为当前计算回文串最右边字符的最大值  
    	for (i = 1; str[i]; i++)
    	{
    		if (mx>i) 
    			p[i] = p[2 * id - i]>(mx - i) ? (mx - i) : p[2 * id - i];
    		else	
    			p[i] = 1;//如果i>=mx，要从头开始匹配  
    		while (str[i + p[i]] == str[i - p[i]])	
    			p[i]++;
    		if (i + p[i]>mx)//若新计算的回文串右端点位置大于mx，要更新po和mx的值
    		{
    			mx = i + p[i];
    			id = i;
    		}
    		ans = max(ans,p[i]);
    	}
    	return ans - 1;
    }
    int main()
    {
    	while (scanf("%s", str0) != -1)
    	{
    		init();
    		printf("%d\n", solve());
    	}
    	return 0;
    }

  
  

  

