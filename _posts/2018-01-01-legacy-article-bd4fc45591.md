---
title: 'Go-并发基础组件'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Go-并发基础组件'
slug: legacy-article-bd4fc45591
---

## Go语言的CSP模型
CSP 是 Communicating Sequential Process 的简称，中文可以叫做通信顺序进程，是一种并发编程模型。
Go 通过 channel 实现 CSP 通信模型，主要用于 goroutine 之间的消息传递和事件通知。

## goroutine
goroutine上下文切换的耗时，相较于Linux线程上下文之间切换 降低90%(1.46us->0.225us)，且消耗的内存少，8G内存即可创建百万级别的协程

### 并发中的闭包
```go
func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())

	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func() {
			fmt.Println(i)
			wg.Done()
		}()
	}
	wg.Wait()
}
```
输出结果：5 5 5 5 5
为什么呢？ for循环内每次都会调用一个goroutine，但是调用的goroutine启动的速度远比循环要慢，可以把i认为处于主函数的goroutine中。因此当循环中的goroutine开始执行的时候，i的值已经被赋为5，所以打印的值都是共享的i也就是5

解决：
```go
func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(i int) {
			fmt.Println(i)
			wg.Done()
		}(i)
	}
	wg.Wait()
}
```


## sync包
### WaitGroup

### 互斥锁与读写锁
- sync.Mutex互斥锁
- sync.RWMutex读写锁

将程序对资源的访问分为读操作和写操作，这样它的效率就比Mutex要高些。
1、当有人还在占用写锁时，不允计有人读数据
2、多个人（线程）读取数据（拥有读锁）时，互不影响不会造成阻塞

RWMutex 里提供了两种锁：
读锁：调用 RLock 方法开启锁，调用 RUnlock 释放锁
写锁：调用 Lock 方法开启锁，调用 Unlock 释放锁（和 Mutex类似）

例子：
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	lock := &sync.RWMutex{}
	lock.Lock()

	for i := 0; i < 4; i++ {
		go func(i int) {
			fmt.Printf("第 %d 个协程准备开始... \n", i)
			lock.RLock()
			fmt.Printf("第 %d 个协程获得读锁, sleep 1s 后，释放锁\n", i)
			time.Sleep(time.Second)
			lock.RUnlock()
		}(i)
	}

	time.Sleep(time.Second * 2)

	fmt.Println("准备释放写锁，读锁不再阻塞")
	// 写锁一释放，读锁就自由了
	lock.Unlock()

	// 由于会等到读锁全部释放，才能获得写锁
	// 因为这里一定会在上面 4 个协程全部完成才能往下走
	lock.Lock()
	fmt.Println("程序退出...")
	lock.Unlock()
}
/*
第 1 个协程准备开始... 
第 0 个协程准备开始... 
第 3 个协程准备开始... 
第 2 个协程准备开始... 
准备释放写锁，读锁不再阻塞
第 2 个协程获得读锁, sleep 1s 后，释放锁
第 3 个协程获得读锁, sleep 1s 后，释放锁
第 1 个协程获得读锁, sleep 1s 后，释放锁
第 0 个协程获得读锁, sleep 1s 后，释放锁
程序退出...
*/
```

### cond
用途：goroutine 的集合点，或等待或发布一个event。一个cond 是>=2个goroutine之间的任意信号。当条件还没有达成的时候，后续的 goroutine 都会被阻塞。一旦条件达成，被阻塞的 goroutine 会被唤醒。

Cond 的初始化需要传入一个 Locker 接口的实例（通常传入 Mutex 和 RWMutex）如：c := sync.NewCond(&sync.Mutex{})

Wait、Signal 和 Broadcast

调用Wait方法的 goroutine 会被放到 Cond 的等待队列中并阻塞，直到被 Signal 或者 Broadcast 方法唤醒。调用 Wait 方法的时候一定要持有锁 c.L 。c.Wait 并不会阻塞，只是挂起了当前的 goroutine，并允许其他goroutine继续在os上运行
Signal 和 Broadcast两种方式发送信号给其他的goroutine，Signal 是唤醒其中一个，Broadcast唤醒全部
```go
package main
import (
	"fmt"
    "sync"
    "time"
)

var m sync.Mutex
var c = sync.NewCond(&m)
var n = 5

func syncCondtest(i int, running chan int) {
	c.L.Lock()
	fmt.Printf("goroutine:%d wait\n", i)
	running <- i
	c.Wait()
	c.L.Unlock()
	fmt.Printf("goroutine:%d quit \n", i)
}

func main() {
	running := make(chan int, 5)
	for i := 0; i < n; i++ {
		go syncCondtest(i, running)
	}

	//wait all goroutine running if no goroutine running c.Signal do nothing
	for i := 0; i < n; i++ {
		<-running
	}
    
	fmt.Println("one goroutine runnningn")
	c.Signal()
    time.Sleep(1 * time.Second)

    fmt.Println("all goroutine runnningn")
	c.Broadcast()
    
    time.Sleep(1 * time.Second)
/*
goroutine:4 wait
goroutine:1 wait
goroutine:0 wait
goroutine:2 wait
goroutine:3 wait
one goroutine runnningn
goroutine:4 quit 
all goroutine runnningn
goroutine:1 quit 
goroutine:3 quit 
goroutine:2 quit 
goroutine:0 quit
*/
}
```
### once
sync.Once

var one sync.Once
one.Do(xxx)保证传入的xxx只会调用一次，one再次使用是无效的，因为one保证的是Do方法只被调用一次

### sync.Pool池
池是用来做缓存进行 存取 对象的池子，较少GC带来的损耗，避免重复的创建、销毁
通过Get方法获取对象，Put方法存入对象

初始化 Pool时，需要设置好 New 函数。当调用 Get 方法时，如果池子里缓存了对象，就直接返回缓存的对象。如果没有存货，则调用 New 函数创建一个新的对象。

下面的例子：
```go
package main

import (
    "fmt"
    "sync"
)

var pool *sync.Pool

type Person struct {
    Name string
}

func initPool() {
    pool = &sync.Pool {
        New: func()interface{} {
            fmt.Println("Creating a new Person")
            return &Person{Name: "None"}
        },
    }
}

func main() {
    initPool()

    p := pool.Get().(*Person) // A
    fmt.Println("首次从 pool 里获取：", p)

    p.Name = "first"
    fmt.Printf("设置 p.Name = %s\n", p.Name)

    pool.Put(p)

    fmt.Println("Pool 里已有一个对象，调用 Get: ", pool.Get().(*Person)) // B
    fmt.Println("Pool 没有对象了，调用 Get: ", pool.Get().(*Person)) // C
}
/*
Creating a new Person
首次从 pool 里获取： &{None}
设置 p.Name = first
Pool 里已有一个对象，调用 Get:  &{first}
Creating a new Person
Pool 没有对象了，调用 Get:  &{None}

运行结束，执行耗时：1毫秒
*/
```
A、C处获取对象时，池中已为空，所以获取到的是New的新对象

## channel
充当goroutine之间通信的管道

channel 是阻塞的，当从空的channel读取数据时如果 channel为空，则会等待有数据写入channel
下面的例子：main的goroutine并不会退出导致而创建的匿名goroutine无法写入内容，反而会阻塞等待写入
```go
package main
import (
	"fmt"
)

func main() {
    stringStream := make(chan string)
    go func(){
        stringStream <- "hello"
    }()

     fmt.Println(<-stringStream)
}
```

## select语句
当select 的 case中多个channel 可用时，Go会随机选取其中一个进行读取
如果没有channel可用，我们可以选取超时机制避免阻塞
```go
var c <- chan int
select {
	case <-c: xxx
	case time.After(1 * time.Second): xxx
}
```
或者使用default
```go
var c <- chan int
select {
	case <-c: xxx
	default: xxx
}
```
## GOMAXPROCS控制
runtime的GOMAXPROCS函数，控制使用的CPU核数。
[Go 为什么这么“快”](https://zhuanlan.zhihu.com/p/111346689)  中讲解了Go的GPM模型