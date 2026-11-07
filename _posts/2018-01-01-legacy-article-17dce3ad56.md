---
title: 'LRU'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：LRU'
slug: legacy-article-17dce3ad56
---

# LRU
LRU（Least recently used，最近最少使用）算法根据数据的历史访问记录来进行淘汰数据，把最近一次使用时间离现在时间最远的数据删除掉，其核心思想是“如果数据最近被访问过，那么将来被访问的几率也更高”。

# LinkedHashMap
在LinkedHashMap初始化的时候可以选择一个参数accessOrder，默认为false，map内部会按照插入顺序进行维护。如果设置为true，那么map内部会按照访问顺序进行维护。

LinkedHashMap也提供了一个方法removeEldestEntry，只要重写这个方法，就很容易实现LRU的cache。当调用map的put和putAll方法后会调用removeEldestEntry()检查是否应该删除eldest元素。
# 代码
<!--more-->
构造了一个大小为3的LRU缓存

```
public class LRUDemo {
	public static void main(String[] args) {
		
		LinkedHashMap<String, String> lru = new LinkedHashMap<String, String>(5, 0.75f, true) {
			@Override
			 protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
                return size() > 3;
            }
		};
		
		lru.put("a", "1");
		lru.put("b", "2");
		lru.put("c", "3");
		System.out.println(lru.toString());
		lru.get("b");
		System.out.println(lru.toString());
		lru.put("d", "4");
		System.out.println(lru.toString());
	}
}
{a=1, b=2, c=3}
{a=1, c=3, b=2}
{c=3, b=2, d=4}
```