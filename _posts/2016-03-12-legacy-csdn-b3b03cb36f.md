---
title: LeetCode 2. Add Two Numbers
date: 2016-03-12 01:24:51
tags: ['leetcode']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b3b03cb36f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/50861890

题目： [ https://leetcode.com/problems/add-two-numbers/
](https://leetcode.com/problems/add-two-numbers/)

    
    
    class Solution
    {
    public:
        ListNode* addTwoNumbers(ListNode* l1, ListNode* l2)
        {
            if (l1 == NULL) return l2;
            if (l2 == NULL) return l1;
    
            ListNode *l3, *ans;
            l3 = (ListNode*)malloc(sizeof(ListNode));
            l3 = NULL;
            ans = NULL;
    
            int s = 0;
    
            while (l1 != NULL && l2 != NULL)
            {
                int sum = l1->val + l2->val;
                l1 = l1->next;
                l2 = l2->next;
    
                ListNode *tmp;
                tmp = (ListNode*)malloc(sizeof(ListNode));
                tmp->next = NULL;
                tmp->val = (sum + s) % 10;
                s = (sum + s) / 10;
    
                if (ans == NULL)
                {
                    ans = l3 = tmp;
                }
                else
                {
                    l3->next = tmp;
                    l3 = l3->next;
                }
            }
    
            while (l1 != NULL)
            {
                int sum = l1->val;
                l1 = l1->next;
    
                ListNode *tmp;
                tmp = (ListNode*)malloc(sizeof(ListNode));
                tmp->next = NULL;
                tmp->val = (sum + s) % 10;
                s = (sum + s) / 10;
    
                l3->next = tmp;
                l3 = l3->next;
            }
    
            while (l2 != NULL)
            {
                int sum = l2->val;
                l2 = l2->next;
    
                ListNode *tmp;
                tmp = (ListNode*)malloc(sizeof(ListNode));
                tmp->next = NULL;
                tmp->val = (sum + s) % 10;
                s = (sum + s) / 10;
    
                l3->next = tmp;
                l3 = l3->next;
            }
    
            if (s != 0)
            {
                ListNode *tmp;
                tmp = (ListNode*)malloc(sizeof(ListNode));
                tmp->next = NULL;
                tmp->val = s;
                s = 0;
                l3->next = tmp;
                l3 = l3->next;
            }
            return ans;
        }
    };

