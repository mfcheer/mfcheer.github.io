---
title: Codeforces Round #271 (Div. 2) A B D
date: 2014-12-11 14:02:15
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ada135df46
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41865791

[ http://codeforces.com/contest/474 ](http://codeforces.com/contest/474)  

A 水题 枚举每个字符即可

A. Keyboard

time limit per test

2 seconds

memory limit per test

256 megabytes

input

standard input

output

standard output

Our good friend Mole is trying to code a big message. He is typing on an
unusual keyboard with characters arranged in following way:

    
    
    qwertyuiop
    asdfghjkl;
    zxcvbnm,./
    

Unfortunately Mole is blind, so sometimes it is problem for him to put his
hands accurately. He accidentally moved both his hands with one position to
the left or to the right. That means that now he presses not a button he
wants, but one neighboring button (left or right, as specified in input).

We have a sequence of characters he has typed and we want to find the original
message.

Input

First line of the input contains one letter describing direction of shifting (
'L'  or  'R'  respectively for left or right).

Second line contains a sequence of characters written by Mole. The size of
this sequence will be no more than  100  . Sequence contains only symbols that
appear on Mole's keyboard. It doesn't contain spaces as there is no space on
Mole's keyboard.

It is guaranteed that even though Mole hands are moved, he is still pressing
buttons on keyboard and not hitting outside it.

Output

Print a line that contains the original message.

Sample test(s)

input

    
    
    R
    s;;upimrrfod;pbr
    

output

    
    
    allyouneedislove

  

    
    
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
    #include<stdexcept>
    #include<iomanip>
    #include<iterator>
    
    using namespace std;
    
    int n,m;
    char a[3];
    char b[10000];
    
    char p[10000] = {"qwertyuiopasdfghjkl;zxcvbnm,./"};
    
    int main ()
    {
        scanf("%s",a);
        scanf("%s",b);
        int l = strlen(b);
        if (a[0] == 'L')
        {
            for(int i=0;i<l;i++)
            {
                for(int j=0;j<30;j++)
                {
                    if (p[j] == b[i])
                    {
                        printf("%c",p[j+1]);
                        continue;
                    }
                }
            }
            printf("\n");
        }
        else if (a[0] == 'R')
        {
            for(int i=0;i<l;i++)
            {
                for(int j=0;j<30;j++)
                {
                    if (p[j] == b[i])
                    {
                        printf("%c",p[j-1]);
                        continue;
                    }
                }
            }
            printf("\n");
        }
        return 0;
    }

  

  

B. Worms

time limit per test

1 second

memory limit per test

256 megabytes

input

standard input

output

standard output

It is lunch time for Mole. His friend, Marmot, prepared him a nice game for
lunch.

Marmot brought Mole  _n_ ordered piles of worms such that  _i_ -th pile
contains  _a_ _i_ worms. He labeled all these worms with consecutive integers:
worms in first pile are labeled with numbers  1  to  _a_ 1  , worms in second
pile are labeled with numbers  _a_ 1  + 1  to  _a_ 1  \+ _a_ 2  and so on. See
the example for a better understanding.

Mole can't eat all the worms (Marmot brought a lot) and, as we all know, Mole
is blind, so Marmot tells him the labels of the best juicy worms. Marmot will
only give Mole a worm if Mole says correctly in which pile this worm is
contained.

Poor Mole asks for your help. For all juicy worms said by Marmot, tell Mole
the correct answers.

Input

The first line contains a single integer  _n_ (  1 ≤ _n_ ≤ 10  5  ), the
number of piles.

The second line contains  _n_ integers  _a_ 1  , _a_ 2  , ..., _a_ _n_ (  1 ≤
_a_ _i_ ≤ 10  3  ,  _a_ 1  \+ _a_ 2  + ... + _a_ _n_ ≤ 10  6  ), where  _a_
_i_ is the number of worms in the  _i_ -th pile.

The third line contains single integer  _m_ (  1 ≤ _m_ ≤ 10  5  ), the number
of juicy worms said by Marmot.

The fourth line contains  _m_ integers  _q_ 1  , _q_ 2  , ..., _q_ _m_ (  1 ≤
_q_ _i_ ≤ _a_ 1  \+ _a_ 2  + ... + _a_ _n_ ), the labels of the juicy worms.

Output

Print  _m_ lines to the standard output. The  _i_ -th line should contain an
integer, representing the number of the pile where the worm labeled with the
number  _q_ _i_ is.

Sample test(s)

input

    
    
    5
    2 7 3 4 9
    3
    1 25 11
    

output

    
    
    1
    5
    3
    

Note

For the sample input:

  * The worms with labels from [  1  ,  2  ] are in the first pile. 
  * The worms with labels from [  3  ,  9  ] are in the second pile. 
  * The worms with labels from [  10  ,  12  ] are in the third pile. 
  * The worms with labels from [  13  ,  16  ] are in the fourth pile. 
  * The worms with labels from [  17  ,  25  ] are in the fifth pile. 

  

  

    
    
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
    #include<stdexcept>
    #include<iomanip>
    #include<iterator>
    
    using namespace std;
    
    int n,m;
    
    long long  a[1100000];
    long long p[1100000];
    int b;
    
    int main ()
    {
        while (scanf("%d",&n)!=EOF)
        {
            for(int i=0;i<n;i++)
                scanf("%I64d",&a[i]);
    
            long long  sum = 0;
            for(int i=0;i<n;i++)
            {
                for(int j = sum ;j<sum + a[i];j++)
                    p[j] = i;
    
                sum+=a[i];
            }
    
            scanf("%d",&m);
            while (m--)
            {
                scanf("%d",&b);
                printf("%I64d\n",p[b-1]+1);
            }
    
        }
        return 0;
    }

  
  

  

  

D题 dp

D. Flowers

time limit per test

1.5 seconds

memory limit per test

256 megabytes

input

standard input

output

standard output

We saw the little game Marmot made for Mole's lunch. Now it's Marmot's dinner
time and, as we all know, Marmot eats flowers. At every dinner he eats some
red and white flowers. Therefore a dinner can be represented as a sequence of
several flowers, some of them white and some of them red.

But, for a dinner to be tasty, there is a rule: Marmot wants to eat white
flowers only in groups of size  _k_ .

Now Marmot wonders in how many ways he can eat between  _a_ and  _b_ flowers.
As the number of ways could be very large, print it modulo  1000000007  (  10
9  + 7  ).

Input

Input contains several test cases.

The first line contains two integers  _t_ and  _k_ (  1 ≤ _t_ , _k_ ≤ 10  5
), where  _t_ represents the number of test cases.

The next  _t_ lines contain two integers  _a_ _i_ and  _b_ _i_ (  1 ≤ _a_ _i_
≤ _b_ _i_ ≤ 10  5  ), describing the  _i_ -th test.

Output

Print  _t_ lines to the standard output. The  _i_ -th line should contain the
number of ways in which Marmot can eat between  _a_ _i_ and  _b_ _i_ flowers
at dinner modulo  1000000007  (  10  9  + 7  ).

Sample test(s)

input

    
    
    3 2
    1 3
    2 3
    4 4
    

output

    
    
    6
    5
    5
    

Note

  * For  _K_ =  2  and length  1  Marmot can eat (  _R_ ). 
  * For  _K_ =  2  and length  2  Marmot can eat (  _RR_ ) and (  _WW_ ). 
  * For  _K_ =  2  and length  3  Marmot can eat (  _RRR_ ), (  _RWW_ ) and (  _WWR_ ). 
  * For  _K_ =  2  and length  4  Marmot can eat, for example, (  _WWWW_ ) or (  _RWWR_ ), but for example he can't eat (  _WWWR_ ). 
  * 

    
    
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
    #include<stdexcept>
    #include<iomanip>
    #include<iterator>
    
    using namespace std;
    
    int n,m;
    int k,t;
    
    int a,b;
    int mod = 1000000007;
    long long ans[100010];
    
    int main ()
    {
        while (scanf("%d %d",&t,&k)!=EOF)
        {
            for(int i=1;i<k;i++)
                ans[i] = 1;
            ans[k] = 2;
    
            for(int i=k+1;i<=100002;i++)
                ans[i] = (ans[i-1] + ans[i-k]) % mod;
    
            for(int i=2;i<=100002;i++)
                ans[i] = (ans[i] + ans[i-1]) % mod;
    
            for(int i=0;i<t;i++)
            {
                scanf("%d %d",&a,&b);
                long long  anss = (ans[b] - ans[a-1])%mod;
                if (anss < 0)
                        anss += mod;
                printf("%I64d\n",anss);
            }
    
        }
        return 0;
    }
    

  
  

  

  

  

  

  

  

  

  

