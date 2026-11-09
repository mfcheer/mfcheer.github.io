# mfcheer.github.io

个人主页框架（部署于 GitHub Pages）。

基于 **Apple 极简风格** 设计的轻量级个人主页框架。去除了冗长的自我介绍和繁琐的内容堆砌，保持纯粹、克制与留白。

## 🌟 特点

- **克制极简**：单页聚焦于基本定位与核心联系方式，不矫情、不臃肿。
- **纯粹质感**：磨砂毛玻璃、细腻边框与大圆角设计，自适应 680px 舒适排版。
- **深浅色主题**：自动匹配系统主题（Dark Mode），支持右上角一键平滑切换。
- **博客系统**：Markdown 写文章，推送即自动构建发布，支持代码高亮、公式、目录与 giscus 评论。
- **说说动态**：GitHub Issues 当 CMS，建 Issue 即发说说，支持标签筛选。
- **零外部依赖**：页面本身纯 HTML5 + CSS3 + 原生 JavaScript，秒开且极易维护。

## 🛠️ 本地预览

```bash
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

## ✍️ 博客模块

Hexo 式写作体验：`_posts/` 里写 Markdown，push 后 GitHub Actions（`.github/workflows/blog.yml`）自动构建静态页并回写 `main`（提交带 `[skip ci]` 防循环）。

- **写作**：在 `_posts/` 新建 `YYYY-MM-DD-slug.md`，front matter 支持 `title` / `date`（建议引号字符串，按北京时间解析）/ `tags` / `summary` / `slug` / `draft: true`（草稿不发布）；
- **图片**：放 `assets/images/`，正文引用 `/assets/images/xxx.png`；Obsidian 的双中括号图片嵌入与相对路径引用，构建时会自动转换为标准语法；
- **本地构建预览**：`npm install && npm run build`；
- **生成物（不手改）**：`blog/<slug>/index.html`、`blog/index.html`（列表页）、`atom.xml`（RSS）、`sitemap.xml`（脚本重建）、`data/blog-index.json`（首页「文章」模块数据源）；
- **模板**：`templates/post.html` 与 `templates/blog-list.html`；页面里的 CSS/JS 版本号用 `{{CSS_VERSION}}` / `{{JS_VERSION}}` 占位符，由 `scripts/build-posts.mjs` 顶部的 `VERSIONS` 统一维护；
- **文章页评论**：giscus 直接挂载（`data-mapping=pathname`，每篇文章一个 Discussion）。

## 💬 说说模块（Moments）

采用 GitHub Issues 作为轻量级 CMS，支持标签筛选与多图九宫格自适应排版。

- **页面展示**：
  - **首页说说板块**：限制仅展示最近 10 条，支持同源极速呈现；
  - **独立说说列表页**（`/moments/`）：展示全量说说，去除搜索与归档导航，专注纯粹时间流记录；
  - **配图自动本地化**：同步脚本自动将 GitHub 附件下载至 `assets/moments/` 同源托管并无损压缩（体积缩减约 90%），解决移动端及国内网络海外附件加载缓慢甚至破损的问题。
- **安全与白名单防注入**：
  - 同步脚本 `scripts/sync-moments.mjs` 与工作流增加作者身份强校验：仅拉取博主本人（`user.login === "mfcheer"` 且身份为 `OWNER`）的 Issue；
  - 陌生访客或恶意机器人创建的带 `moment` 标签的 Issue 会在构建与前端呈现时被静默丢弃，彻底杜绝数据注入。
- **站内发布与 GitHub OAuth 一键授权登录**：
  - 点击「写一条」呼出站内弹窗，支持使用 GitHub 账号一键授权登录（免密），登录后可直接在站内选图、输入内容并发布（零延迟乐观更新）；
  - 同时提供「或直接前往 GitHub 提 Issue 发布 ↗」直达链接，兼容传统方式；
  - **默认 OAuth 配置**：
    - **GitHub OAuth App**：`mfcheer-moments`
    - **Client ID**：`Ov23liE0fZ4oEnXsPCjR`
    - **Authorization callback URL**：`https://mfcheer.github.io/`
    - **Cloudflare Worker 代理服务地址**：`https://mfcheer-moments.mfcheer-meng.workers.dev/`
    - **Worker 脚本源码**：[`scripts/oauth-gatekeeper-worker.js`](scripts/oauth-gatekeeper-worker.js)
  - **Cloudflare Worker 部署与配置方法**：
    1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/) -> 点击左侧 **Workers 和 Pages** -> 点击 **创建** -> **创建 Worker**（命名为 `mfcheer-moments`）-> 点击 **部署**；
    2. 点击 **编辑代码**，清空后将仓库中 `scripts/oauth-gatekeeper-worker.js` 的全部代码粘贴进去，点击 **部署**；
    3. 进入 Worker 详情页的 **设置 (Settings) -> 变量和机密 (Variables and Secrets)**，在环境变量中添加：
       - `CLIENT_ID`：填入 GitHub OAuth App 的 Client ID（`Ov23liE0fZ4oEnXsPCjR`）
       - `CLIENT_SECRET`：填入在 GitHub OAuth App 页面生成的 Client Secret 密钥字符串
    4. 点击 **保存并部署 (Save and deploy)**，代理服务即生效完成。

## 📀 相册模块（Gallery）

Justified 行式照片墙（Google Photos 同款布局），独立页面 `/gallery/`，首页导航「相册」进入。

- **发布**：建一个带 `gallery` 标签的 Issue（[📷 相册模板](.github/ISSUE_TEMPLATE/gallery.yml)），标题写相册名（如 `2026.10 川西`），照片直接拖进正文，可一次拖任意多张；
- **流水线**：Issue 变动触发 `.github/workflows/gallery.yml` → `scripts/build-gallery.mjs` 下载附件 → sharp 压缩为全图 1600w（q82）+ 墙面缩略图 480w + LQIP 微缩占位 → 读取 EXIF 拍摄时间 → 生成 `data/gallery.json`（含宽高比，前端运行时 Justified 装箱）→ 回写 `main`（`[skip ci]` 防循环）；
- **分组**：Issue 标题即相册名；标题为空时按拍摄月份自动分组；相册内按拍摄时间排序；
- **杂志式展示**：每个相册 = 编号（№）+ 衬线体标题 + 时间范围/张数 + 导语 + 封面大图 + Justified 照片墙。导语来自 Issue 模板的「相册简介（可选）」字段，封面自动取相册第一张；相册按最新拍摄时间优先排序；
- **产物（不手改）**：`data/gallery.json`、`assets/gallery/{id}.jpg` / `{id}_s.jpg`；
- **下架**：删除/关闭 Issue 后，下次同步自动清理对应产物；
- **安全**：仅同步博主本人（OWNER）的 Issue，陌生 Issue 静默丢弃（与说说模块同一套防注入）；
- **本地导入模式**（开发用）：`node scripts/build-gallery.mjs --seed-dir ./some-images`，绕过 API 直接从本地目录导入；支持子目录模式（子目录名 = 相册名，目录内 `desc.txt` = 相册简介）。

## 🧭 导航修改规则（AI 智能体必读）

全站导航的「单一配置源」是 **`data/nav.json`**（每项含 `label`、`home` 主页锚点形态、`sub` 子页路径形态）。**不要直接手改任何页面的 `<ul class="nav-links">`**，统一走：

```bash
# 1. 编辑 data/nav.json
# 2. 一键同步到 5 处（index.html / moments / gallery / 两个博客模板）
node scripts/build-nav.mjs
# 3. 若博客模板被更新，重新生成博客页
node scripts/build-posts.mjs
# 4. 按「缓存更新规则」bump sw.js 的 CACHE_VERSION
```

子页中与自身路径一致的导航项会自动加 `aria-current="page"`。

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
