---
title: C++ volatile关键字
date: 2015-03-01 21:33:18
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-c9cb4acb70
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44006713

#  volatile的介绍

#  直接处理硬件的程序常常包含该关键字，它们的值由程序之外的过程控制。  
volatile告诉编译器编译不对该对象进行优化，volatile
变量是随时可能发生变化的，与volatile变量有关的运算，不要进行编译优化，以免出错，（VC++
在产生release版可执行码时会进行编译优化，加volatile关键字的变量有关的运算，将不进行编译优化。）。  

    
    
    #include <stdio.h>
    
    void main()
    {
    	volatile int i = 10;
    	int a = i;
    
    	printf("i = %d\n", a);
    	__asm {
    		mov dword ptr[ebp - 4], 20h
    	}
    
    	int b = i;
    	printf("i = %d\n", b);
    }

  
输出：10,32

  

  

volatile的主要作用是：提示编译器该对象的值有可能在编译器未监测的情况下被改变。
表示用volatile定义的变量会在程序外被改变,每次都必须从内存中读取，而不能把他放在cache或寄存器中重复使用。

volatile类似于大家所熟知的const也是一个类型修饰符。volatile是给编译器的指示来说明对它所修饰的对象不应该执行优化。volatile的作用就是用来进行多线程编程。在单线程中那就是只能起到限制编译器优化的作用。  
  

volatile用在如下的几个地方：  
1) 中断服务程序中修改的供其它程序检测的变量需要加volatile；  
2) 多任务环境下各任务间共享的标志应该加volatile；  
3) 存储器映射的硬件寄存器通常也要加volatile说明，因为每次对它的读写都可能由不同意义；  

  

