# mfcheer.github.io

个人主页框架（部署于 GitHub Pages）。

基于 **Apple 极简风格** 设计的轻量级个人主页框架。去除了冗长的自我介绍和繁琐的内容堆砌，保持纯粹、克制与留白。

## 🌟 特点

- **克制极简**：单页聚焦于基本定位与核心联系方式，不矫情、不臃肿。
- **纯粹质感**：磨砂毛玻璃、细腻边框与大圆角设计，自适应 680px 舒适排版。
- **深浅色主题**：自动匹配系统主题（Dark Mode），支持右上角一键平滑切换。
- **零外部依赖**：纯 HTML5 + CSS3 + 原生 JavaScript，秒开且极易维护。

## 🛠️ 本地预览

```bash
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## ✍️ 博客模块

Hexo 式写作体验：`_posts/` 里写 Markdown，push 后 GitHub Actions（`.github/workflows/blog.yml`）自动构建静态页并回写 `main`（提交带 `[skip ci]` 防循环）。

- **写作**：在 `_posts/` 新建 `YYYY-MM-DD-slug.md`，front matter 支持 `title` / `date`（建议引号字符串，按北京时间解析）/ `tags` / `summary` / `slug` / `draft: true`（草稿不发布）；
- **本地构建预览**：`npm install && npm run build`；
- **生成物（不手改）**：`blog/<slug>/index.html`、`blog/index.html`（列表页）、`atom.xml`（RSS）、`sitemap.xml`（脚本重建）、`data/blog-index.json`（首页「文章」模块数据源）；
- **模板**：`templates/post.html` 与 `templates/blog-list.html`；页面里的 CSS/JS 版本号用 `{{CSS_VERSION}}` / `{{JS_VERSION}}` 占位符，由 `scripts/build-posts.mjs` 顶部的 `VERSIONS` 统一维护；
- **文章页评论**：giscus 直接挂载（`data-mapping=pathname`，每篇文章一个 Discussion）。

## 📀 书影音数据维护（AI 智能体必读）

首页「书影音」板块的数据**不是自动同步的**，由 AI 智能体在用户提出「更新书影音」时手动抓取并提交。无定时任务、无后端，全靠维护流程。数据分两层：

- `data/media.json` —— 结构化数据（电影 / 书 / 游戏各 5 条）
- `assets/covers/*.jpg` —— 封面图，以豆瓣 subject id 命名
- `data/media-stats.json` —— **累计总数**（电影 / 书 / 游戏各分类的真实累计量，如「看过 314 部」），页面统计行显示这个数
- `index.html` 的 `#media` 板块 —— **静态渲染的 HTML 条目**（无前端 fetch，更新数据时必须同步改这里）

### 数据源（均为匿名公开数据）

| 分类 | 来源 | 能拿到什么 |
|------|------|------------|
| 电影 | RSS：`https://www.douban.com/feed/people/mfcheer/interests` | 最近 10 条标记（混合流，含状态前缀与评级），筛 `看过` 取前 5。评级映射：力荐=5★ 推荐=4★ 还行=3★ 较差=2★ 很差=1★ |
| 书 | 主页预览：`https://www.douban.com/people/mfcheer/` | 预览只显示「最近有活动的两个状态组」。2026-11 起「读过」组活跃，取「读过」前 5（无个人评级、无日期）；若长期无新读书记录，会被「在读/想读」挤出预览 |
| 游戏 | 同上主页预览 | 公开「在玩 / 玩过」预览，取「玩过」前 5（无评级） |

### 抓取注意事项（踩过的坑）

1. **必须带浏览器 User-Agent**，否则豆瓣拒绝访问。
2. **豆瓣图床 `img*.doubanio.com` 有防盗链**：下载封面必须带 `Referer` 头（如 `-e https://movie.douban.com/`），否则只会得到 14 字节的空响应。
3. 收藏列表页（`/collect`、`/do`、`/wish` 等）匿名访问时 body 为空，**不要浪费时间尝试**，只能用主页预览和 RSS。

### 更新流程

1. 抓取 RSS 与主页预览，合并去重，按分类筛出各 5 条；
2. 更新 `data/media.json`；
3. 下载新条目封面到 `assets/covers/{subject_id}.jpg`（记得带 Referer）；
4. 同步更新 `index.html` 中 `#media` 板块的静态条目（标题 / 星级 / 封面路径）；
5. **同步更新 `data/media-stats.json` 的累计总数**：从豆瓣主页 HTML 中抓取（匿名可访问，必须带浏览器 User-Agent）：电影匹配「`314部看过`」、书匹配「`52本读过`」、游戏匹配「`玩过17款`」（注意游戏是「玩过」在前），依次对应 movies / books / games；
6. `styles.css` 版本号 +1（缓存刷新）；
7. 提交并推送到 `main`。

## ⚠️ 缓存更新规则（AI 智能体必读）

本站主体（首页、文章页等）都是**纯静态直出**——`git push` 即部署（博客页由 Actions 预构建后入库，见「博客模块」一节）。但手机端（PWA）有一个 Service Worker（`sw.js`）缓存层，更新 CSS/JS 时必须三处同步，否则手机用户会拿到新旧错配的页面（历史事故：弹层加载即显示且无法关闭）：

1. **改了 `styles.css` / `script.js`** → 同步 bump `index.html` 里对应引用的 `?v=` 版本号；
2. **同步更新 `sw.js`**：`CACHE_VERSION` 递增 + `PRECACHE_ASSETS` 列表里的版本号改成最新；
3. 不要给 `staleWhileRevalidate` 的 `cache.match` 加回 `ignoreSearch: true`——版本参数 `?v=` 必须参与匹配，否则 query 更新对 SW 缓存无效。

推送后用户端生效需**刷新两次**（第一次触发 SW 更新，第二次拿到新资源）。
