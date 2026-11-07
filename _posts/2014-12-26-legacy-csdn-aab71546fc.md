---
title: Codeforces Round #284 (Div. 2)
date: 2014-12-26 19:37:27
tags: ['acm', '算法', 'codeforces']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-aab71546fc
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/42175629

[ http://codeforces.com/contest/499 ](http://codeforces.com/contest/499)

  

A

水

A. Watching a movie

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

You have decided to watch the best moments of some movie. There are two
buttons on your player:

  1. Watch the current minute of the movie. By pressing this button, you watch the current minute of the movie and the player automatically proceeds to the next minute of the movie. 
  2. Skip exactly  _x_ minutes of the movie (  _x_ is some fixed positive integer). If the player is now at the  _t_ -th minute of the movie, then as a result of pressing this button, it proceeds to the minute  ( _t_ \+ _x_ )  . 

Initially the movie is turned on in the player on the first minute, and you
want to watch exactly  _n_ best moments of the movie, the  _i_ -th best moment
starts at the  _l_ _i_ -th minute and ends at the  _r_ _i_ -th minute (more
formally, the  _i_ -th best moment consists of minutes:  _l_ _i_ , _l_ _i_ +
1, ..., _r_ _i_ ).

Determine, what is the minimum number of minutes of the movie you have to
watch if you want to watch all the best moments?

Input

The first line contains two space-separated integers  _n_ ,  _x_ (  1 ≤ _n_ ≤
50  ,  1 ≤ _x_ ≤ 10  5  ) — the number of the best moments of the movie and
the value of  _x_ for the second button.

The following  _n_ lines contain the descriptions of the best moments of the
movie, the  _i_ -th line of the description contains two integers separated by
a space  _l_ _i_ ,  _r_ _i_ (  1 ≤ _l_ _i_ ≤ _r_ _i_ ≤ 10  5  ).

It is guaranteed that for all integers  _i_ from  2  to  _n_ the following
condition holds:  _r_ _i_ - 1  < _l_ _i_ .

Output

Output a single number — the answer to the problem.

Sample test(s)

input

    
    
    2 3
    5 6
    10 12
    

output

    
    
    6
    

input

    
    
    1 1
    1 100000
    

output

    
    
    100000
    

Note

In the first sample, the player was initially standing on the first minute. As
the minutes from the  1  -st to the  4  -th one don't contain interesting
moments, we press the second button. Now we can not press the second button
and skip  3  more minutes, because some of them contain interesting moments.
Therefore, we watch the movie from the  4  -th to the  6  -th minute, after
that the current time is  7  . Similarly, we again skip  3  minutes and then
watch from the  10  -th to the  12  -th minute of the movie. In total, we
watch  6  minutes of the movie.

In the second sample, the movie is very interesting, so you'll have to watch
all  100000  minutes of the movie.

    
    
    #include <iostream>
    #include <cstdio>
    #include <algorithm>
    #include <cstring>
    #include <math.h>
    #include <stdlib.h>
    #include <vector>
    #include <queue>
    
    using namespace std;
    
    struct
    {
        int s;
        int e;
    }p[55];
    
    int n,x;
    
    int main()
    {
        while (scanf("%d %d", &n,&x) != EOF)
        {
            for (int i = 1; i <= n; i++)
            {
                scanf("%d %d",&p[i].s,&p[i].e);
            }
            int pos = 1;
            int ans = 0;
    
            for (int i = 1; i <= n; i++)
            {
                ans += ( p[i].s - pos ) % x;
                ans += p[i].e - p[i].s+1;
                pos = p[i].e + 1;
            }
            printf("%d\n",ans);
        }
        return 0;
    }

  

B

水

B. Lecture

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

You have a new professor of graph theory and he speaks very quickly. You come
up with the following plan to keep up with his lecture and make notes.

You know two languages, and the professor is giving the lecture in the first
one. The words in both languages consist of lowercase English characters, each
language consists of several words. For each language, all words are distinct,
i.e. they are spelled differently. Moreover, the words of these languages have
a one-to-one correspondence, that is, for each word in each language, there
exists exactly one word in the other language having has the same meaning.

You can write down every word the professor says in either the first language
or the second language. Of course, during the lecture you write down each word
in the language in which the word is shorter. In case of equal lengths of the
corresponding words you prefer the word of the first language.

You are given the text of the lecture the professor is going to read. Find out
how the lecture will be recorded in your notes.

Input

The first line contains two integers,  _n_ and  _m_ (  1 ≤ _n_ ≤ 3000  ,  1 ≤
_m_ ≤ 3000  ) — the number of words in the professor's lecture and the number
of words in each of these languages.

The following  _m_ lines contain the words. The  _i_ -th line contains two
strings  _a_ _i_ ,  _b_ _i_ meaning that the word  _a_ _i_ belongs to the
first language, the word  _b_ _i_ belongs to the second language, and these
two words have the same meaning. It is guaranteed that no word occurs in both
languages, and each word occurs in its language exactly once.

The next line contains  _n_ space-separated strings  _c_ 1  , _c_ 2  , ...,
_c_ _n_ — the text of the lecture. It is guaranteed that each of the strings
_c_ _i_ belongs to the set of strings  { _a_ 1  , _a_ 2  , ... _a_ _m_ }  .

All the strings in the input are non-empty, each consisting of no more than
10  lowercase English letters.

Output

Output exactly  _n_ words: how you will record the lecture in your notebook.
Output the words of the lecture in the same order as in the input.

Sample test(s)

input

    
    
    4 3
    codeforces codesecrof
    contest round
    letter message
    codeforces contest letter contest
    

output

    
    
    codeforces round letter round
    

input

    
    
    5 3
    joll wuqrd
    euzf un
    hbnyiyc rsoqqveh
    hbnyiyc joll joll euzf joll
    

output

    
    
    hbnyiyc joll joll un joll
    

  

    
    
    #include <iostream>
    #include <cstdio>
    #include <algorithm>
    #include <cstring>
    #include <string>
    #include <math.h>
    #include <stdlib.h>
    #include <vector>
    #include <queue>
    #include <map>
    
    using namespace std;
    
    struct
    {
        char s[10000];
        char e[10000];
    }p[10000];
    
    int main()
    {
        int n, m;
        while (scanf("%d %d", &n, &m) != EOF)
        {
            
            for (int i = 1; i <= m; i++)
            {
                scanf("%s %s",p[i].s,p[i].e);
                int l1 = strlen(p[i].s);
                int l2 = strlen(p[i].e);
                if (l1 > l2)
                {
                    char c[10000];
                    strcpy(c,p[i].s);
                    strcpy(p[i].s, p[i].e);
                    strcpy(p[i].e, c);
                }
            }
            for (int i = 1; i <= n; i++)
            {
                char c[10000];
                scanf("%s",c);
                for (int j = 1; j <= m; j++)
                {
                    if ( !strcmp(p[j].e, c) || !strcmp(p[j].s, c))
                    {
                        if (i == n)
                        {
                            printf("%s\n", p[j].s);
                        }
                        else
                        {
                            printf("%s ",p[j].s);
                        }
                        break;
                    }
                }
            }
        }
        return 0;
    }

  
  

  

C

C. Crazy Town

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

Crazy Town is a plane on which there are  _n_ infinite line roads. Each road
is defined by the equation  _a_ _i_ _x_ \+ _b_ _i_ _y_ \+ _c_ _i_ = 0  , where
_a_ _i_ and  _b_ _i_ are not both equal to the zero. The roads divide the
plane into connected regions, possibly of infinite space. Let's call each such
region a block. We define an intersection as the point where at least two
different roads intersect.

Your home is located in one of the blocks. Today you need to get to the
University, also located in some block. In one step you can move from one
block to another, if the length of their common border is nonzero (in
particular, this means that if the blocks are adjacent to one intersection,
but have no shared nonzero boundary segment, then it are not allowed to move
from one to another one in one step).

Determine what is the minimum number of steps you have to perform to get to
the block containing the university. It is guaranteed that neither your home
nor the university is located on the road.

Input

The first line contains two space-separated integers  _x_ 1  ,  _y_ 1  (  - 10
6  ≤ _x_ 1  , _y_ 1  ≤ 10  6  ) — the coordinates of your home.

The second line contains two integers separated by a space  _x_ 2  ,  _y_ 2  (
- 10  6  ≤ _x_ 2  , _y_ 2  ≤ 10  6  ) — the coordinates of the university you
are studying at.

The third line contains an integer  _n_ (  1 ≤ _n_ ≤ 300  ) — the number of
roads in the city. The following  _n_ lines contain 3 space-separated integers
(  - 10  6  ≤ _a_ _i_ , _b_ _i_ , _c_ _i_ ≤ 10  6  ;  | _a_ _i_ | + | _b_ _i_
|  > 0  ) — the coefficients of the line  _a_ _i_ _x_ \+ _b_ _i_ _y_ \+ _c_
_i_ = 0  , defining the  _i_ -th road. It is guaranteed that no two roads are
the same. In addition, neither your home nor the university lie on the road
(i.e. they do not belong to any one of the lines).

Output

Output the answer to the problem.

Sample test(s)

input

    
    
    1 1
    -1 -1
    2
    0 1 0
    1 0 0
    

output

    
    
    2
    

input

    
    
    1 1
    -1 -1
    3
    1 0 0
    0 1 0
    1 1 -3
    

output

    
    
    2
    

Note

Pictures to the samples are presented below (A is the point representing the
house; B is the point representing the university, different blocks are filled
with different colors):

![](http://espresso.codeforces.com/f97572ac84c56f590ec97fb132cf2185f6286790.png)
![](http://espresso.codeforces.com/f78b0e061d0f773000df73a4fe26df1f6fd4ddb9.png)

  

带入两点， 判断使两点值符号不同直线有多少个，

不要直接判断 ，long long 不够存

  

    
    
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
    #include<utility> 
    #include<malloc.h> 
    
    using namespace std;
    
    long long  sx, sy, ex, ey;
    int n;
    
    int main()
    {
    		cin >> sx >> sy;
    		cin >> ex >> ey;
    		cin >> n;
    		int ans = 0;
    		while (n--)
    		{
    			long long a, b, c;
    
    			cin >> a >> b >> c;
    			int f1 = (sx * a + sy * b + c) > 0 ? 1 : 0;
    			int f2 = (ex * a + ey * b + c) > 0 ? 1 : 0;
    			if (f1 != f2)
    			{
    				ans++;
    			}
    		}
    		cout << ans << endl;
    	return 0;
    }

  
  

  

  

  

