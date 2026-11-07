---
title: UVA 11729 COMMANDO WAR【贪心】
date: 2015-06-05 23:47:10
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-f9127f7cfd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/46383447

11729 Commando War

“Waiting for orders we held in the wood, word from the front never came By
evening the sound of the gunfire was miles away Ah softly we moved through the
shadows, slip away through the trees Crossing their lines in the mists in the
fields on our hands and our knees And all that I ever, was able to see The
fire in the air, glowing red, silhouetting the smoke on the breeze” There is a
war and it doesn’t look very promising for your country. Now it’s time to act.
You have a commando squad at your disposal and planning an ambush on an
important enemy camp located nearby. You have N soldiers in your squad. In
your master-plan, every single soldier has a unique responsibility and you
don’t want any of your soldier to know the plan for other soldiers so that
everyone can focus on his task only. In order to enforce this, you brief every
individual soldier about his tasks separately and just before sending him to
the battlefield. You know that every single soldier needs a certain amount of
time to execute his job. You also know very clearly how much time you need to
brief every single soldier. Being anxious to finish the total operation as
soon as possible, you need to find an order of briefing your soldiers that
will minimize the time necessary for all the soldiers to complete their tasks.
You may assume that, no soldier has a plan that depends on the tasks of his
fellows. In other words, once a soldier begins a task, he can finish it
without the necessity of pausing in between.

Input

There will be multiple test cases in the input file. Every test case starts
with an integer N (1 ≤ N ≤ 1000), denoting the number of soldiers. Each of the
following N lines describe a soldier with two integers B (1 ≤ B ≤ 10000) & J
(1 ≤ J ≤ 10000). B seconds are needed to brief the soldier while completing
his job needs J seconds. The end of input will be denoted by a case with N =
0. This case should not be processed. Output For each test case, print a line
in the format, ‘Case X: Y ’, where X is the case number & Y is the total
number of seconds counted from the start of your first briefing till the
completion of all jobs.

Sample Input 3 2 5 3 2 2 1 3 3 3 4 4 5 5 0

Sample Output

Case 1: 8

Case 2: 15  
代码：

    
    
    #include <iostream>  
    #include <cstdio>  
    #include <cstring>  
    #include <algorithm>  
    #include <string>  
    #include <queue>  
    
    using namespace std;
    
    int n;
    
    struct node
    {
        int b, j;
    }p[2010];
    
    bool cmp(node a, node b)
    {
        return a.j > b.j;
    }
    
    int main()
    {
        int cases = 1;
        while (scanf("%d", &n) != EOF)
        {
            if (n == 0) break;
            for (int i = 0; i < n; i++)
                scanf("%d%d",&p[i].b,&p[i].j);
            sort(p, p + n, cmp);
            int ans = 0;
            int tmp = 0;
            for (int i = 0; i < n;i++)
            {
                tmp += p[i].b;
                ans = max(ans,tmp+p[i].j);
            }
            printf("Case %d: %d\n",cases++,ans);
        }
        return 0;
    }

