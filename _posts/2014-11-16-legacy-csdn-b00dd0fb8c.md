---
title: stl 之 优先队列
date: 2014-11-16 23:46:47
tags: ['acm', 'stl']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-b00dd0fb8c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/41186101

priority_queue特别之处在于，允许用户为队列中存储的元素设置优先级。这种队列不是直接将新元素放置在队列尾部，而是放在比它优先级低的元素前面。标准库默认使用<操作符来确定对象之间的优先级关系，所以如果要使用自定义对象，需要重载
< 操作符。

优先队列有两种，一种是最大优先队列；一种是最小优先队列；每次取自队列的第一个元素分别是优先级最大和优先级最小的元素。  

1) 优先队列的定义

包含头文件："queue.h", "functional.h"

可以使用具有默认优先级的已有数据结构；也可以再定义优先队列的时候传入自定义的优先级比较对象；或者使用自定义对象(数据结构)，但是必须重载好< 操作符。

2) 优先队列的常用操作

优先级队列支持的操作  
---  
  
q.empty()         如果队列为空，则返回true，否则返回false

q.size()            返回队列中元素的个数

q.pop()             删除队首元素，但不返回其值

q.top()             返回具有最高优先级的元素值，但不删除该元素

q.push(item)     在基于优先级的适当位置插入新元素

  
  
  
  
其中q.top()为查找操作，在最小优先队列中搜索优先权最小的元素，在最大优先队列中搜索优先权最大的元素。q.pop()为删除该元素。优先队列插入和删除元素的复杂度都是O(lgn)，所以很快

下面为一些基本操作：

    
    
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
    
    using namespace std;
    
    int a[10];;
    
    struct cmp1
    {
        bool operator() (int &a ,int &b)
        {
            return a < b;//最大值优先
        }
    };
    
    struct cmp2
    {
        bool operator() (int &a,int &b)
        {
            return a > b;//最小值优先
        }
    };
    
    struct number1
    {
        int x ;
        bool operator() ( const number1 &a  )const
        {
            return x > a.x;//最小值优先
        }
    };
    
    struct number2
    {
        int x ;
        bool operator() ( const number2 &a )const
        {
            return x < a.x;//最大值优先
        }
    };
    
    int main ()
    {
        priority_queue<int>q;//默认最大值优先
        //priority_queue<int,vector<int>,cmp1>q;
        //priority_queue<int,vector<int>,cmp2>q;
        //priority_queue<number1>q;
        //priority_queue<number2>q;
        //priority_queue< int ,vector<int>,greater<int > >q;
        //priority_queue< int,vector<int>,less<int> >q;
    
        for(int i=1 ;i<=5 ;i++)
            cin>>a[i];
            
        for (int i=1 ;i<=5 ;i++)
        {
            q.push(a[i]);
        }
        
        cout<<q.size()<<endl;
        
        while ( !q.empty() )
        {
            int t = q.top();
            q.pop();
            cout<<t<<" ";
        }
        cout<<endl;
    
        return 0;
    }
    

  
  
  

