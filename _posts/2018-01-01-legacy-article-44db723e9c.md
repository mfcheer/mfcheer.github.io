---
title: 'synchronized关键字'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：synchronized关键字'
slug: legacy-article-44db723e9c
---

# synchronized关键字
当任务要执行被synchronized保护的代码片段的时候，会检查锁是否可用，然后获取锁，执行代码，释放锁。

## 同步规则
如果你正在写一个变量，它接下来可能将被另一个线程读取，或者读取一个上一次已经被另一个线程写过的变量，那么你必须使用同步，并且，读写线程都必须使用相同的监视器锁同步。

```

public class synchronizedDemo implements Runnable {
	public void run() {
		synchronized (this) {
			for (int i = 0; i < 5; i++) {
				System.out.println(Thread.currentThread().getName() + " synchronized loop lock " + i);
			}
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		
		for (int i = 0; i < 5; i++) {
			System.out.println(Thread.currentThread().getName() + " synchronized loop no lock " + i);
		}
	}

	public static void main(String[] args) {
		synchronizedDemo common = new synchronizedDemo();
		
		Thread ta = new Thread(common, "A");
		Thread tb = new Thread(common, "B");
		ta.start();
		tb.start();
	}
}
输出：
A synchronized loop lock 0
A synchronized loop lock 1
A synchronized loop lock 2
A synchronized loop lock 3
A synchronized loop lock 4
A synchronized loop no lock 0
B synchronized loop lock 0
A synchronized loop no lock 1
B synchronized loop lock 1
B synchronized loop lock 2
B synchronized loop lock 3
B synchronized loop lock 4
A synchronized loop no lock 2
A synchronized loop no lock 3
A synchronized loop no lock 4
B synchronized loop no lock 0
B synchronized loop no lock 1
B synchronized loop no lock 2
B synchronized loop no lock 3
B synchronized loop no lock 4
```
被synchronized修饰的代码片段会被阻塞，其它代码块不会阻塞。

# 使用显示的Lock对象
Lock对象必须显示的被创建、锁定和释放。优点的更加的灵活。

```
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class lockDemo implements Runnable{
	Lock lock = new ReentrantLock();

	@Override
	public void run() {
		lock.lock();
		for(int i = 0; i < 10; i++) {
			System.out.println("hello " + Thread.currentThread().getName());
		}
		lock.unlock();
	}
	
	public static void main(String[] args) {
		ExecutorService executorService = Executors.newCachedThreadPool();
		lockDemo lk = new lockDemo();
		for(int i = 0;i < 5; i++) {
			executorService.execute(lk);
		}
	}
	
}
```
- lock()方法是平常使用得最多的一个方法，就是用来获取锁。如果锁已被其他线程获取，则进行等待。
- tryLock()方法是有返回值的，它表示用来尝试获取锁，如果获取成功，则返回true，如果获取失败（即锁已被其他线程获取），则返回false，也就说这个方法无论如何都会立即返回。在拿不到锁时不会一直在那等待。
- tryLock(long time, TimeUnit unit)方法和tryLock()方法是类似的，只不过区别在于这个方法在拿不到锁时会等待一定的时间，在时间期限之内如果还拿不到锁，就返回false。如果如果一开始拿到锁或者在等待期间内拿到了锁，则返回true。
- lockInterruptibly()方法比较特殊，当通过这个方法去获取锁时，如果线程正在等待获取锁，则这个线程能够响应中断，即中断线程的等待状态。也就使说，当两个线程同时通过lock.lockInterruptibly()想获取某个锁时，假若此时线程A获取到了锁，而线程B只有在等待，那么对线程B调用threadB.interrupt()方法能够中断线程B的等待过程。
- unlock()方法，释放锁。
<!--more-->

# volatile关键字
- 读和写一个volatile变量有全局的排序。也就是说每个线程访问一个volatile作用域时会在继续执行之前读取它的当前值，而不是（可能）使用一个缓存的值。(但是并不保证经常读写volatile作用域时读和写的相对顺序，也就是说通常这并不是有用的线程构建)。
- volatile的读和写建立了一个happens-before关系，类似于申请和释放一个互斥锁

1、保证所有线程对该变量的可见性
2、禁止指令重排序优化

# 临界区
希望防止多个线程同时访问方法内部的部分代码而不是整个方法，分离出来的代码片段成为“临界区“，也成为同步控制块

```
synchronized(syncObject){
	//临界区
}
```
也可以使用Lock对象实现。

# 线程本地存储 ThreadLocal
通常情况下，创建的变量是可以被任何一个线程访问并修改的。而使用ThreadLocal创建的变量只能被当前线程访问，其他线程则无法访问和修改。

- set方法，将数据插入线程的存储对象中并返回对象
- get方法，返回线程相关联对象的副本

```
public class threadLocalDemo {

	public static void main(String[] args) {
		Thread t = new Thread() {
			ThreadLocal<String> mStringThreadLocal = new ThreadLocal<>();

			@Override
			public void run() {
				super.run();
				mStringThreadLocal.set("mfcheer");
				System.out.println(mStringThreadLocal.get());
			}
		};
		t.start();
	}
}
输出：
mfcheer
```
