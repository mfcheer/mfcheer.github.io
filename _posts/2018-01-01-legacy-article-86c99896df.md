---
title: '布隆过滤器'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：布隆过滤器'
slug: legacy-article-86c99896df
---

# 布隆过滤器

# 适用范围
可以用来实现数据字典，进行数据的判重，或者集合求交集，网页URL的去重，垃圾邮件的判别，集合重复元素的判别，查询加速（比如基于key-value的存储系统）等。

# 原理
Bloom Filter是一种空间效率很高的随机概率数据结构，它利用位数组很简洁地表示一个集合，并能判断一个元素是否属于这个集合。

原理：位数组+k个独立hash函数。将hash函数对应的值的位数组置1，查找时如果发现所有hash函数对应位都是1说明存在，很明显这个过程并不保证查找的结果是100%正确的。同时也不支持删除一个已经插入的关键字，因为该关键字对应的位会牵动到其他的关键字。

一个字节有8个比特位，位图就是利用比特位进行信息存储，节省资源开销的一种方式。这种方法可以用在大数据排序，查询，去重等操作中

# 位图
依赖下面三个元操作

```
将第n位置为1
set_bit(char x,int n)
x |= 1<<n
将第n位置为0
clear_bit(char x,int n)
1 &= ~(1<<n)
取第n位的值
get_bit(char x,int n)
1 & (x>>n)
```

# 详细的介绍
http://blog.csdn.net/dadoneo/article/details/6847481

# Java简单实现

<!--more-->
```
import java.util.*;

public class BloomFilter {
	
	int [] seeds;
	BitSet bitset;
	
	public BloomFilter(int bloomfiterSize,int [] seeds){
		this.seeds = seeds;
		this.bitset = new BitSet(bloomfiterSize);
	}
	
	void add(String s){
		for(int i=0;i<seeds.length;i++){
			int pos = hashFunc(s, seeds[i]);
			bitset.set(pos, true);
		}
	}
	
	Boolean isContain(String s){
		for(int i=0;i<seeds.length;i++){
			int pos = hashFunc(s, seeds[i]);
			if(bitset.get(pos) == false){
				return false;
			}
		}
		return true;
	}
	
	public static int hashFunc(String key, int hashCode){  
	    int arraySize = 100000007;
	    for(int i=0;i<key.length();i++){        
	        int letterValue = key.charAt(i) - 96;
	        hashCode = ((hashCode << 5) + letterValue) % arraySize;
	    }  
	    return Math.abs(hashCode); 
	}  
	
	public static void main(String[] args){
		int bloomfiterSize = (int) Math.pow(2, 32);
		int [] seeds = {1,3,5,7,9,11};
		
		BloomFilter bloomFilter = new BloomFilter(bloomfiterSize, seeds);
		
		String s1 = "1234567";
		String s2 = "12345678";
		
		bloomFilter.add(s1);
		System.out.println(bloomFilter.isContain(s1));
		System.out.println(bloomFilter.isContain(s2));
		bloomFilter.add(s2);
		System.out.println(bloomFilter.isContain(s2));
	}
}
/*
true
false
true
*/
```