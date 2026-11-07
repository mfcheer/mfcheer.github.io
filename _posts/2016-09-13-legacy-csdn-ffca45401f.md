---
title: Linux生产者消费者模型--基于线程条件变量
date: 2016-09-13 02:01:35
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-ffca45401f
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/52521087

##  生产者消费者模型

生产者和消费者之间用中间类似一个队列一样的东西串起来。这个队列可以想像成一个存放产品的“仓库”，生产者只需要关心这个“仓库”，并不需要关心具体的消费者，对于生产者而言甚至都不知道有这些消费者存在。对于消费者而言他也不需要关心具体的生产者，到底有多少生产者也不是他关心的事情，他只要关心这个“仓库”中还有没有东西。这种模型是一种松耦合模型。

##  C代码：

    
    
    #include <stdio.h>
    #include <pthread.h>
    
    #define BUFFER_SIZE 4
    #define OVER -1
    
    struct producers
    {
        int buffer[BUFFER_SIZE];
        pthread_mutex_t lock;
        int readpos,writepos;
        pthread_cond_t notempty;
        pthread_cond_t notfull;
    };
    
    void init(struct producers *b)
    {
        pthread_mutex_init(&b->lock,NULL);
        pthread_cond_init(&b->notempty,NULL);
        pthread_cond_init(&b->notfull,NULL);
        b->readpos = 0;
        b->writepos = 0;
    }
    
    
    void put(struct producers *b, int data)
    {
        pthread_mutex_lock(&b->lock);
        while ((b->writepos + 1)%BUFFER_SIZE == b->readpos)
        {
            pthread_cond_wait(&b->notfull,&b->lock);
        }
        b->buffer[b->writepos] = data;
        b->writepos++;
        if(b->writepos >= BUFFER_SIZE)
            b->writepos = 0;
        pthread_cond_signal(&b->notempty);
        pthread_mutex_unlock(&b->lock);
    }
    
    int get(struct producers *b)
    {
        int data;
        pthread_mutex_lock(&b->lock);
        while (b->writepos == b->readpos)
        {
            pthread_cond_wait(&b->notempty,&b->lock);
        }
        data = b->buffer[b->readpos];
        b->readpos++;
        if(b->readpos >= BUFFER_SIZE)
            b->readpos = 0;
        pthread_cond_signal(&b->notfull);
        pthread_mutex_unlock(&b->lock);
    
        return data;
    }
    
    struct producers buffer;
    
    void *producer(void *data)
    {
        int n;
        for(n=0;n<10;n++)
        {
            printf("Producer: %d--\n",n);
            put(&buffer,n);
        }
        put(&buffer,OVER);
    }
    
    void *consumer(void *data)
    {
        int d;
        while (1)
        {
            d = get(&buffer);
            if (d == OVER)
                break;
            printf("Consumer: %d--\n",d);
        }
    }
    
    int main()
    {
        pthread_t tha,thb;
        void *retval;
    
        init(&buffer);
    
        pthread_create(&tha,NULL,producer,0);
        pthread_create(&thb,NULL,consumer,0);
    
        pthread_join(tha,&retval);
        pthread_join(thb,&retval);
    
        return 0;
    }

##  pthread API:

数据类型  
pthread_t：线程句柄  
pthread_attr_t：线程属性  
线程操纵函数（简介起见，省略参数）  
pthread_create()：创建一个线程  
pthread_exit()：终止当前线程  
pthread_cancel()：中断另外一个线程的运行  
pthread_join()：阻塞当前的线程，直到另外一个线程运行结束  
pthread_attr_init()：初始化线程的属性  
pthread_attr_setdetachstate()：设置脱离状态的属性（决定这个线程在终止时是否可以被结合）  
pthread_attr_getdetachstate()：获取脱离状态的属性  
pthread_attr_destroy()：删除线程的属性  
pthread_kill()：向线程发送一个信号

同步函数  
用于 mutex 和条件变量  
pthread_mutex_init() 初始化互斥锁  
pthread_mutex_destroy() 删除互斥锁  
pthread_mutex_lock()：占有互斥锁（阻塞操作）  
pthread_mutex_trylock()：试图占有互斥锁（不阻塞操作）。当互斥锁空闲时将占有该锁；否则立即返回  
pthread_mutex_unlock(): 释放互斥锁  
pthread_cond_init()：初始化条件变量  
pthread_cond_destroy()：销毁条件变量  
pthread_cond_wait(): 等待条件变量的特殊条件发生  
pthread_cond_signal(): 唤醒第一个调用pthread_cond_wait()而进入睡眠的线程  
Thread-local storage（或者以Pthreads术语，称作 线程特有数据）:  
pthread_key_create(): 分配用于标识进程中线程特定数据的键  
pthread_setspecific(): 为指定线程特定数据键设置线程特定绑定  
pthread_getspecific(): 获取调用线程的键绑定，并将该绑定存储在 value 指向的位置中  
pthread_key_delete(): 销毁现有线程特定数据键

与一起工作的工具函数  
pthread_equal(): 对两个线程的线程标识号进行比较  
pthread_detach(): 分离线程  
pthread_self(): 查询线程自身线程标识号

