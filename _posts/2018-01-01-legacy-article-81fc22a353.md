---
title: '线程中断（interrupted）'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：线程中断（interrupted）'
slug: legacy-article-81fc22a353
---

# 线程中断（interrupted）
意义是通知线程，有人希望你退出啦！但是线程会如何处理，由线程自己决定。
```
package Chapter02;

public class InterruptDemo {
	public static void main(String[] args) throws InterruptedException{
		Thread t1 = new Thread(){
			public void run(){
				while (true){
					System.out.println("hello");
				}
			}
		};
		t1.start();
		t1.sleep(1000);
		t1.interrupt();
	}
}
不会发生任何中断
```
<!--more-->

```
package Chapter02;

public class InterruptDemo {
	public static void main(String[] args) throws InterruptedException{
		Thread t1 = new Thread(){
			public void run(){
				while (true){
					System.out.println("hello");
					if(Thread.currentThread().interrupted())
						break;
				}
			}
		};
		t1.start();
		t1.sleep(1000);
		t1.interrupt();
	}
}
会发生中断
```
# 等待（wait）和通知（notify）

wait和notify方法在Object类中。什么时候会等待呢，当线程A中调用了obj.wait()，A就会停止继续执行，何时结束呢？当其他线程调用了obj.notify()
```
package Chapter02;

import java.security.PublicKey;

import org.omg.CORBA.PUBLIC_MEMBER;

public class wnDemo {
		final static Object object = new Object();
		public static class T1 extends Thread{
			public void run(){
				synchronized (object) {
					System.out.println("T1 start");
					try{
						System.out.println("T1 wait start");
						object.wait();
					}catch(Exception e){
						System.out.println(e);
					}
					System.out.println("T1 end");
				}
			}
		}
		public static class T2 extends Thread{
			public void run(){
				synchronized (object) {
					System.out.println("T2 start");
					try{
						System.out.println("T2 notify start");
						Thread.sleep(2000);
						object.notify();
						System.out.println("T2 end");
					}catch(Exception e){
						System.out.println(e);
					}
				}
			}
		}
		
		public static void main(String[] args){
			
			Thread t1 = new T1();
			Thread t2 = new T2();
			
			t1.start();
			t2.start();
		}
}
/*
T1 start
T1 wait start
T2 start
T2 notify start
T2 end
T1 end
*/
```
# 挂起和继续执行
Thread类的方法。
# 等待线程结束（join）和谦让（yield）
等待线程结束。等待run方法执行结束，再继续执行。
```
package Chapter02;

public class joinDemo {
	private  static int i = 0;
	
	public static class AddThread extends Thread{
		public void run(){
			for(i=0;i<100000000;i++){
				;
			}
		}
	}
	
	public static void main(String[] args) throws InterruptedException{
		AddThread t1 = new AddThread();
		t1.start();
		t1.join();
		
		System.out.println(i);
	}
}
//100000000
```
Thread.yield()需要解释一下，它是对线程调度器的一种建议，它在声明：”我已经执行完生命周期中最重要的部分了，此刻可以切换给别的任务，让它们执行吧。”这仅仅是一种建议，线程调度器不一定会执行。当调用 yield()时，其实是在建议线程调度器去调度具有相同优先级的其他线程工作。

# volatile与Java内存模型（JMM）
用volatile修饰的变量，线程在每次使用变量的时候，都会读取变量修改后的最的值。volatile很容易被误用，用来进行原子性操作。

1）保证了不同线程对这个变量进行操作时的可见性，即一个线程修改了某个变量的值，这新值对其他线程来说是立即可见的。
2）禁止进行指令重排序。
# 线程组（ThreadGroup）
```
package Chapter02;

public class ThreadGroupDemo implements Runnable{
	@Override
	public void run() {
		String groupName = Thread.currentThread().getThreadGroup().getName()
				+ "-" + Thread.currentThread().getName();
		while(true){
			System.out.println("I am " + groupName);
			try{
				Thread.sleep(2000);
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	}
	
	public static void main(String[] args){
		ThreadGroup tg = new ThreadGroup("Group");
		Thread t1 = new Thread(tg, new ThreadGroupDemo(), "T1"); 
		Thread t2 = new Thread(tg, new ThreadGroupDemo(), "T2"); 
		t1.start();
		t2.start();
		System.out.println(tg.activeCount());
		tg.list();
	}
}
/*
2
I am Group-T1
I am Group-T2
java.lang.ThreadGroup[name=Group,maxpri=10]
    Thread[T1,5,Group]
    Thread[T2,5,Group]
I am Group-T2
I am Group-T1
I am Group-T2
I am Group-T1
I am Group-T1
I am Group-T2
*/
```
# 守护进程（Daemon）
Daemon的作用是为其他线程的运行提供便利服务，守护线程最典型的应用就是 GC (垃圾回收器)，它就是一个很称职的守护者。
User和Daemon两者几乎没有区别，唯一的不同之处就在于虚拟机的离开：如果 User Thread已经全部退出运行了，只剩下Daemon Thread存在了，虚拟机也就退出了。

```
package Chapter02;

public class DaemonDemo{
	static class daemonDemo extends Thread{
		public void run(){
			while (true){
				System.out.println("i am alive");
				try{
					Thread.sleep(1000);
				}catch(Exception e){
					e.printStackTrace();
				}
			}
		}	
	}
	public static void main(String[] args) throws InterruptedException{
		Thread t = new daemonDemo();
		t.setDaemon(true);
		t.start();
		
		Thread.sleep(2000);
	}
}

```

# 线程优先级

```
package Chapter02;

public class PrirityDemo {
	public static class HighPri extends Thread{
		static int count = 0;
		public void run(){
			while (true){
				synchronized (PrirityDemo.class) {
					count++;
					if(count > 10000000){
						System.out.println("HighPri Thread end");
						break;
					}
				}
			}
		}
	}
	public static class LowPri extends Thread{
		static int count = 0;
		public void run(){
			while (true){
				synchronized (PrirityDemo.class) {
					count++;
					if(count > 10000000){
						System.out.println("LowPri Thread end");
						break;
					}
				}
			}
		}
	}
	public static void main(String[] args){
		Thread highThread = new HighPri();
		Thread lowThread = new LowPri();
		highThread.setPriority(Thread.MAX_PRIORITY);
		lowThread.setPriority(Thread.MIN_PRIORITY);
		lowThread.start();
		highThread.start();
	}
}
/*
大多数情况：
HighPri Thread end
LowPri Thread end
*/
```

# 线程安全与synchronized
当synchronized用来修饰一个方法或者一个代码块的时候，能够保证在同一时刻最多只有一个线程执行该段代码。
# 程序中的幽灵：隐蔽的错误