---
title: '使用ReentrantLock解决哲学家就餐问题'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：使用ReentrantLock解决哲学家就餐问题'
slug: legacy-article-f5c1760d8f
---

哲学家就餐问题可以这样表述，假设有五位哲学家围坐在一张圆形餐桌旁，做以下两件事情之一：吃饭，或者思考。吃东西的时候，他们就停止思考，思考的时候也停止吃东西。餐桌中间有一大碗意大利面，每两个哲学家之间有一只餐叉。因为用一只餐叉很难吃到意大利面，所以假设哲学家必须用两只餐叉吃东西。他们只能使用自己左右手边的那两只餐叉。哲学家就餐问题有时也用米饭和筷子而不是意大利面和餐叉来描述，因为很明显，吃米饭必须用两根筷子。

哲学家从来不交谈，这就很危险，可能产生死锁，每个哲学家都拿着左手的餐叉，永远都在等右边的餐叉（或者相反）。即使没有死锁，也有可能发生资源耗尽。

<!--more-->
使用重入锁ReentrantLock解决。

代码：
```

public class Dinner {
	
	public static int SIZE = 10;
	public static ReentrantLock[] locks = new ReentrantLock[SIZE];
	
	public static class Person extends Thread{
		int pos;
		public Person(int pos) {
			this.pos = pos;
		}
		 public void run() {
			 while(true) {
					 try {
						 //哲学家思考
						 Thread.sleep(1000);
					} catch (InterruptedException e1) {
						e1.printStackTrace();
					}
					if(locks[pos].tryLock()) {
						try {
							if(locks[(pos+1)%SIZE].tryLock()) {
								try {
									 System.out.println("哲学家" + pos + "就餐中...");
									 Thread.sleep(1000);
								} catch (Exception e) {
									e.printStackTrace();
								} finally {
									 locks[(pos+1)%SIZE].unlock();
								}
							 }
						 } finally {
							 locks[pos].unlock();
						 }
					 }
			 }
		 }
	};	
	 public static void main(String[] args) {
	        for (int i = 0; i < SIZE; ++i)
	            locks[i] = new ReentrantLock();
	 
	        for (int i = 0; i < SIZE; ++i)
	            new Person(i).start();
	    }
}
```
输出：

```
哲学家4就餐中...
哲学家8就餐中...
哲学家0就餐中...
哲学家6就餐中...
哲学家2就餐中...
哲学家9就餐中...
哲学家7就餐中...
哲学家5就餐中...
哲学家4就餐中...
哲学家6就餐中...
哲学家8就餐中...
哲学家1就餐中...
哲学家7就餐中...
哲学家0就餐中...
哲学家5就餐中...
哲学家3就餐中...
...
```
