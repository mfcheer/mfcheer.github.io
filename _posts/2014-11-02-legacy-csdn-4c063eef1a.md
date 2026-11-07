---
title: ACM小技巧
date: 2014-11-02 20:51:32
tags: ['二进制', 'acm', 'c语言', 'gcd']
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-4c063eef1a
---

1.一般用C语言节约空间，要用C++库函数或STL时才用C++;  
cout、cin和printf、scanf最好不要混用。

大数据输入输出时最好不要用cin、cout，防止超时。

2.有时候int型不够用，可以用long long或__int64型(两个下划线__)。

值类型表示值介于 -2^63 ( -9,223,372,036,854,775,808)
到2^63-1(+9,223,372,036,854,775,807 )之间的整数。

printf("%I64d",a); //__int64 一般VC编译器使用

printf("%lld",a); //long long 一般g++编译器使用

3.OJ判断是只看输出结果的。

所以大部分题处理一组数据后可以直接输出，就不需要用数组保存每一个Case的数据。

while(case--)

{scanf(...);

......

printf(...);

}

4.纯字符串用puts()输出。

数据大时最好用scanf()、printf()减少时间。

先用scanf()，再用gets()会读入回车。所以在中间加一个getchar();

scanf("%c%c",&c1,&c2)会读入空格；建议用%s读取字符串，取第一个字符。

5\.

读到文件的结尾，程序自动结束 ****

while( ( scanf(  “  %d  ”  , &a) ) != -1 )

while( ( scanf(  “  %d  ”  ,&a) ) != EOF)

while( ( scanf(  “  %d  ”  ,&a) ) == 1 )

while( ~( scanf(  “  %d  ”  ,&a) )  )

读到一个  0  时，程序结束

while( scanf(  “  %d  ”  ,&a) ,a)

读到多个0  时，程序结束

while( scanf(  “  %d%d%d  ”  ,&a,&b,&c),a+b+c ) //a,b,c非负

while( scanf(  “  %d%d%d  ”  ,&a,&b,&c),a|b|c )

6.数组定义int a[10]={0};可以对其全部元素赋值为0；

数组太大不要这样，防止CE。

全局变量，静态变量自动初始化为0；

7.有很多数学题是有规律的，直接推公式或用递归、循环。

8.圆周率=acos(-1.0)  
自然对数=exp(1.0)

9.如果要乘或除2^n,用位移运算速度快。a>>n;a<<n;

10.定义数组时，数组大小最好比告诉的最大范围大一点。

字符数组大小必须比字符串最大长度大1。

处理字符数组时不要忘了在最后加'/0'或者0。

11.擅用三目运算符

int max(int a,int b)

{return a>b?a:b;

}

int gcd(int m,int n)

{return n?gcd(n,m%n):m;

}

int abs(int a)

{return a<0?-a:a;

}

12.将乘法转换成加法减少时间

log(a*b)=log(a)+log(b)

将乘法转换成除法防止溢出

a/(b*c)=a/b/c

13.排序要求不高时可以用C++的STL模板函数sort(),stable_sort()

int a[n]={...};

sort(a,a+n);

bool cmp(int m,int n)

{return m>n;

}

sort(a,a+n,cmp);

14.有的题数据范围小但是计算量大可以用打表法

先把结果算出来保存在数组里，要用时直接取出来。

15.浮点数比较时最好控制精度

#define eps 1e-6

fabs(a-b)<eps

16.有些字符串与整型的转换函数是非标准的

可以使用sscanf()和sprintf()代替

sscanf(s,"%d",&n);//从字符串s中读入整数n

sprintf(s,"%d",n);//将n转换为字符串s

