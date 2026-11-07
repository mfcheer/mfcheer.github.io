---
title: 矩阵旋转
date: 2014-11-07 19:46:20
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-41febdb0cf
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40897873

对于ｎ×ｎ矩阵：

90度旋转：

  * 列号变为行号 
  * （n - 行号 + 1）变成列号 
  * 规律： a[i][j] = b[j][n - i + 1］ 

###  180度旋转：

  * （n - 行号 + 1）变为行号 
  * （n - 列号 + 1）变为列号 
  * 规律：a[i][j] = b[n - i + 1][n - j + 1] 

  

###  270度旋转（相当于逆时针旋转90度）：

  * 行号变为列号 
  * （n - 列号 + 1）变为行号 
  * 规律：a[i][j] = b[n - j + 1][i] 

以逆时针旋转为例，代码：

借助辅助空间

    
    
    void rotate_90(int A[N][N], int B[N][N], int n)
    {
    	for (int i = 0; i < n; ++i)
    	{
    		for (int j = 0; j < n; ++j)
    		{
    			B[i][j] = A[j][n - 1 - i];
    		}
    	}
    }

  

不借助辅助空间：

    
    
    void rotate90(int A[N][N], int n)
    {
    
    	int i1, j1;
    	int nTmp1, nTmp2;
    	int nIndxTmp;
    	int k;
    
    	for (int i = 0; i < n / 2; i++)
    	{
    		for (int j = i; j < n - 1 - i; j++)
    		{
    			i1 = i;
    			j1 = j;
    			nTmp1 = A[i1][j1];
    			k = 0;
    			while (k < 4)
    			{
    				nTmp2 = A[n - 1 - j1][i1];
    				A[n - 1 - j1][i1] = nTmp1;
    				nTmp1 = nTmp2;
    
    				nIndxTmp = i1;
    				i1 = n - 1 - j1;
    				j1 = nIndxTmp;
    
    				k++;
    			}
    		}
    	}
    }
    

  
  
  

