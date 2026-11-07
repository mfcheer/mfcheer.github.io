---
title: 观察表达式的规律，计算前n项的和
date: 2015-03-06 12:38:47
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-459eab0e0e
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44098115

    
    
    观察下列表达式的规律，计算前n项的和
    
    2/1 + 3/2 +5/3 +8/5 +13/8+ 21/13
    
    思路：不能由斐波那契额数推分母分子分别为前两项分母分子的和，因为n == 100时，斐波那契数会很大，超出范围，所以找规律：F(n) = 1/F(n-1)+1;
    
    #include <stdio.h>
    #include <iostream>
    #include <string.h>
    #include <algorithm>
    #include <math.h>
    #include <ctype.h>
    #include <time.h>
    #include <queue>
    #include <iterator>
    
    using namespace std;
    
    int n;
    double a = 2;
    
    int main()
    {
    	while (cin >> n)
    	{
    		double sum = 2;
    		double b = a;
    		for (int i = 2; i <= n; i++)
    		{
    			sum += 1 / b + 1;
    			b = 1 / b + 1;
    		}
    		cout << sum << endl;
    	}
    	return 0;
    }
    
    

  

