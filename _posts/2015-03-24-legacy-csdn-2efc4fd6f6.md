---
title: 各种查找算法效率比较
date: 2015-03-24 21:24:17
tags: []
categories: ['CSDN备份']
copyright: true
slug: legacy-csdn-2efc4fd6f6
---

版权声明：转载请注明出处。 https://blog.csdn.net/u014427196/article/details/44598923

题目描述：  
给定一个已经排好序的N个整数的序列（数据从1到N），在该序列中查找指定的整数，并观察不同算法的运行时间。考查3类查找算法：折半查找，平衡二叉排序树的查找，B-树的查找。  
要求：  
（1）构造树表的算法要考虑各种可能的输入数据序列；  
（2）可根据要求输出树表结构；  
（3）分析最坏情况下，三种查找算法的复杂度；  
（4）测量并比较三种算法在N=100，500，1000，2000，4000，6000，8000，10000时的性能，要求完成以下三个方面的工作：  
① 对每个测试数据集，统计计算每种查找算法的ASL；  
② 对每个测试数据集运行多次获得运行时间的平均值；  
③ 绘制算法实际运行结果（ASL和运行时间）的曲线图，验证和理论分析的时间复杂度的吻合性。

    
    
    #include<iostream>
    #include<stdio.h>
    #include <time.h>
    #include <malloc.h>
    
    using namespace std;
    
    #define CLOCKS_PER_SEC ((clock_t)1000)
    #define MaxSize 100002
    #define M 100
    int Step;
    int Bjishu;
    using namespace std;
    
    typedef struct
    {
        int key;
    
    }DataType;
    typedef struct
    {
        DataType list[MaxSize];
        int size;
    }SeqList;
    
    typedef struct node
    {
        DataType data;
        struct node *LeftChild;//
        struct node *RightChild;//
        struct node *Parent;
        int i;//height
    }BITreeNode, BTnode, *Tree;//二叉平衡树结构体
    
    typedef struct Node
    {
        struct Node *parent;        /*指向双亲结点*/
        int key[M];              /*关键字向量，0号单元未用(M-1阶)*/
        struct Node *ptr[M];        /*子树指针向量*/
    }B_TNode;//B_树结构体
    
    
    void ListInitiate(SeqList *L)
    {
        L->size = 0;
    }
    int ListLength(SeqList L)
    {
        return L.size;
    }
    int ListInsert(SeqList *L, int x)
    {
        // int j;
        if (L->size >= MaxSize)
        {
            printf("顺序表已满\n");
            return 0;
        }
        else
        {
            //for(j=L->size;j>i;j--)L->list[j]=L->list[j-1];
            L->list[L->size].key = x;
            L->size++;
            return 1;
        }
    }
    int BInarySearch(SeqList S, DataType x)//折半查找
    {
        int js = 1;                        //次数记录
        int low = 0;
        int high = S.size - 1;
        int mid;
        while (low <= high)
        {
            mid = (low + high) / 2;             //中间位置
            if (S.list[mid].key == x.key)return js;
            else if (S.list[mid].key<x.key)low = mid + 1;
            else if (S.list[mid].key>x.key)high = mid - 1;
            js++;
        }
        return -1;
    }
    int Hetree(BTnode *Root)
    {
        if (Root == NULL)return 0;
        return
            Hetree(Root->LeftChild)>Hetree(Root->RightChild) ? Hetree(Root->LeftChild) + 1 : Hetree(Root->RightChild) + 1;
    }
    
    
    int IsBlance(BTnode *Root)//判断二叉树的平衡)
    {
        int bf;
        if (Root != NULL)
        {
            bf = Hetree(Root->LeftChild) - Hetree(Root->RightChild);
            if ((bf<-1) || (bf>1))
                return 0;//不平衡
            else
            {
                if (IsBlance(Root->LeftChild) && IsBlance(Root->RightChild))
                    return 1;
                else
                    return 0;
            }
        }
        return 1;
    }
    BTnode *R_Rotate(BTnode *Root, BTnode *p)//LL型调平衡(右旋)
    {
        BTnode *b, *q, *c, *d;
        q = p->Parent;
        b = p->LeftChild;
        c = b->LeftChild;
        d = b->RightChild;
        p->LeftChild = d;
        if (d != NULL)
            d->Parent = p;
        b->RightChild = p;
        p->Parent = b;
        if (q == NULL)
        {
            Root = b;
            b->Parent = NULL;            //b的父结点为空，即b就是根结点
        }
        else if (q->LeftChild == p)        //如果a是父结点的左孩子
        {
            q->LeftChild = b;            //将b赋值给q的左孩子
            b->Parent = q;            //b的父结点是q
        }
        else if (q->RightChild == p)        //如果a是父结点的右孩子
        {
            q->RightChild = b;            //将b赋值给q的右孩子
            b->Parent = q;            //b的父结点是q
        }
        return Root;
    }
    
    
    BTnode *L_Rotate(BTnode *Root, BTnode *p)//RR型调平衡
    {
        BTnode *b, *q, *c, *d;
        q = p->Parent;
    
        b = p->RightChild;
        c = b->RightChild;
        d = b->LeftChild;
    
        p->RightChild = d;
        if (d != NULL)
            d->Parent = p;
    
        b->LeftChild = p;
        p->Parent = b;
    
        if (q == NULL)
        {
            Root = b;                //二叉树的根结点就是b，把b赋值给树Root
            b->Parent = NULL;        //b的父结点为空，即b就是根结点
        }
        else if (q->LeftChild == p)    //如果p是父结点的左孩子
        {
            q->LeftChild = b;        //将b赋值给q的左孩子
            b->Parent = q;        //b的父结点是q
        }
        else if (q->RightChild == p)    //如果p是父结点的右孩子
        {
            q->RightChild = b;        //将b赋值给q的右孩子
            b->Parent = q;        //b的父结点是q
        }
    
        return Root;
    }
    BTnode *LR_Rotate(BTnode *Root, BTnode *p)
    {
        BTnode *b, *q, *c, *d;
        q = p->Parent;
        b = p->LeftChild;
        c = b->LeftChild;
        d = b->RightChild;
        p->LeftChild = d;
        if (d != NULL)
            d->Parent = p;
        b->RightChild = p;
        p->Parent = b;
        if (q == NULL)
        {
            Root = b;
            b->Parent = NULL;            //b的父结点为空，即b就是根结点
        }
        else if (q->LeftChild == p)        //如果a是父结点的右孩子
        {
            q->LeftChild = b;            //将b赋值给q的左孩子
            b->Parent = q;            //b的父结点是q
        }
        else if (q->RightChild == p)        //如果a是父结点的左孩子
        {
            q->RightChild = b;            //将b赋值给q的右孩子
            b->Parent = q;            //b的父结点是q
        }
        return Root;
    }
    BTnode *RL_Rotate(BTnode *Root, BTnode *p)
    {
        BTnode *b, *q, *c, *d;
        q = p->Parent;
    
        b = p->RightChild;
        c = b->RightChild;
        d = b->LeftChild;
    
        p->RightChild = d;
        if (d != NULL)
            d->Parent = p;
    
        b->LeftChild = p;
        p->Parent = b;
    
        if (q == NULL)
        {
            Root = b;                //二叉树的根结点就是b，把b赋值给树Root
            b->Parent = NULL;        //b的父结点为空，即b就是根结点
        }
        else if (q->LeftChild == p)    //如果p是父结点的右孩子
        {
            q->LeftChild = b;        //将b赋值给q的左孩子
            b->Parent = q;        //b的父结点是q
        }
        else if (q->RightChild == p)    //如果p是父结点的左孩子
        {
            q->RightChild = b;        //将b赋值给q的右孩子
            b->Parent = q;        //b的父结点是q
        }
    
        return Root;
    }
    int blancebinarytreesearch(BTnode *Root, int x)//查找平衡二叉排序树
    {
        BTnode *p;
        int count = 0;
        if (Root != NULL)
        {
            p = Root;
            while (p != NULL)
            {
                count++;
                if (p->i == x)return count;
                else if (x<p->i)p = p->LeftChild;
                else if (x>p->i)p = p->RightChild;
            }
        }
        return 0;
    }
    int InPEtree(BTnode **Root, int x)//创建平衡二叉排序树的函数
    {
        BTnode *cur, *parent = NULL, *p, *q;
        cur = *Root;
        while (cur != NULL)
        {
            if (x == cur->i)return 0;
            parent = cur;
            if (x<cur->i)cur = cur->LeftChild;
            else if (x>cur->i)cur = cur->RightChild;
        }
        p = (BTnode *)malloc(sizeof(BTnode));
        p->i = x;
        p->LeftChild = NULL;
        p->RightChild = NULL;
        p->Parent = NULL;
        if (parent == NULL)*Root = p;
        else if (x<parent->i)
        {
            parent->LeftChild = p;
            p->Parent = parent;
        }
        else if (x>parent->i)
        {
            parent->RightChild = p;
            p->Parent = parent;
        }
    
        int bf;
    
        if (IsBlance(*Root) == 0)        //如果二叉树是不平衡的
        {
            bf = Hetree(parent->LeftChild) - Hetree(parent->RightChild);
            while ((bf >= -1) && (bf <= 1))
            {
                parent = parent->Parent;
                bf = Hetree(parent->LeftChild) - Hetree(parent->RightChild);
            }
            q = parent;///找到离插入点最近的不平衡点
            if (p->i>q->i&&p->i>q->RightChild->i)//新结点插入在q结点的右孩子的右子树中。
            {
                *Root = L_Rotate(*Root, q);
            }
            else if (p->i>q->i&&p->i<q->RightChild->i)//新结点插入在A结点的右孩子的左子树中
            {
                *Root = RL_Rotate(*Root, q);
            }
            else if (p->i<q->i&&p->i>q->LeftChild->i)//新结点插入在q结点的左孩子的右子树中
            {
                *Root = LR_Rotate(*Root, q);
            }
            else //结点插入在A结点的左孩子的左子树中
            {
                *Root = R_Rotate(*Root, q);
            }
        }
        return 1;
    }
    
    void PrintBiTree(BTnode *root, int n)
    {
        int i;
        if (root == NULL)return;
        PrintBiTree(root->RightChild, n + 1);
        for (i = 0; i<n - 1; i++)printf("     ");
        if (n>0)
        {
            printf("-----");
            printf("%d\n", root->i);
        }
        if (n == 0)
        {
            //printf("--");
            printf("%d\n", root->i);
        }
        PrintBiTree(root->LeftChild, n + 1);
    }
    
    int B_treetreesearch(B_TNode *Root, int x)//查找B-树
    {
        int i;
        if (Root == NULL)return 0;
        for (i = 1; i <= Root->key[0]; i++)
        {
            Bjishu++;
            if (x<Root->key[i])break;
            if (x == Root->key[i])return Bjishu;
        }
        return B_treetreesearch(Root->ptr[i - 1], x);
    }
    
    B_TNode* B_treetreeinsert(B_TNode *Root, int x)//3.B-树的插入函数
    {
        int i;
        if (Root == NULL)//B_树为空
        {
            Root = (B_TNode *)malloc(sizeof(B_TNode));
            Root->key[0] = 1;
            Root->key[1] = x;
            for (i = 0; i<M; i++)
                Root->ptr[i] = NULL;
            Root->parent = NULL;
            return Root;
        }
        B_TNode *p = Root, *q, *s;
        q = p;
        while (p != NULL)
        {
            for (i = 1; i <= p->key[0]; i++)
                if (x<p->key[i])break;
            q = p;
            p = p->ptr[i - 1];
        }
        int j;
        q->key[i] = x;
    
        for (j = q->key[0]; j >= i; j--)
        {
            q->key[j + 1] = q->key[j];
            q->ptr[j + 1] = q->ptr[j];
        }
        q->key[0]++;
        int temp;
        i = q->key[0];
        int m, num = 0;
        while (q->key[0] == Step + 1 - 1)
        {
            num++;
            temp = q->key[(i - 1) / 2 + 1];
            p = q->parent;
            q->key[0] = (i - 1) / 2;//分裂左树
            m = (i - 1) / 2 + 1;
            //加到双亲结点
            if (p == NULL)
            {
                p = (B_TNode *)malloc(sizeof(B_TNode));
                for (i = 0; i<M; i++)
                    p->ptr[i] = NULL;
                Root = p;
                Root->parent = NULL;
                p->key[0] = 1;
                p->key[1] = temp;
                p->ptr[0] = q;
                p->parent = NULL;
            }
            else
            {
                for (i = 1; i <= p->key[0]; i++)
                    if (temp<p->key[i])break;
                for (j = p->key[0]; j >= i; j--)
                {
                    p->key[j + 1] = p->key[j];
                    p->ptr[j + 1] = p->ptr[j];
                }
                p->key[i] = temp;//
                p->ptr[i - 1] = q;//
                p->key[0]++;
            }
            //分配右树
            s = (B_TNode *)malloc(sizeof(B_TNode));
            for (i = 0; i<M; i++)
                s->ptr[i] = NULL;
            p->ptr[p->key[0]] = s;
            p->ptr[p->key[0] - 1] = q;
            s->key[0] = Step + 1 - 1 - m;
            s->parent = p;
            q->parent = p;
            for (i = 1; i <= s->key[0]; i++)
            {
                s->key[i] = q->key[i + m];
                s->ptr[i - 1] = q->ptr[i + m - 1];    ////////////////
    
            }
            if (num>1)s->ptr[i - 1] = q->ptr[i + m - 1];
            for (i = 0; i <= s->key[0]; i++)
            {
                if (s->ptr[i] != NULL)s->ptr[i]->parent = s;////////////////
            }
            q = p;
            i = q->key[0];
        }
        return Root;
    }
    int B_treetreeprint(B_TNode *Root, int n)
    {
        int i, j;
        if (Root == NULL)return 0;
    
        for (i = Root->key[0]; i>0; i--)
        {
            B_treetreeprint(Root->ptr[i], n + 1);
            for (j = 0; j<n; j++)
                printf("----");
            cout << Root->key[i] << endl;
        }
        B_treetreeprint(Root->ptr[0], n + 1);
    }
    /*
    int B_treetreeprint(B_TNode *Root,int n)
    {
    int i;
    if(Root==NULL)return 0;
    if(Root->key[0]>=2)
    {
    
    B_treetreeprint(Root->ptr[2],n+1);
    for(i=0;i<n;i++)
    printf("--");
    printf("%d  ",Root->key[2]);
    printf("\n");
    }
    if(Root->key[0]>=1)
    {
    B_treetreeprint(Root->ptr[1],n+1);
    for(i=0;i<n;i++)
    printf("--");
    
    printf("%d  ",Root->key[1]);
    printf("\n");        //printf("\n");
    }
    if(Root->ptr[0]!=NULL)
    {
    
    B_treetreeprint(Root->ptr[0],n+1);
    //    for(i=0;i<n;i++)
    //    printf("---");
    }
    }
    
    
    int B_treetreeprint(B_TNode *Root,int n)
    {
    int i;
    if(Root==NULL)return 0;
    if(Root->key[0]>=2)
    {
    
    B_treetreeprint(Root->ptr[2],n+1);
    for(i=0;i<n;i++)
    printf("--");
    printf("%d  ",Root->key[2]);
    printf("\n");
    }
    if(Root->key[0]>=1)
    {
    B_treetreeprint(Root->ptr[1],n+1);
    for(i=0;i<n;i++)
    printf("--");
    
    printf("%d  ",Root->key[1]);
    printf("\n");        //printf("\n");
    }
    if(Root->ptr[0]!=NULL)
    {
    
    B_treetreeprint(Root->ptr[0],n+1);
    //    for(i=0;i<n;i++)
    //    printf("---");
    }
    }
    */
    int main()
    {
        int i;
        int s, j, k, k1, k2, k3, Size, Sizex;
        int x;
        SeqList L;
        DataType Me;
        double runtime;
        double Start, End;
        printf("请输入序列中数的个数Size：");
        //while (scanf("%d", &Size) != EOF&&Size != 0)
        scanf("%d", &Size);
        {
            ListInitiate(&L); //初始化线性表
            Tree t = NULL;   //初始化二叉平衡树
            Tree zt = NULL; //初始化折半查找树
            B_TNode *Root = NULL;
            s = 0;
            printf("请输入B_树的阶：");
            scanf("%d", &Step);
            for (i = 0; i<Size; i++)
            {
                InPEtree(&t, i + 1); //Insert (&t,i+1);创建二叉平衡树
                ListInsert(&L, i + 1);//创建线性表
                Root = B_treetreeinsert(Root, i + 1);//创建B_树
            }
            printf("平衡二叉树\n");
            PrintBiTree(t, 0);//打印二叉平衡树PrintfTree(t,1);
            printf("\nB_树\n");
            B_treetreeprint(Root, 0);
            //printf("请输入需要查找的数（1~Size）：");
            Sizex = Size;
            printf("输入要查找的数\n");
            scanf("%d",&Sizex);
            if (Sizex <0 || Sizex >Size)
            {
                printf("查找失败，不存在此数！\n");
                return 0;
            }
            //while (Sizex >= 1)
            {
    
                k1 = 0;  k2 = 0; k3 = 0;          //记次数
                k1 = blancebinarytreesearch(t, Sizex);
                printf("平衡二叉树查询%d用了%d次\n", Sizex, k1);
                Me.key = Sizex;
                k2 = BInarySearch(L, Me);
                printf("折半查找法查询%d用了%d次\n", Sizex, k2);
                Bjishu = 0;
                printf("B_树查找%d用了%d次\n", Sizex, B_treetreesearch(Root, Sizex));
                //printf("请输入需要查找的数（1~Size）：");
            }
    
            k = 0;
            Start = clock();//开始计时
            for (i = 0; i<Size; i++)
            {
                k += blancebinarytreesearch(t, i + 1);//SearchBST(t,i+1,s);
            }
            End = clock();//结束计时】
            runtime = (double)(End - Start) / (CLOCKS_PER_SEC*Size);
            printf("%d个数的数组\n\t\t 平衡二叉排序树ASL= %.2f \t平均时间：%lf ms\n", Size, (float)k / Size, runtime);
    
            k = 0;
            Start = clock();
            for (i = 0; i<Size; i++)
            {
                Me.key = i + 1;
                k += BInarySearch(L, Me);
            }
            End = clock();
            runtime = (double)(End - Start) / (CLOCKS_PER_SEC*Size);
            printf("\t\t 折半查找法ASL= %.2f \t 平均时间：%lf ms\n", (float)k / Size, runtime);
    
            Bjishu = 0;
            Start = clock();
            for (i = 0; i<Size; i++)
            {
                B_treetreesearch(Root, i + 1);
            }
            End = clock();
            runtime = (double)(End - Start) / (CLOCKS_PER_SEC*Size);
            printf("\t\t B_树查找ASL= %.2f \t    平均时间：%lf ms\n", (float)Bjishu / Size, runtime);
    
        }
        return 0;
    }

