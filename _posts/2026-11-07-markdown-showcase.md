---
title: Markdown 渲染能力总览
date: '2026-11-07 20:00'
tags: [博客, Markdown]
summary: 一篇专门用来「压测」渲染器的样张：标题目录、多语言代码、公式、表格、任务列表、图片、跳链……迁移旧文章前，先看看这套博客能吃下哪些语法。
---

这是本站的「语法样张」：把常用的 Markdown 元素集中在一篇文章里，方便检查渲染效果。以后从 CSDN / Obsidian 迁移文章，遇到样式问题就以这篇为参照。

## 行内元素

这一段集中演示行内级语法：**加粗文本**、*斜体文本*、***粗斜体***、~~删除线文本~~、`行内代码 const x = 1`，还有[站内跳链（诺坎普的黄昏）](/blog/camp-nou/)、[站外链接（我的 GitHub）](https://github.com/mfcheer)，以及不带标题的自动链接：https://mfcheer.github.io

行内公式也在这演示：质能方程 $E = mc^2$，勾股定理 $a^2 + b^2 = c^2$，以及带分式的 $\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$。

## 代码块

代码块支持语言标签、语法高亮和右上角复制按钮；超长行会横向滚动，不会撑破卡片。

### Bash

```bash
# 查看占用 8080 端口的进程并结束它
lsof -i :8080 | grep LISTEN
kill -9 $(lsof -t -i :8080)
```

### JavaScript（演示超长行滚动）

```js
const staleKeys = (await caches.keys()).filter((key) => key.startsWith('mfcheer-static-') && key !== `mfcheer-static-${CACHE_VERSION}`);
await Promise.all(staleKeys.map((key) => caches.delete(key)));
```

### Python

```python
def fib(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print([fib(i) for i in range(10)])
```

### SQL

```sql
SELECT user_id, COUNT(*) AS pv
FROM events
WHERE dt = '2026-11-07'
GROUP BY user_id
ORDER BY pv DESC
LIMIT 10;
```

### 无语言标注

```
没有语言标注的代码块：不做高亮，但保留等宽字体与复制按钮。
```

## 列表与任务清单

- 无序列表项一
- 无序列表项二
    1. 有序子项一
    2. 有序子项二
- 无序列表项三

1. 有序列表项一
2. 有序列表项二
    - 嵌套无序子项
3. 有序列表项三

任务清单（Obsidian 里常用）：

- [x] 已完成任务：恢复构建流水线
- [x] 已完成任务：支持代码复制按钮
- [ ] 待办：迁移 CSDN 文章
- [ ] 待办：把 Hexo 的旧文搬过来

## 表格

支持对齐语法（冒号决定左/中/右对齐）：

| 语法元素 | 支持情况 | 备注 |
| :--- | :---: | ---: |
| 标题 h2-h4 | 支持 | 自动生成锚点与目录 |
| 代码高亮 | 支持 | 190+ 语言，亮暗双主题 |
| 复制按钮 | 支持 | 右上角，点击变「已复制」 |
| 数学公式 | 支持 | KaTeX，检测到公式才加载 |
| 任务列表 | 支持 | 复选框样式 |
| 脚注 Footnote | 暂不支持 | 有需要再加 |

## 引用

> 一级引用：写文章和写代码一样，先跑通，再优化。
>
> > 嵌套引用：但跑通之前，别急着优化。

## 图片

图片自动懒加载、圆角展示，深色模式下自动压暗边缘：

![深夜耳机与歌单](/assets/images/spylent-headphones.jpg)

## 数学公式块

独立公式块（`$$` 包裹）：

$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$

## 分割线

上面是分割线，下面继续。

## Obsidian 语法兼容说明

如果你在 Obsidian 里写作，这几种写法构建时会自动转换：

- 图片嵌入（双中括号、感叹号开头）会自动转成标准图片语法，并指向 `assets/images/` 目录；
- 用相对路径引用的图片（比如 `image/` 或 `assets/images/` 开头）会统一改写为站点绝对路径；
- 笔记互链（双中括号、无感叹号）会降级为纯文本，避免渲染成坏链。

## 暂不支持 / 需要注意

- 脚注语法、Mermaid 图表、在正文里直接写原始 HTML 标签：暂不支持，迁移时遇到我会手工转换；
- 代码块里如果出现图片语法字面量，构建时的路径改写也会作用于它——属于已知边界情况，迁移时我会检查。

---

这篇样张会随渲染器升级持续更新。发现哪个元素渲染不对，直接在评论区指出来即可。
