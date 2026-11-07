---
title: 'Runnable 或者 Callable'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Runnable 或者 Callable'
slug: legacy-article-8cc5616e3d
---

# Runnable 或者 Callable
通过实现接口的run方法，实现任务

```
public class LiftOff implements Runnable {
    protected int countDown = 10;
    private static int taskCount = 0;
    private int id = taskCount++;
	public LiftOff() {
		
	}
	public LiftOff(int countDown) {
		this.countDown = countDown;
	}
	public String Status() {
		return "#" + id + "(" + 
				(countDown > 0?countDown : "LiftOff!") + ").";
	}
	@Override
	public void run() {
		while (countDown-- > 0) {
			System.out.print(Status());
			Thread.yield();
		}
		
	}
	public static void main(String[] args) {
		LiftOff launch = new LiftOff(10);
		launch.run();
	}
}
/*
 * Output：
 * #0(9).#0(8).#0(7).#0(6).#0(5).#0(4).#0(3).#0(2).#0(1).#0(LiftOff!).
 * 
 */
```
任务和线程是各自独立的。我们实现了 Runnable 接口的 run（）方法，这只是定义任务，和线程没有任何关系。要实现线程行为，必须显式地将一个任务附着到线程上。

Thread.yield() 它是对线程调度器的一种建议，它在声明：”我已经执行完生命周期中最重要的部分了，此刻可以切换给别的任务，让它们执行吧。”这仅仅是一种建议，线程调度器不一定会执行。当调用 yield()时，其实是在建议线程调度器去调度具有相同优先级的其他线程工作。

# Thread类
将runnable的任务提交给Thread构造器

```
public class BasicThreads {
	public static void main(String[] args) {
		Thread t = new Thread(new LiftOff(10));
		t.start();
		System.out.println("Waiting for LiftOff");
	}
}

/*
 * Output:
 * Waiting for LiftOff
 * #0(9).#0(8).#0(7).#0(6).#0(5).#0(4).#0(3).#0(2).#0(1).#0(LiftOff!)
 * */
 * 
```
Thread 构造器只需要一个 Runnable 对象。调用 start()方法为该线程执行必需的初始化操作，然后调用 Runnable 接口的 run()方法，以便在这个新线程中启动该任务。注意执行结果，在 start()方法执行时，虽然调用了 run()方法，但是 start()迅速返回了（先输出了 Waiting for LiftOff），这是因为：main()方法本身就是一个线程，调用 Thread.start()后系统又创建了一个新的线程，而LiftOff就依附在这个线程上执行。两个线程是同时执行的，互不影响。

Thread 里面有 start()和 run()方法：
- start(): 它的作用是启动一个新线程，新线程会执行相应的run()方法。start()不能被重复调用。
- run()  : run()就和普通的成员方法一样，可以被重复调用。单独调用run()的话，会在当前线程中执行run()，而并不会启动新线程

# 使用 ExecutorService 管理 Thread
单个 Executor 被用来管理系统中所有的任务

```
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class CachedThreadPool {
	public static void main(String[] args) {
		ExecutorService exec = Executors.newCachedThreadPool();
		for(int i = 0; i < 5; i++) {
			exec.execute(new LiftOff(5));
		}
		exec.shutdown();
	}
}
```
在执行完所有的任务后，只需要调用一个 shutdown()即可关闭所有管理的 Thread 对象，非常优雅。我刚开始看这块的时候有个问题，我在 for 循环里调用 exec.execute()，那就相当于 Executor 启动了5个线程，但是下面立马调用了 shutdown()，shutdown()的意思是不能再向当前 exec 提交新任务了。而已经执行的任务则会继续执行；shutdownNow()是强制性的 shutdown,不仅不让提交新任务，还会停止当前正在运行的任务。
## Executor的类型
```
FixedThreadPool(n) 线程数量有限的线程池
CachedThreadPool() 线程数量自动调节的线程池
SingleThreadExecutor() 线程数量为1的线程池
```

# Callable 
Runnable执行独立任务的没有返回值的。
Callable接口，实现call方法，call方法是有返回值的。
但是必须使用ExecutorService.submit()方法去调用它。submit方法会产生Future对象

```
class TaskWithResult implements Callable<String>{
	private int id;
	
	public TaskWithResult(int id){
		this.id = id;
	}
	
	public String call() {
		return "resulit id: " + this.id;
	}
}
public class CallableDemo {
	public static void main(String[] args) throws InterruptedException, ExecutionException{
		ExecutorService exec = Executors.newCachedThreadPool();
	
		ArrayList<Future<String>> results = new ArrayList<Future<String>>();
		
		for(int i = 0;i < 10; i++){
			results.add(exec.submit(new TaskWithResult(i)));
		}
		
		for(Future<String> fs: results){
			if(fs.isDone()){
				System.out.println(fs.get());
			}
		}
		exec.shutdown();
	}
}
resulit id: 0
resulit id: 1
resulit id: 2
resulit id: 3
resulit id: 4
resulit id: 5
resulit id: 6
resulit id: 7
resulit id: 8
resulit id: 9
```

# 休眠

```
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class SleepingTask extends LiftOff{

	public void run(){
		try{
			while (countDown-- > 0){
				System.out.print(Status());
				TimeUnit.MILLISECONDS.sleep(1000);
			}
		}catch(InterruptedException e){
			System.err.println("Interrupted");
		}
	}
	
	public static void main(String[] args){
		ExecutorService exec = Executors.newCachedThreadPool();
		for(int i=0;i<5;i++){
			exec.execute(new SleepingTask());
		}
		exec.shutdown();
	}
}
/*
 * 异常不能跨线程 
 * */
```
对 sleep()的调用可能抛出 InterruptedException 异常（很容易想象，你在睡觉的时候也会被闹钟打断。这里是调用 Thread.interrupt()），并且你可以看到，它在 run()中被捕获。因为异常不能跨线程传播，所以这里抛出的异常是不能被 main 线程捕获的。线程之间只共享指定的临界资源，像异常处理都是线程私有的

# 优先级
通过setPriority和getPriority去修改和获取线程的优先级

```
import java.util.concurrent.*;

import com.sun.corba.se.spi.orb.StringPair;
import com.sun.xml.internal.bind.v2.runtime.RuntimeUtil.ToStringAdapter;

public class SimplePriorities implements Runnable{
	private int countDown = 5;
	private volatile double d;
	private int priority;
	public SimplePriorities(int priority) {
		this.priority = priority;
	}
	public String ToString(){
		return Thread.currentThread() + ": " + countDown;
	}
	
	@Override
	public void run() {
		Thread.currentThread().setPriority(priority);
		while(true){
			for(int i=0;i<100000;i++){
				d += (Math.PI + Math.E) / i;
				if (i % 1000 == 0){
					Thread.yield();
				}
			}
			System.out.println(this.priority);
			if (--countDown == 0)
				return;
		}
		
	}
	
	public static void main(String[] args){
		ExecutorService exec = Executors.newCachedThreadPool();
		for(int i=0;i<5;i++){
			exec.execute(new SimplePriorities(Thread.MIN_PRIORITY));
			exec.execute(new SimplePriorities(Thread.MAX_PRIORITY));
		}
		exec.shutdown();
	}
}
```

# 后台线程

后台线程是指在程序运行的时候在后台提供一种通用服务的线程，并且这种线程并不属于程序中不可或缺的部分（意思是非必要，比如在项目中定时打印线程池的使用状况）。因此，当所有的非后台线程结束时，程序也就终止了，同时会杀死进程中的所有后台线程。所以，只要有任何非后台线程还在运行，程序就不会终止。main()就是一个非后台线程。设置后台线程有一个注意点：必须在 start()之前设定。

```
public class SimpleDaemons implements Runnable {
    public void run() {
        try {
                while (true) {
                    TimeUnit.MILLISECONDS.sleep(100);
                    System.out.println(Thread.currentThread() + " " + this);
                }
            } catch (InterruptedException e) {
                System.out.println("sleep() interrupted");
                e.printStackTrace();
            }
    }

    public static void main(String[]() args) throws InterruptedException {
        for(int i = 0; i < 10; i++) {
            Thread daemon = new Thread(new SimpleDaemons());
            daemon.setDaemon(true); // Must call before start();
            daemon.start();
        }
        System.out.println("All daemons started");
        TimeUnit.MILLISECONDS.sleep(275);
    }
}

```
