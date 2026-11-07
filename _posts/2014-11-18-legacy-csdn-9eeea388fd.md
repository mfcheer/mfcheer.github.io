---
title: hdu-1711
date: 2014-11-18 22:39:37
tags: ['kmp', 'acm', '算法']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-9eeea388fd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41257907

#  kmp 学习资料： [ http://blog.csdn.net/v_july_v/article/details/7041827
](http://blog.csdn.net/v_july_v/article/details/7041827)  

#  

#  Number Sequence

** Time Limit: 10000/5000 MS (Java/Others)    Memory Limit: 32768/32768 K
(Java/Others)  
Total Submission(s): 12419    Accepted Submission(s): 5661  
**  
  

Problem Description

Given two sequences of numbers : a[1], a[2], ...... , a[N], and b[1], b[2],
...... , b[M] (1  <= M <= 10000, 1 <= N <= 1000000). Your task is to find a
number K which make a[K] = b[1], a[K + 1] = b[2], ...... , a[K + M - 1] =
b[M]. If there are more than one K exist, output the smallest one.  

  

Input

The first line of input is a number T which indicate the number of cases. Each
case contains three lines. The first line is two numbers N and M (1 <= M <=
10000, 1 <= N <= 1000000). The second line contains N integers which indicate
a[1], a[2], ...... , a[N]. The third line contains M integers which indicate
b[1], b[2], ...... , b[M]. All integers are in the range of [-1000000,
1000000].  

  

Output

For each test case, you should output one line which only contain K described
above. If no such K exists, output -1 instead.  

  

Sample Input

2 13 5 1 2 1 2 3 1 2 3 1 3 2 1 2 1 2 3 1 3 13 5 1 2 1 2 3 1 2 3 1 3 2 1 2 1 2
3 2 1

  

Sample Output

6 -1

  

Source

[ HDU 2007-Spring Programming Contest
](http://acm.hdu.edu.cn/search.php?field=problem&key=HDU+2007-Spring+Programming+Contest&source=1&searchmode=source)

  

kmp 模板题  求字串在母串第一次出现的位置

    
    
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
    
    int a[1000005],b[10005];
    int next[10005];
    
    void get_next(int b[],int m)
    {
    	int i=0;
    	next[0]=-1;
    	int j=-1;
    	while(i<m)
    	{
    	 if(j==-1||b[i]==b[j])
    	 {
    		++i;
    		++j;
    	  if(b[i]==b[j])
    	  next[i]=next[j];
    	  else
    	  next[i]=j;
    	}
    	else
    	j=next[j];
       }
    }
    int KMP(int a[],int n,int b[],int m,int next[],int pos)
    {
    	int i=pos;
    	int j=0;
    	while(i<n&&j<m)
    	{
    	if(j==-1||a[i]==b[j])
    	{
    		++i;
    		++j;
    	}
    	else
    	j=next[j];
        }
       if(j>=m)
       return i-j+1;
       else
       return -1;
    }
    int main()
    {
    	int test,n,m,i,j;
    	scanf("%d",&test);
    	while(test--)
    	{
    	 scanf("%d %d",&n,&m);
    	 for(i=0;i<n;++i)
    	 scanf("%d",&a[i]);
    	 for(j=0;j<m;++j)
    	 scanf("%d",&b[j]);
    	 get_next(b,m);
    	 cout<<KMP(a,n,b,m,next,0)<<endl;
    	}
    }
    

  
  

