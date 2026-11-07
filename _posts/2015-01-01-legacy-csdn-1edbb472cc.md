---
title: 'Codeforces_Round_290_(Div._2)_B._Fox_And_Two_Dots'
date: '2015-01-01'
tags: [CSDN备份]
summary: '历史迁移文章：Codeforces_Round_290_(Div._2)_B._Fox_And_Two_Dots'
slug: legacy-csdn-1edbb472cc
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/43458753

题目链接 : [ http://codeforces.com/contest/510/problem/B
](http://codeforces.com/contest/510/problem/B)

B. Fox And Two Dots

time limit per test

2 seconds

memory limit per test

256 megabytes

input

standard input

output

standard output

Fox Ciel is playing a mobile puzzle game called "Two Dots". The basic levels
are played on a board of size  _n_ × _m_ cells, like this:

![](http://espresso.codeforces.com/56dcae7c8d1ee32ea083e76eb5cd70ae21b63c24.png)

Each cell contains a dot that has some color. We will use different uppercase
Latin characters to express different colors.

The key of this game is to find a cycle that contain dots of same color.
Consider 4 blue dots on the picture forming a circle as an example. Formally,
we call a sequence of dots  _d_ 1  , _d_ 2  , ..., _d_ _k_ a  cycle  if and
only if it meets the following condition:

  1. These  _k_ dots are different: if  _i_ ≠ _j_ then  _d_ _i_ is different from  _d_ _j_ . 
  2. _k_ is at least 4. 
  3. All dots belong to the same color. 
  4. For all  1 ≤ _i_ ≤ _k_ - 1  :  _d_ _i_ and  _d_ _i_ + 1  are adjacent. Also,  _d_ _k_ and  _d_ 1  should also be adjacent. Cells  _x_ and  _y_ are called adjacent if they share an edge. 

Determine if there exists a  cycle  on the field.

Input

The first line contains two integers  _n_ and  _m_ (  2 ≤ _n_ , _m_ ≤ 50  ):
the number of rows and columns of the board.

Then  _n_ lines follow, each line contains a string consisting of  _m_
characters, expressing colors of dots in each line. Each character is an
uppercase Latin letter.

Output

Output "  Yes  " if there exists a  cycle  , and "  No  " otherwise.

Sample test(s)

input

    
    
    3 4
    AAAA
    ABCA
    AAAA
    

output

    
    
    Yes
    

input

    
    
    3 4
    AAAA
    ABCA
    AADA
    

output

    
    
    No
    

input

    
    
    4 4
    YYYR
    BYBY
    BBBY
    BBBY
    

output

    
    
    Yes
    

input

    
    
    7 6
    AAAAAB
    ABBBAB
    ABAAAB
    ABABBB
    ABAAAB
    ABBBAB
    AAAAAB
    

output

    
    
    Yes
    

input

    
    
    2 13
    ABCDEFGHIJKLM
    NOPQRSTUVWXYZ
    

output

    
    
    No

DFS 判断是否存在环 。

  

    
    
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
    
    int n, m, ok;
    char s[100][100];
    int vis[100][100];
    int dir[4][2] = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };
    int is_ok(int x, int y)
    {
    	if (x >= 0 && x < n && y >= 0 && y < m)
    		return 1;
    	return 0;
    }
    
    int dfs(int x, int y, int prex, int prey, char c)
    {
    	vis[x][y] = 1;
    	for (int i = 0; i < 4; i++)
    	{
    		int xx = x + dir[i][0];
    		int yy = y + dir[i][1];
    		if (xx == prex && yy == prey) continue;
    		if (is_ok(xx, yy) && s[xx][yy] == c)
    		{
    			if (vis[xx][yy])
    				return 1;
    			if (dfs(xx, yy, x, y, c))
    				return 1;
    		}
    	}
    	return 0;
    }
    
    int main()
    {
    	while (cin >> n >> m)
    	{
    		ok = 0; memset(vis, 0, sizeof(vis));
    		for (int i = 0; i < n; i++)
    			cin >> s[i];
    
    		for (int i = 0; i < n; i++)
    			for (int j = 0; j < m; j++)
    			{
    				if (!vis[i][j])
    					if (dfs(i, j, -1, -1, s[i][j]))
    					{
    						cout << "Yes" << endl;
    						ok = 1;
    						return 0;
    					}
    			}
    		if (!ok)
    			cout << "No" << endl;
    	}
    	return 0;
    }

  
  

  

  

  

