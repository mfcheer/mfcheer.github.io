---
title: 机器学习实战 第2章 k-近邻算法
date: 2015-12-21 14:57:10
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-76a1cc5c1e
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/50372072

原理：  
选取k个最近的样本，样本中比例最大的种类即是新数据的分类。

简单的分类器：

    
    
    from numpy import *
    import operator 
    
    def createDataSet():
        group = array([[1.0,1.1],[1.0,1.0],[0,0],[0,0.1]])
        labels = ['A','A','B','B']
        return group,labels
    
    g,la = createDataSet()
    
    def classify0(inx,dataSet,labels,k):
        dataSetSize = dataSet.shape[0]
        diffMat = tile(inx,(dataSetSize,1)) - dataSet
        sqDiffMat = diffMat**2
        sqDistances = sqDiffMat.sum(axis = 1)
        distances = sqDistances**0.5;
        sortedDis = distances.argsort()
        classCount = {}
        for i in range (k):
            votelabel = labels[sortedDis[i]]
            classCount[votelabel] = classCount.get(votelabel,0) + 1
        sortedClassCount = sorted(classCount.iteritems(),
                                  key = operator.itemgetter(1),reverse = True)
        return sortedClassCount[0][0]
    
    print classify0([0,0],g,la,3)

