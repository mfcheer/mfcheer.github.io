---
title: '高频词'
date: '2018-01-01'
tags: [历史文章]
summary: '历史迁移文章：高频词'
slug: legacy-article-6aaae60dde
---

CountVectorizer是用于产生文本统计类特征的工具。将分词后的多个文章作为输入，词频统计结果作为输出。

<https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.CountVectorizer.html#sklearn.feature_extraction.text.CountVectorizer>

<!--more-->

假设通过jieba分词处理好的数据为  ['hello', 'hello everyone', 'hello china'] 

```
from sklearn.feature_extraction.text import CountVectorizer

vectorizer = CountVectorizer(min_df=1, max_features=300)

words_lists = ['hello', 'hello everyone', 'hello china']
X = vectorizer.fit_transform(words_lists)

# 高频词
feature_names = vectorizer.get_feature_names()
print feature_names

# 词频字典
feature_name_count = vectorizer.vocabulary_
print feature_name_count

# 高频词汇的01特征矩阵
print X.A

输出：
[u'china', u'everyone', u'hello']
{u'everyone': 1, u'china': 0, u'hello': 2}
[[0 0 1]
 [0 1 1]
 [1 0 1]]
```

可以看到具体的词频统计结果和01矩阵，01矩阵可以作为特征出入到其它模型中。
