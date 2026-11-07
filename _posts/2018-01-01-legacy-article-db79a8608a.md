---
title: 'MySQL：Limit分页优化'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：MySQL：Limit分页优化'
slug: legacy-article-db79a8608a
---

## 传统分页：
Select * from table limit 10000,10;

Limit 10000,10 偏移量越大则越慢，这句 SQL 的执行逻辑是:
1.从数据表中读取第N条数据添加到数据集中
2.重复第一步直到 N = 10000 + 10
3.根据 offset 抛弃前面 10000 条数
4.返回剩余的 10 条数据

## 推荐分页：
- 分页方式一：
Select * from table WHERE id>=23434 limit 11;
- 分页方式二：
Select * from table WHERE id >= ( select id from table limit 10000,1 ) limit 10;
- 分页方式三：
Select * from table INNER JOIN (SELECT id from table limit 10000,10) USING(id)
- 分页方式四：
程序取ID: Select id from table limit 10000,10;
Select * from table WHERE ID in(123,456…);
<!--more-->
