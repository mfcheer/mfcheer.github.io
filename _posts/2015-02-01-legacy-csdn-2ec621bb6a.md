---
title: hdu-5167 Fibonacci
date: 2015-02-01 00:28:03
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2ec621bb6a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43354997

链接地址： [ http://acm.hdu.edu.cn/showproblem.php?pid=5167
](http://acm.hdu.edu.cn/showproblem.php?pid=5167)

  

#  Fibonacci

** Time Limit: 2000/1000 MS (Java/Others)    Memory Limit: 65536/65536 K
(Java/Others)  
Total Submission(s): 474    Accepted Submission(s): 126  
**  
  

Problem Description

Following is the recursive definition of Fibonacci sequence:  

F  i  =  ⎧  ⎩  ⎨  0  1  F  i  −  1  \+  F  i  −  2  i = 0  i = 1  i  > 1

  
Now we need to check whether a number can be expressed as the product of
numbers in the Fibonacci sequence.

  

Input

There is a number  T  shows there are  T  test cases below. (  T  ≤  100  ,
000  )  
For each test case , the first line contains a integers n , which means the
number need to be checked.  
0  ≤  n  ≤  1  ,  000  ,  000  ,  000

  

Output

For each case output "Yes" or "No".

  

Sample Input

3 4 17 233

  

Sample Output

Yes No Yes

  

  

    
    
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
    #include <sstream>
    #include <time.h>
    #include <utility>
    #include <malloc.h>
    
    using namespace std;
    
    __int64 p[100];
    int T;
    __int64 n;
    
    int main()
    {
        p[0] = 0; p[1] = 1;
        for (int i = 2; i <= 46; i++)
            p[i] = p[i - 1] + p[i - 2];
    
        set<__int64> q;
        set<long long> ::iterator it;
        q.clear();
        q.insert(0);
        q.insert(1);
        for(it=q.begin();it!=q.end();it++)
        {
             for(int j=3;j<=45;j++)
            {
                int tt = *it;
                __int64 tmp = tt*p[j];
                if (tmp <= 1000000000)
                    q.insert(tmp);
            }
        }
        cin>>T;
        while (T--)
        {
            int ok=0;
            cin>>n;
            if (q.find(n) != q.end())
                cout << "Yes" << endl;
            else
                cout << "No" << endl;
        }
        return 0;
    }
    

  
  

