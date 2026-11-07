---
title: hdu-1004
date: 2014-10-31 10:44:31
tags: ['map', 'c语言']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-5aef5a8f30
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40650803

map的应用

    
    
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
    #include<map>
    
    using namespace std;
    
    int main()  
    {  
        int n;  
        map<string,int> s;  
        while(cin>>n && n)
        {
            string str ;
            s.clear();
            for(int i=0;i<n;i++)
            {
                cin>> str;
                s[str]++;
            }
    
            map<string,int>::iterator r; 
            int max=-1;
    
            for(r=s.begin ();r != s.end();r++)
            {
                if(r->second > max)
                    max=r ->second ;
            }
            for(r=s.begin ();r!=s.end();r++)
            {
                if(r->second ==max)
                    cout<<r->first << endl; 
            }
        }
    
        return 0;  
    }  

  
  

