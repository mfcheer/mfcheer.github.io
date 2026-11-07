---
title: 等概率洗牌算法
date: 2014-10-22 00:13:10
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-7eea1a6edd
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40358581

遍历数组，遇到第i个元素时，产生一个i到n-1之间的随机数，然后两个位子的数互换。  

  

    
    
    void shuff(int *ap, int n)
    
    {
    
        int i;
    
        for (i=0; i<n; i++)
    
        {
    
               int t = rand()%(n-i)+i;
    
               swap(a[i],a[t]);
    
        }
    
    }

  
  

