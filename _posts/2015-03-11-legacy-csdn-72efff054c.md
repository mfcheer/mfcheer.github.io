---
title: 欧拉函数及其性质
date: 2015-03-11 16:27:43
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-72efff054c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44200711

对正整数n，欧拉函数是 <= n的数中与n互质的数的数目。

例如euler(8)=4，因为1,3,5,7均和8互质。

Euler函数表达通式：euler(x)=x(1-1/p1)(1-1/p2)(1-1/p3)(1-1/p4)…(1-1/pn),其中p1,p2……pn为x的所有素因数，x是不为0的整数。euler(1)=1（唯一和1互质的数就是1本身）。  

欧拉公式的延伸：一个数的所有质因子之和是euler(n)*n/2。

特殊性质：当n为奇数时，φ(2n)=φ(n)  

欧拉函数是 [ 积性函数 ](http://baike.baidu.com/view/2046973.htm)
——若m,n互质，φ(mn)=φ(m)φ(n)。

若n是质数p的k次幂，φ(n)=p^k-p^(k-1)=(p-1)p^(k-1)，因为除了p的倍数外，其他数都跟n互质。

设a为N的质因数，若(N % a == 0 && (N / a) % a == 0) 则有E(N)=E(N / a) * a；若(N % a == 0 &&
(N / a) % a != 0) 则有：E(N) = E(N / a) * (a - 1)。

欧拉定理：对于互质的正整数a和n，有a^φ(n) ≡ (1 mod n)。  

  

代码实现：

最高效率的线性时间筛法求素数和欧拉函数。

phi[MAXN] 数组保存的是欧拉函数，prime[MAXN]保存的是素数表。

  

    
    
    bool com[MAXN];
    int primes, prime[MAXN], phi[MAXN];
    
    phi[1] = 1;
    for (int i = 2; i <= n; ++i)
    {
      if (!com[i])
      {
        prime[primes++] = i;
        phi[i] = i-1;
      }
      for (int j = 0; j < primes && i*prime[j] <= n; ++j)
      {
        com[i*prime[j]] = true;
        if (i % prime[j])
          phi[i*prime[j]] = phi[i]*(prime[j]-1);
        else
          { phi[i*prime[j]] = phi[i]*prime[j]; break; }
      }
    }

  
  

**  
**

  

  

