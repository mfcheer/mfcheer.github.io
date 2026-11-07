---
title: stl reverse 函数
date: 2015-02-04 13:49:16
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-d006b6ddb5
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43485327

功能：翻转字符串 ，翻转数组， 用于STL的翻转。

头文件： <algorithm>

例子：

    
    
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
    
    char s[100];
    int p[1000];
    
    int main()
    {
    	cin >> s;
    	cout << s << endl;
    	for (int i = 1; i <= 5; i++)
    		cin >> p[i];
    	for (int i = 1; i <= 5; i++)
    		cout << p[i] << " ";
    	cout << endl;
    	reverse(s,s+5);
    	cout << s << endl;
    	reverse(p+1,p+6);
    	for (int i = 1; i <= 5; i++)
    		cout << p[i] << " ";
    	cout << endl;
    
    }

![](https://img-
blog.csdn.net/20150204134901546?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxNDQyNzE5Ng==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)  
  

  

