---
title: 二叉树层序前序中序后序遍历，深度
date: 2014-10-21 23:30:17
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-96dd0eb55c
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/40357285

层序利用队列：

    
    
    void PrintFromTopToBottom(BinaryTreeNode *pTreeRoot)
    {
        if(!pTreeRoot)
            return;
     
        std::queue<BinaryTreeNode*> queTreeNode;
     
        dequeTreeNode.push_back(pTreeRoot);
     
        while(!queTreeNode.empty())
        {
            BinaryTreeNode *pNode = queTreeNode.front();
            queTreeNode.pop_front();
     
            printf("%d " , pNode->m_nValue);
     
            if(pNode->m_pLeft)
                queTreeNode.push_back(pNode->m_pLeft);
     
            if(pNode->m_pRight)
                queTreeNode.push_back(pNode->m_pRight);
        }
    }

  
前中后序遍历：  

    
    
    void vis(char a)  
    {  
        printf("%c  ",a);  
    }  
      
    void pinor(binode *curr,void vis(char a ))//前序遍历  
    {  
        if (curr!=NULL)  
        {  
            vis(curr->data);  
            pinor(curr->left,vis);  
            pinor(curr->right,vis);  
        }  
    }  
      
    void inor(binode *curr,void vis(char a ))//中序遍历  
    {  
        if (curr!=NULL)  
        {  
            inor(curr->left,vis);  
            vis(curr->data);  
            inor(curr->right,vis);  
        }  
    }  
      
    void poinor(binode *curr,void vis(char a ))//后序遍历  
    {  
        if (curr!=NULL)  
        {  
            poinor(curr->left,vis);  
            poinor(curr->right,vis);  
            vis(curr->data);  
        }  
    }  

深度：

    
    
    int GetDepth(tagBiNode *pRoot)  
    {  
        if (pRoot == NULL)  
        {  
            return 0;  
        }  
      
        return GetDepth(pRoot->left) > GetDepth(pRoot->right) ?   
            (GetDepth(pRoot->left) + 1) : (GetDepth(pRoot->right) + 1);  
    }  

  
  

