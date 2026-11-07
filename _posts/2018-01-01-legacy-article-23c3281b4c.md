---
title: '三种IO'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：三种IO'
slug: legacy-article-23c3281b4c
---

# 三种IO
## Java BIO
同步并阻塞，服务器实现模式为一个连接一个线程，即客户端有连接请求时服务器端就需要启动一个线程进行处理。

## Java NIO：准备好了再通知我
同步非阻塞，服务器实现模式为一个请求一个线程，即客户端发送的请求都会注册到多路复用器上，多路复用器轮询到连接有I/O请求时才启动一个线程进行处理。JDK1.4开始支持。

## Java AIO(NIO.2)：读完了再通知我
异步非阻塞，服务器实现模式为一个有效请求一个线程，客户端的I/O请求都是由OS先完成了再通知服务器应用去启动线程进行处理。JDK7开始支持。

# 关于NIO
- 缓冲区Buffer

Buffer是一个对象，包含一些要写入或者读出的数据。在NIO库中，所有数据都是用缓冲区处理的。缓冲区实际上是一个数组，并提供了对数据结构化访问以及维护读写位置等信息。具体的缓存区有这些：ByteBuffe、CharBuffer、 ShortBuffer、IntBuffer、LongBuffer、FloatBuffer、DoubleBuffer。

- 通道Channel

我们对数据的读取和写入要通过Channel，它就像水管一样，是一个通道。通道不同于流的地方就是通道是双向的，可以用于读、写和同时读写操作。Channel主要分两大类，SelectableChannel用于网络读写，FileChannel用于文件操作。

- 多路复用器Selector

Selector可以不断轮询注册在其上的Channel，如果某个Channel上面发生读或者写事件，这个Channel就处于就绪状态，会被Selector轮询出来，然后通过SelectionKey可以获取就绪Channel的集合，进行后续的I/O操作。一个Selector可以同时轮询多个Channel，因为JDK使用了epoll()代替传统的select实现，所以没有最大连接句柄1024/2048的限制。所以，只需要一个线程负责Selector的轮询，就可以接入成千上万的客户端。

# 适用场景分析
BIO方式适用于连接数目比较小且固定的架构，这种方式对服务器资源要求比较高，但程序直观简单易理解。

NIO方式适用于连接数目多且连接比较短（轻操作）的架构，比如聊天服务器，并发局限于应用中，编程比较复杂。

AIO方式使用于连接数目多且连接比较长（重操作）的架构，比如相册服务器，充分调用OS参与并发操作，编程比较复杂。
<!--more-->
