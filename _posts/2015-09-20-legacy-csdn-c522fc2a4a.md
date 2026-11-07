---
title: 指针函数与函数指针
date: 2015-09-20 23:40:46
tags: ['语言', '指针', '函数']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c522fc2a4a
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/48607637

##  概念

【指针函数】：返回指针的函数。重点是它是一个函数，只是返回值由普通的值或对象变成了指针，也就是说这个函数返回的是一块内存的地址。

【函数指针】：指向函数的指针。重点是它是一个指针，只是它指向的内容由普通的变量或对象变成了函数，也就是说它可以指向函数的入口地址。

##  指针函数

    
    
    #include <iostream>
    using namespace std;
    
    class MyType{
    public:
        MyType(int value):m_value(value){
            cout<<"Construct."<<endl;
        }
        ~MyType(){
            cout<<"Desconstruct."<<endl;
        }
    public:
        int m_value;
    };
    
    MyType *getInstanceOfMyType(){
        MyType *mt = new MyType(10);
        cout<<mt<<endl;
        return mt;
    }
    
    int main(){
    
        MyType *mt = getInstanceOfMyType();
        cout<<mt<<endl;
        cout<<mt->m_value<<endl;
    
        system("pause");
        return 0;
    }

这段程序的输出是什么呢？如下：

    
    
    Construct.
    00754AA8
    00754AA8
    10
    请按任意键继续. . .

可以看出，在函数”getInstanceOfMyType()”中的对象一直没有被调用析构函数，函数内和函数外的对象的地址是完全一样的，当然，对象里存储的内容m_value的值也是一样的。你可能会问，不是说函数调用完，就销毁局部变量吗？是的，它销毁了，但是它只销毁了”MyType
*mt”这个指针，它指向的内存却不会被销毁。所以，在外面我们仍然可以继续访问这个对象。这种情况下，我们一般是需要在函数调用外面加上我们自己的delete操作的，上面的程序没有添加这样的操作，严格上来讲是一个错误的程序。

使用指针函数时，直接返回函数内部对象的地址，这样就无需重新制造对象的副本，对效率的提升有帮助。但是需要注意的是，一定要记得在函数外部将函数内部申请的内存释放掉，否则就有内存溢出的风险。

##  函数指针

函数指针是一个很有用的技术，它使得我们可以通过指针就能执行某一个函数代码。对于技术高超的人来说，它是一把【绝世好剑】，能够解决很多问题。下面，我们就函数指针来探究一番。

首先，来看一段最简单的函数指针的代码，注意声明和调用的方式。

    
    
    #include <iostream>
    using namespace std;
    
    int printFunc(int value){
        cout<<"this is a print function. the value is:"<<value<<endl;
        return 0;
    }
    
    int main(){
    
        int (*pFunction)(int x); // 这是一个函数指针变量
        pFunction = printFunc;   // 这里将函数入口地址给函数指针
        (*pFunction)(7);         // 通过*运算符获取了函数，再传入参数7执行了函数
    
        system("pause");
        return 0;
    }

对于函数指针，它有两个前提：①．就是指向的函数返回值要与声明的函数指针一致。②．指向的函数的参数类型及个数要与声明的函数指针一致。否则，是无法编译通过的。

##  函数指针类型

函数指针也可以借助typedef声明为一个类型，这样我们就可以像定义int型变量一样来定义一个函数指针了。定义函数指针类型代码如下：、

    
    
    #include <iostream>
    using namespace std;
    
    int printFunc(int value){
        cout<<"this is a print function. the value is:"<<value<<endl;
        return 0;
    }
    typedef int (*PFunction)(int x); // 函数指针类型，注意返回值和参数列表
    
    int main(){
    
        PFunction ptrFunc; // 定义函数指针变量
        ptrFunc = printFunc;
        (*ptrFunc)(1); // 第一种调用方式
        ptrFunc(2);    // 第二种调用方式
    
        system("pause");
        return 0;
    }

转自： [ http://www.cnblogs.com/alephsoul-
alephsoul/archive/2012/10/19/2730337.html ](http://www.cnblogs.com/alephsoul-
alephsoul/archive/2012/10/19/2730337.html)

