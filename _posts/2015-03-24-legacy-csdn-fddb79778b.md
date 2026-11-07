---
title: 费马小定理
date: 2015-03-24 16:19:29
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-fddb79778b
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44593703

费马小定理：  
一个素数是p 则对任意的整数a有a^p=a(mod p);  
公式变形：a^（p-1）=1(mod p);  
威尔逊定理：  
p为素数，则 (p-1)!=-1(mod p);  
费马定理的应用：判断素数，大素数的生成；  
若任意整数b有(b,n)==1,有b^(n-1)=1(mod n)  
n为素数；  
否则，若b有(b,n)==1,有b^(n-1)！=1(mod n)  
n为合数。  
伪素数：  
n为一个奇合数，若b^(n-1)=1(mod n)  
则n称为基于b的伪素数。

