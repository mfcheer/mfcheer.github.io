---
title: Codeforces Round #279 (Div. 2) A B C
date: 2014-11-25 23:33:30
tags: ['acm', '算法', 'codeforces']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-efeed62b70
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41495521

[ http://codeforces.com/contest/490/problem/A
](http://codeforces.com/contest/490/problem/A)  

A 题 贪心水题

A. Team Olympiad

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

The School №0 of the capital of Berland has  _n_ children studying in it. All
the children in this school are gifted: some of them are good at programming,
some are good at maths, others are good at PE (Physical Education). Hence, for
each child we know value  _t_ _i_ :

  * _t_ _i_ = 1  , if the  _i_ -th child is good at programming, 
  * _t_ _i_ = 2  , if the  _i_ -th child is good at maths, 
  * _t_ _i_ = 3  , if the  _i_ -th child is good at PE 

Each child happens to be good at exactly one of these three subjects.

The Team Scientific Decathlon Olympias requires teams of three students. The
school teachers decided that the teams will be composed of three children that
are good at different subjects. That is, each team must have one
mathematician, one programmer and one sportsman. Of course, each child can be
a member of no more than one team.

What is the maximum number of teams that the school will be able to present at
the Olympiad? How should the teams be formed for that?

Input

The first line contains integer  _n_ (  1 ≤ _n_ ≤ 5000  ) — the number of
children in the school. The second line contains  _n_ integers  _t_ 1  , _t_ 2
, ..., _t_ _n_ (  1 ≤ _t_ _i_ ≤ 3  ), where  _t_ _i_ describes the skill of
the  _i_ -th child.

Output

In the first line output integer  _w_ — the largest possible number of teams.

Then print  _w_ lines, containing three numbers in each line. Each triple
represents the indexes of the children forming the team. You can print both
the teams, and the numbers in the triplets in any order. The children are
numbered from  1  to  _n_ in the order of their appearance in the input. Each
child must participate in no more than one team. If there are several
solutions, print any of them.

If no teams can be compiled, print the only line with value  _w_ equal to 0.

Sample test(s)

input

    
    
    7
    1 3 1 3 2 1 2
    

output

    
    
    2
    3 5 2
    6 7 4
    

input

    
    
    4
    2 1 1 2
    

output

    
    
    0
    
    
    #include <iostream>
    #include <algorithm>
    #include <set>
    #include <map>
    #include <string.h>
    #include <queue>
    #include <sstream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    
    using namespace std;
    
    int n,m;
    int t;
    
    int a[5];
    int b[5005];
    
    int main ()
    {
        while (scanf("%d",&n)!=EOF)
        {
            memset(a,0,sizeof(a));
            for(int i=1;i<=n;i++)
            {
                scanf("%d",&t);
                b[i]=t;
                if(t == 1)
                    a[1]++;
                if(t == 2)
                    a[2]++;
                if(t == 3)
                    a[3]++;
            }
            int ans = min (a[1],min(a[2],a[3]));
            printf("%d\n",ans);
            for(int i=1 ;i<=ans;i++)
            {
                for(int j =1 ;j<=5005;j++)
                {
                    if(b[j] == 1)
                    {
                        printf("%d ",j);
                        b[j] = 0;
                        break;
                    }
    
                }
                for(int j =1 ;j<=n;j++)
                {
                    if(b[j] == 2)
                    {
                        printf("%d ",j);
                        b[j] = 0;
                        break;
                    }
    
                }
                for(int j =1;j<=n;j++)
                {
                    if(b[j] == 3)
                    {
                        printf("%d\n",j);
                        b[j] = 0;
                        break;
                    }
                }
            }
        }
    
        return 0;
    }

  
[ http://codeforces.com/contest/490/problem/B
](http://codeforces.com/contest/490/problem/B)  

  

B. Queue

time limit per test

2 seconds

memory limit per test

256 megabytes

input

standard input

output

standard output

During the lunch break all  _n_ Berland State University students lined up in
the food court. However, it turned out that the food court, too, has a lunch
break and it temporarily stopped working.

Standing in a queue that isn't being served is so boring! So, each of the
students wrote down the number of the student ID of the student that stands in
line directly in front of him, and the student that stands in line directly
behind him. If no one stands before or after a student (that is, he is the
first one or the last one), then he writes down number  0  instead (in Berland
State University student IDs are numerated from  1  ).

After that, all the students went about their business. When they returned,
they found out that restoring the queue is not such an easy task.

Help the students to restore the state of the queue by the numbers of the
student ID's of their neighbors in the queue.

Input

The first line contains integer  _n_ (  2 ≤ _n_ ≤ 2·10  5  ) — the number of
students in the queue.

Then  _n_ lines follow,  _i_ -th line contains the pair of integers  _a_ _i_ ,
_b_ _i_ (  0 ≤ _a_ _i_ , _b_ _i_ ≤ 10  6  ), where  _a_ _i_ is the ID number
of a person in front of a student and  _b_ _i_ is the ID number of a person
behind a student. The lines are given in the arbitrary order. Value  0  is
given instead of a neighbor's ID number if the neighbor doesn't exist.

The ID numbers of all students are distinct. It is guaranteed that the records
correspond too the queue where all the students stand in some order.

Output

Print a sequence of  _n_ integers  _x_ 1  , _x_ 2  , ..., _x_ _n_ — the
sequence of ID numbers of all the students in the order they go in the queue
from the first student to the last one.

Sample test(s)

input

    
    
    4
    92 31
    0 7
    31 0
    7 141
    

output

    
    
    92 7 31 141 
    

Note

The picture illustrates the queue for the first sample.

![](http://espresso.codeforces.com/f089a9d653e574dc26574dc9adce315a616191f9.png)

要将给的数据分为奇数位和偶数位来排。。用ne[]来存后继，pre[]存前驱。再用一个flag[]标记. 每次读入两个数 a，b 让ne[a] =
b,pre[b] = a ,flag [a] = flag[b] = 1;然后让nt从0开始扫一遍就能得到处在偶数位置的数。每次访问后将flag[]置0。
接下来找奇数位置的数。扫一遍flag 直到遇到flag[i]的值为1的时候退出循环。然后tmp = i
,然后从tmp开始扫一遍pre找到第一个位置的数，然后就可以填满奇数位置的数了。  

  

    
    
    #include <iostream>
    #include <algorithm>
    #include <set>
    #include <map>
    #include <string.h>
    #include <queue>
    #include <sstream>
    #include <stdio.h>
    #include <math.h>
    #include <stdlib.h>
    
    using namespace std;
    
    int n;
    int ne[1000010],pre[1000010],flog[1000010];
    int ans [1000010];
    int a,b;
    
    int main ()
    {
    	while (cin>>n)
    	{
    		memset (flog,0,sizeof(flog));
    		memset (ne,-1,sizeof(ne));
    		memset (pre,-1,sizeof(pre));
    		memset (ans,0,sizeof(ans));
    
    		for(int i=1;i<=n;i++)
    		{
    			cin>>a>>b;
    			ne[a] = b;
    			pre[b] = a;
    			flog[a] = 1;
    			flog [b] = 1;
    		}
    		int tmp = 0;
    		int k = 2;
    		while (1)
    		{
    			ans[k]=ne[tmp];
    			flog[tmp]=0;
    
    			k+=2;
    			tmp = ne[tmp];
    			if(tmp <= 0)
    				break;
    		}
    
    		int cnt ;
    		for(int i=1 ;i<=1000000;i++)
    		{
    			if ( flog[i] )
    			{
    				cnt = i;
    				break;
    			}
    		}
    
    		tmp = cnt ;
    		
    		while (1)
    		{
    			if (pre[tmp] < 0)
    				break;
    			tmp = pre[tmp];
    		}
    
    		k=1;
    
    		while (1)
    		{
    			ans[k] = tmp;
    			k+=2;
    			tmp = ne[tmp];
    
    			if (tmp<=0)
    				break;
    		}
    		for(int i=1;i<=n;i++)
    			cout<<ans[i]<<" ";
    		cout<<endl;
    	}
    	return 0;
    }

  

  
http://codeforces.com/contest/490/problem/C  

  

C. Hacking Cypher

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

Polycarpus participates in a competition for hacking into a new secure
messenger. He's almost won.

Having carefully studied the interaction protocol, Polycarpus came to the
conclusion that the secret key can be obtained if he properly cuts the public
key of the application into two parts. The public key is a long integer which
may consist of even a million digits!

Polycarpus needs to find such a way to cut the public key into two nonempty
parts, that the first (left) part is divisible by  _a_ as a separate number,
and the second (right) part is divisible by  _b_ as a separate number. Both
parts should be  positive  integers that have no leading zeros. Polycarpus
knows values  _a_ and  _b_ .

Help Polycarpus and find any suitable method to cut the public key.

Input

The first line of the input contains the public key of the messenger — an
integer without leading zeroes, its length is in range from  1  to  10  6
digits. The second line contains a pair of space-separated positive integers
_a_ ,  _b_ (  1 ≤ _a_ , _b_ ≤ 10  8  ).

Output

In the first line print "  YES  " (without the quotes), if the method
satisfying conditions above exists. In this case, next print two lines — the
left and right parts after the cut. These two parts, being concatenated, must
be exactly identical to the public key. The left part must be divisible by
_a_ , and the right part must be divisible by  _b_ . The two parts must be
positive integers having no leading zeros. If there are several answers, print
any of them.

If there is no answer, print in a single line "  NO  " (without the quotes).

Sample test(s)

input

    
    
    116401024
    97 1024
    

output

    
    
    YES
    11640
    1024
    

input

    
    
    284254589153928171911281811000
    1009 1000
    

output

    
    
    YES
    2842545891539
    28171911281811000
    

input

    
    
    120
    12 1
    

output

    
    
    NO

  

  

    
    
    #include<stdio.h>
    #include<iostream>
    #include<string.h>
    #include<math.h>
    #include<stdlib.h>
    #include<ctype.h>
    #include<algorithm>
    #include<vector>
    #include<string>
    #include<queue>
    #include<stack>
    #include<set>
    #include<utility>
    
    char s[1000000 + 5];
    long long  a,b;
    int ok_a[1000000 + 5],ok_b[1000000 + 5];
    
    int main ()
    {
        while (scanf("%s",s+1)!=EOF)
        {
            int len = strlen(s+1);
            scanf("%I64d %I64d",&a,&b);
            long long tmp ,t;
            tmp = 0;
            for(int i=1;i<=len;i++)
            {
                tmp = (tmp*10 + s[i] - '0')%a;
                if (tmp == 0)
                    ok_a[i] = 1;
                else
                    ok_a[i] = 0;
            }
    
            tmp = 0,t=1;
            for(int i = len;i>=1;i--)
            {
                tmp = ( tmp + t*( s[i] - '0') )%b;
                t = t*10%b;
    
                if (tmp == 0 )
                    ok_b[i] = 1;
                else
                    ok_b[i] = 0;
            }
            int ans ;
            int ok=0;
    		int i;
    
            for (i = 2; i <= len; ++i)
               if (ok_a[i - 1] && ok_b[i] && s[i] != '0') break;
    
           if (i == len + 1) 
    	   {
               puts("NO");
               return 0;
           }
    	   puts("YES");
           for (int j = 1; j < i; ++j)
                putchar(s[j]);
    			puts("");
           for (int j = i; j <= len; ++j)
               putchar(s[j]); puts("");
           return 0;
        }
            return 0;
    }
    

  
  

  

  

