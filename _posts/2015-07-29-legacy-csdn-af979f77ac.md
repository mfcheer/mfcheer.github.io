---
title: unique 函数 c++
date: 2015-07-29 10:20:33
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-af979f77ac
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/47123227

一 unique函数  
作用：从序列中“删除”所有相邻的重复元素。  
既然是删除相邻的重复元素，所以要保证序列有序，用之前要把序列排序，调用sort（）函数。

在STL中unique函数是一个去重函数，
unique的功能是去除相邻的重复元素(只保留一个),其实它并不真正把重复的元素删除，是把重复的元素移到后面去了，然后依然保存到了原数组中，然后
返回去重后最后一个元素的地址。

注意，num的大小并没有改变，依然保存着5个元素；只是这些元素的顺序改变了。调用unique“删除”了相邻的重复值。给“删除”加上引号是因为unique实际上并没有删除任何元素，而是将无重复的元素复制到序列的前段，从而覆盖相邻的重复元素。unique返回的迭代器指向超出无重复的元素范围末端的下一个位置。

注意：算法不直接修改容器的大小。如果需要添加或删除元素，则必须使用容器操作。  
erase（）函数用来删除元素。

demo:

    
    
    int main()
    {
        int num[110];
        int n;
        scanf("%d",&n);
        for(int i=0;i<n;i++)
            scanf("%d",&num[i]);
        sort(num,num+n);
    
        printf("after sort:\n");
        for(int i=0;i<n;i++)
            printf("%d ",num[i]); printf("\n");
    
        vector<int> vec; vec.clear();
        for(int i=0;i<n;i++) vec.push_back(num[i]);
        vector<int>::iterator it,it1;
        it = unique(vec.begin(),vec.end());
    
        unique(num,num+n);
        printf("after use unique:\n");
        for(int i=0;i<n;i++)
            printf("%d ",num[i]); printf("\n");
    
    
        printf("after erase:\n");
        vec.erase(it,vec.end());
        for(it1 = vec.begin();it1 !=vec.end();it1++)
           cout<<*it1 <<" ";cout<<endl;
    
        return 0;
    }
    

运行结果：  
![这里写图片描述](https://img-blog.csdn.net/20150729101755196)

erase函数的原型如下：  
（1）string& erase ( size_t pos = 0, size_t n = npos );  
（2）iterator erase ( iterator position );  
（3）iterator erase ( iterator first, iterator last );  
也就是说有三种用法：  
（1）erase(pos,n); 删除从pos开始的n个字符，比如erase(0,1)就是删除第一个字符  
（2）erase(position);删除position处的一个字符(position是个string类型的迭代器)  
（3）erase(first,last);删除从first到last之间的字符（first和last都是迭代器）

