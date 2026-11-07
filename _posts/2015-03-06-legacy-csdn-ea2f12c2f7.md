---
title: hdu-4513 吉哥系列故事——完美队形II 【Manacher】
date: 2015-03-06 19:29:42
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ea2f12c2f7
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44103569

#  吉哥系列故事——完美队形II

** Time Limit: 3000/1000 MS (Java/Others)    Memory Limit: 65535/32768 K
(Java/Others)  
Total Submission(s): 1159    Accepted Submission(s): 429  
**  
  

Problem Description

吉哥又想出了一个新的完美队形游戏！  
假设有n个人按顺序站在他的面前，他们的身高分别是h[1], h[2] ...
h[n]，吉哥希望从中挑出一些人，让这些人形成一个新的队形，新的队形若满足以下三点要求，则就是新的完美队形：  
  
1、挑出的人保持原队形的相对顺序不变，且必须都是在原队形中连续的；  
2、左右对称，假设有m个人形成新的队形，则第1个人和第m个人身高相同，第2个人和第m-1个人身高相同，依此类推，当然如果m是奇数，中间那个人可以任意；  
3、从左到中间那个人，身高需保证不下降，如果用H表示新队形的高度，则H[1]  <= H[2] <= H[3] .... <= H[mid]。  
  
现在吉哥想知道：最多能选出多少人组成新的完美队形呢？

  

Input

输入数据第一行包含一个整数T，表示总共有T组测试数据(T <= 20)；  
每组数据首先是一个整数n(1 <= n <= 100000)，表示原先队形的人数，接下来一行输入n个整数，表示原队形从左到右站的人的身高（50 <= h
<= 250，不排除特别矮小和高大的）。

  

Output

请输出能组成完美队形的最多人数，每组输出占一行。

  

Sample Input

2 3 51 52 51 4 51 52 52 51

  

Sample Output

3 4

  

Source

[ 2013腾讯编程马拉松初赛第二场（3月22日）
](http://acm.hdu.edu.cn/search.php?field=problem&key=2013%CC%DA%D1%B6%B1%E0%B3%CC%C2%ED%C0%AD%CB%C9%B3%F5%C8%FC%B5%DA%B6%FE%B3%A1%A3%A83%D4%C222%C8%D5%A3%A9&source=1&searchmode=source)

  

manacher 简单变形

  

    
    
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
    
    const int MAXN = 2000100;
    int n, t, ans;
    int s[MAXN];
    int ma[MAXN * 2];
    int mp[MAXN];
    
    void manacher()
    {
    	int l = 0;
    	ma[l++] = 99999999;
    	ma[l++] = 1000000000;
    	for (int i = 0; i < n; i++)
    	{
    		ma[l++] = s[i];
    		ma[l++] = 1000000000;
    	}
    	ma[l] = 88888888;
    	int mx = 0, id = 0;
    	for (int i = 0; i < l; i++)
    	{
    		mp[i] = mx>i ? min(mp[2 * id - i], mx - i) : 1;
    
    		int m = ma[i];
    		while (ma[i + mp[i]] == ma[i - mp[i]] && ma[i-mp[i]] <= ma[i-mp[i]+2]) mp[i]++;	
    		if (i + mp[i] > mx)
    		{
    			mx = i + mp[i];
    			id = i;
    		}
    	}
    }
    
    int main()
    {
    	scanf("%d", &t);
    	while (t--)
    	{
    		ans = 0;
    		memset(s, 0, sizeof(s));
    		memset(mp, 0, sizeof(mp));
    		scanf("%d", &n);
    		for (int i = 0; i < n; i++)
    			scanf("%d", &s[i]);
    		manacher();
    		for (int i = 0; i < n*2+1;i++)
    		ans = max(ans, mp[i] - 1);
    		printf("%d\n", ans);
    	}
    	return 0;
    }
    

  
  

    
    
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
    
    const int MAXN = 2000100;
    int n, t, ans;
    int s[MAXN];
    int ma[MAXN * 2];
    int mp[MAXN];
    
    void manacher()
    {
    	int l = 0;
    	ma[l++] = 99999999;
    	ma[l++] = 1000000000;
    	for (int i = 0; i < n; i++)
    	{
    		ma[l++] = s[i];
    		ma[l++] = 1000000000;
    	}
    	ma[l] = 88888888;
    	int mx = 0, id = 0;
    	for (int i = 0; i < l; i++)
    	{
    		mp[i] = mx>i ? min(mp[2 * id - i], mx - i) : 1;
    
    		int m = ma[i];
    		while (ma[i + mp[i]] == ma[i - mp[i]])
    		{
    			if (ma[i + mp[i]] == 1000000000)
    			{
    				mp[i]++;
    				continue;
    			}
    			if (m >= ma[i + mp[i]])
    			{
    				m = ma[i + mp[i]];
    				mp[i]++;//两行的顺序不能反，因为这里WA了几发
    			}
    			else
    				break;
    		}
    		if (i + mp[i] > mx)
    		{
    			mx = i + mp[i];
    			id = i;
    		}
    		
    	}
    }
    
    int main()
    {
    	scanf("%d", &t);
    	while (t--)
    	{
    		ans = 0;
    		memset(s, 0, sizeof(s));
    		memset(mp, 0, sizeof(mp));
    		scanf("%d", &n);
    		for (int i = 0; i < n; i++)
    			scanf("%d", &s[i]);
    		manacher();
    		for (int i = 0; i < n*2+1;i++)
    		ans = max(ans, mp[i] - 1);
    		printf("%d\n", ans);
    	}
    	return 0;
    }
    

  

  

