---
title: Leetcode 151. Reverse Words in a String
date: 2016-04-23 22:49:29
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-bde71f344b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/51228879

题目： [ https://leetcode.com/problems/reverse-words-in-a-string/
](https://leetcode.com/problems/reverse-words-in-a-string/)

代码：

    
    
    class Solution 
    {
    public:
        void reverseWords(string &s)
        {
            string ans;
            ans.clear();
            for (int i = 0;i != s.size() / 2;i++)
                swap(s[i], s[s.size() - i - 1]);
            string tmp;
    
            for (int i = 0;i < s.size();i++)
            {
                if (s[i] != ' ')
                    tmp.push_back(s[i]);
    
                else if (tmp.size() != 0)
                {
                    for (int j = 0;j != tmp.size() / 2;j++)
                        swap(tmp[j], tmp[tmp.size() - j - 1]);
                    if (ans.size() != 0)
                        ans.append(" ");
                    ans += tmp;
                    tmp.clear();
                }
            }
    
            if (tmp.size() != 0)
            {
                if (ans.size() != 0)
                    ans.append(" ");
                for (int j = 0;j != tmp.size() / 2;j++)
                    swap(tmp[j], tmp[tmp.size() - j - 1]);
                ans += tmp;
            }
            s.clear();
            s = ans;
        }
    };
    

