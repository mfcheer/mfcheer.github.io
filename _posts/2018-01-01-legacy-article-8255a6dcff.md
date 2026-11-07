---
title: 'Apache Kylin'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：Apache Kylin'
slug: legacy-article-8255a6dcff
---

# Apache Kylin
***

![](/assets/images/legacy/MarkdownPhotos/photos/4.png)

Kylin官方文档：http://kylin.apache.org/cn/

Apache Kylin是一个开源的分布式分析引擎，提供Hadoop之上的SQL查询接口及多维分析（OLAP）能力以支持超大规模数据，最初由eBay Inc. 开发并贡献至开源社区。它能在亚秒内查询巨大的Hive表。

## cube维度

Kyliin是个预查询系统，将查询结果(Cube)存储在自己的存储系统(Hbase)中，但其中有很多结果是我们不需要的。这些不需要的我们可以做维度优化来去掉。

Cube所占用的存储空间和维度数、维度值之间不同的组合数、度量，有关。

Cube中有4种维度分别是：
  
  1.普通维度(General dimension)，普通维度是不做任何优化的维度。n个普通的cuboid的数量为2^n
   
  2.强制维度(Mandatory Dimensions)，强制维度是所有cuboid中必有的维度。强制维度可以使cuboid减少一半。

  3.层级维度(Hierarchy Dimensions)，层级维度是有层次关系的维度，使得cuboid中低层次的维度总是伴随着高层次维度的出现。一个有n个层次的层次维度可以使cuboid的数量从2^n 降到n+1。
  
  4.组合维度(Joint Dimensions)，组合维度是将几个维度组合成一个维度，使得这几个维度在cuboid中总是同时出现，适合总是出现在一起的维度。一个有n个维度的组合维度可以使cuboid数量从2^n 降到2


## 注意事项

当我们的度量中有count distinct 类型的时候, 我们在构建cube的时候需要编辑配置，点击Edit(Json),然后在配置中加上:

    "dictionaries": [ 
      { 
        "column": "colname", 
        "reuse": "colname", 
        "builder": "org.apache.kylin.dict.GlobalDictionaryBuilder"
      } 
    ],

度量sum类型必选是数字类型，不能是字符串类型，如果是字符串类型需要先在hive中将其修改成数字类型

Kylin将空字符串认为是null

不同版本的Kylin对sql完善度不同，例如有些版本union all会出错。