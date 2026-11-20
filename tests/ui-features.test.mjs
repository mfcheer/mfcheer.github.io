import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

test('GitHub 贡献热力图本地 SVG 存在且为有效矢量图形', () => {
    const svgPath = path.join(ROOT, 'assets', 'github-contributions.svg');
    assert.ok(fs.existsSync(svgPath), 'assets/github-contributions.svg 文件必须存在');
    const content = fs.readFileSync(svgPath, 'utf8');
    assert.ok(content.includes('<svg'), '必须包含 svg 根节点');
    assert.ok(content.includes('viewBox="0 0 663 104"'), '必须包含标准响应式 viewBox');
    assert.ok(content.includes('preserveAspectRatio="xMinYMid meet"'), '必须包含纵横比缩放属性');
});

test('index.html 和 script.js 优先引用本地静态贡献图', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    assert.ok(indexHtml.includes('src="assets/github-contributions.svg"'), 'index.html 必须默认加载本地贡献图');
    const scriptJs = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(scriptJs.includes("fetch('assets/github-contributions.svg')"), 'script.js 必须优先 fetch 本地贡献图');
});

test('styles.css 包含骨架屏微光动效、可点标签样式与相册灯箱 EXIF 卡片样式', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('@keyframes skeletonShimmer'), '必须包含 skeletonShimmer 骨架屏动画');
    assert.ok(css.includes('.g-item:not(.g-loaded):not(.g-error)::before'), '相册照片加载中必须显示微光占位');
    assert.ok(css.includes('.media-cover:not(.is-loaded)'), '书影音封面必须支持骨架屏');
    assert.ok(css.includes('a.post-tag'), '文章标签必须具备可交互链接样式');
    assert.ok(css.includes('.post-item-tag'), '列表文章标签必须支持点击样式');
    assert.ok(css.includes('.site-photo-info-btn'), '相册灯箱必须包含信息按钮样式');
    assert.ok(css.includes('.site-photo-info-card'), '相册灯箱必须包含参数面板样式');
});

test('blog/index.html 包含标签数据与可点击标签元素', () => {
    const blogIndex = fs.readFileSync(path.join(ROOT, 'blog', 'index.html'), 'utf8');
    assert.ok(blogIndex.includes('data-tags='), '文章列表项必须包含 data-tags 属性');
    assert.ok(blogIndex.includes('class="post-item-tag"'), '文章列表元数据中必须包含 post-item-tag 标签');
    assert.ok(blogIndex.includes('activeTag'), '列表页脚本必须支持 activeTag 标签过滤');
    assert.ok(blogIndex.includes('syncFromUrl'), '列表页脚本必须支持 URL Query 还原');
});

test('博客详情页包含跳转至标签筛选列表的链接', () => {
    // 随机抽查一篇有标签的文章
    const samplePost = path.join(ROOT, 'blog', 'legacy-article-030e869a99', 'index.html');
    if (fs.existsSync(samplePost)) {
        const html = fs.readFileSync(samplePost, 'utf8');
        assert.match(html, /<a class="post-tag" href="\/blog\/\?tag=[^"]+"[^>]*>#[^<]+<\/a>/);
    }
});

test('说说支持定位解析与剥离（HTML 注释与 Issue 模板格式）', async () => {
    const { parseMomentContent } = await import('../scripts/sync-moments.mjs');
    
    // 1. HTML 注释格式
    const res1 = parseMomentContent('今天阳光很好\n\n<!-- location: 北京 · 朝阳区 -->');
    assert.equal(res1.text, '今天阳光很好');
    assert.equal(res1.location, '北京 · 朝阳区');
    
    // 2. Issue 模板格式
    const res2 = parseMomentContent('### 想说的话\n\n在海边吹风\n\n### 所在地点\n\n阿那亚');
    assert.equal(res2.text, '在海边吹风');
    assert.equal(res2.location, '阿那亚');
    
    // 3. 无定位信息
    const res3 = parseMomentContent('纯文字说说');
    assert.equal(res3.text, '纯文字说说');
    assert.equal(res3.location, '');
});

test('说说前端定位样式与选择器交互代码就绪', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('.moment-location'), '必须包含 .moment-location 地理位置样式');
    assert.ok(css.includes('.moment-location-picker'), '必须包含 .moment-location-picker 定位选择器');
    assert.ok(css.includes('.moment-loc-btn'), '必须包含 .moment-loc-btn 定位操作按钮样式');
    assert.ok(css.includes('.moment-loc-tag'), '必须包含 .moment-loc-tag 已选地点样式');

    const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(js.includes('selectedMomentLocation'), '必须声明并维护 selectedMomentLocation 状态');
    assert.ok(js.includes('navigator.geolocation'), '必须支持原生 navigator.geolocation 获取经纬度');
    assert.ok(js.includes('moment-location'), '必须在说说条目中渲染 moment-location');
    assert.ok(js.includes('location: selectedMomentLocation'), '发布说说与草稿必须保存 location 字段');
});

test("全局指令/搜索面板 (Cmd+K) 结构、样式与快捷键绑定就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".cmd-palette-backdrop"), "styles.css 必须包含 .cmd-palette-backdrop 遮罩样式");
    assert.ok(css.includes(".cmd-palette-dialog"), "styles.css 必须包含 .cmd-palette-dialog 弹窗样式");
    assert.ok(css.includes(".search-trigger-btn"), "styles.css 必须包含 .search-trigger-btn 顶栏搜索按钮样式");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initCommandPalette"), "script.js 必须包含 initCommandPalette 初始化函数");
    assert.ok(js.includes("cmdPalette"), "script.js 必须包含 cmdPalette DOM 元素");
    assert.ok(js.includes("blogPostsCache"), "必须支持博客文章缓存检索");
    assert.ok(js.includes("momentsCache"), "必须支持说说缓存检索");
    assert.ok(js.includes("openCommandPalette"), "必须暴露 window.openCommandPalette 全局接口");

    const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(indexHtml.includes("id=\"searchTriggerBtn\""), "index.html 顶栏必须包含 searchTriggerBtn");
});

test("移动端浮动目录 (Floating TOC) 与抽屉样式及联动逻辑就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".float-toc-btn"), "styles.css 必须包含 .float-toc-btn 浮动目录按钮样式");
    assert.ok(css.includes(".toc-drawer"), "styles.css 必须包含 .toc-drawer 抽屉样式");
    assert.ok(css.includes(".toc-drawer-backdrop"), "styles.css 必须包含 .toc-drawer-backdrop 遮罩样式");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("floatTocBtn"), "script.js 必须包含 floatTocBtn 控制逻辑");
    assert.ok(js.includes("tocDrawerBackdrop"), "script.js 必须包含 tocDrawerBackdrop 抽屉控制逻辑");
});

test("跨页面无缝预加载 (Instant Page) 逻辑就绪", () => {
    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initInstantPage"), "script.js 必须包含 initInstantPage");
    assert.ok(js.includes("prefetched.has(url)"), "预加载必须防止重复请求");
});

test("相册年份时间轴快速定位 (Year Timeline Jump) 逻辑就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".gallery-year-nav"), "styles.css 必须包含 .gallery-year-nav 样式");
    assert.ok(css.includes(".gallery-year-btn"), "styles.css 必须包含 .gallery-year-btn 样式");
    assert.ok(css.includes(".gallery-year-anchor"), "styles.css 必须包含 .gallery-year-anchor 锚点样式");

    const galleryJs = fs.readFileSync(path.join(ROOT, "gallery.js"), "utf8");
    assert.ok(galleryJs.includes("renderYearNav"), "gallery.js 必须包含 renderYearNav 函数");
    assert.ok(galleryJs.includes("gallery-year-anchor"), "gallery.js 必须动态注入年份锚点");
});

test("说说地点/标签筛选支持 URL Query 联动与后退现场恢复", () => {
    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("setMomentsFilter"), "script.js 必须包含 setMomentsFilter 函数");
    assert.ok(js.includes("momentsLocationFilter"), "script.js 必须包含 momentsLocationFilter 状态");
    assert.ok(js.includes("initMomentsUrlSync"), "script.js 必须支持 URL Query 状态还原");
});

test("书影音移动端标签切换 (Media Tabs) 与横滑吸附 (Horizontal Peek) 联动就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".media-tabs"), "styles.css 必须包含 .media-tabs 样式");
    assert.ok(css.includes(".media-tab"), "styles.css 必须包含 .media-tab 样式");
    assert.ok(css.includes(".media-grid {\n        display: flex;\n        grid-template-columns: none;\n        overflow-x: auto;"), "移动端书影音必须启用弹性横向滑轨");
    assert.ok(css.includes("scroll-snap-type: x mandatory;"), "移动端书影音必须设置横向物理吸附");
    assert.ok(css.includes(".media-col {\n        display: block;\n        flex: 0 0 calc(100% - 50px);"), "书影音分类卡片必须设置呼吸留白与 Peek 露出");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initMediaTabs"), "script.js 必须包含 initMediaTabs");
    assert.ok(js.includes("syncActiveTabOnScroll"), "script.js 必须支持滑动手势与 Tab 激活的双向联动同步");
});

test("微交互 (Micro-interactions) 与灯箱图片缩放就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".post-lightbox-img.is-zoomed"), "styles.css 必须包含灯箱放大样式");
    assert.ok(css.includes("-webkit-tap-highlight-color: transparent"), "必须去除移动端点击高亮遮罩");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("is-zoomed"), "script.js 灯箱必须支持双击缩放");
});

test('文章右下角浮动目录与回到顶部按钮对齐、大小及竖向堆叠规范', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('.float-top-btn,\n.float-toc-btn'), '回到顶部与浮动目录按钮必须使用统一定义');
    assert.ok(css.includes('width: 42px'), '桌面端默认直径必须保持一致（42px）');
    assert.ok(css.includes('height: 42px'), '桌面端默认高度必须保持一致（42px）');
    assert.ok(css.includes('.float-toc-btn {\n    bottom: calc(78px'), '浮动目录按钮必须竖向对齐堆叠在回到顶部上方（间距 10px）');
    assert.ok(css.includes('right: calc(16px + env(safe-area-inset-right, 0px))'), '移动端横向边距与回到顶部严格对齐');
});

test('代码块一体化卡片容器与非胶囊扁平操作样式就绪', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('.post-body .code-block pre'), '必须对包裹在 code-block 内的 pre 归一化内边距与边框');
    assert.ok(css.includes('.code-lang {\n    position: absolute;\n    top: 8px;\n    right: 66px;'), '语言标识必须在代码块顶部右上角非胶囊纯排版展示');
    assert.ok(css.includes('background: transparent;\n    border: none;\n    border-radius: 0;'), '语言标识必须为非胶囊样式');
    assert.ok(css.includes('.copy-btn {\n    position: absolute;\n    top: 8px;\n    right: 10px;'), '复制按钮必须精确定位在代码块内顶部右上角');
    assert.ok(css.includes('background: transparent;\n    border: none;\n    border-radius: 4px;'), '复制按钮必须为非胶囊扁平样式');

    const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(js.includes('viewBox="0 0 24 24" width="12" height="12"'), '复制代码按钮必须包含微型矢量图标');
    assert.ok(js.includes('已复制'), '复制代码按钮必须支持状态反馈');
});

test("相册放大后照片日期与标题固定于视口底部，纯文字展示无胶囊边框，并与移动端左右切换按钮协调统一", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".post-lightbox-caption {\n    position: absolute;\n    bottom: calc(28px"), "PC 端说明文字必须固定在视口底部");
    assert.ok(css.includes("background: transparent;\n    border: none;"), "文字必须保持纯净无胶囊边框");
    assert.ok(css.includes(".post-lightbox-caption:empty { display: none !important; }"), "无说明时自动隐藏");
    assert.ok(css.includes("max-width: calc(100vw - 124px)"), "移动端说明宽度自适应且避开两侧翻页按钮");
});

test("移动端导航栏 brand 标志字号适配（主次层级分明且垂直居中）", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".topbar .brand {\n        order: 1;\n        font-size: 17px;"), "移动端 topbar brand 字号必须适度放大至 17px");
    assert.ok(css.includes("line-height: 28px"), "移动端 brand 必须与右侧 28px 操作按钮垂直居中平齐");
    assert.doesNotMatch(css, /@media \(max-width: 400px\) \{[\s\S]*?\.brand\s*\{\s*font-size:\s*13\.5px/, "窄屏不得将 brand 再次压缩为 13.5px 导致与导航小字混淆");
});
test("移动端作品卡片横向吸附滑块 (Horizontal Peek) 与指示点就绪", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(html.includes('class="projects-pagination"'), "HTML 必须包含作品移动端分页指示容器");
    assert.ok(html.includes('class="project-dot active"'), "默认第一项指示点激活");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".projects-pagination {\n    display: none;\n}"), "桌面端必须隐藏分页指示点");
    assert.ok(css.includes("scroll-snap-type: x mandatory;"), "移动端作品网格必须启用横向物理吸附");
    assert.ok(css.includes("-webkit-overflow-scrolling: touch;"), "移动端必须开启平滑弹性滚动");
    assert.ok(css.includes("scroll-snap-align: start;"), "作品卡片必须设置 snap 吸附起点");
    assert.ok(css.includes(".project-dot.active {\n        width: 16px;"), "激活的指示点呈现现代长胶囊微动效");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initProjectsSlider"), "JS 必须包含作品滑块与指示点联动初始化逻辑");
    assert.ok(js.includes("updateActiveDot"), "JS 必须具备基于视口几何计算的动态指示点同步机制");
});

test("PC 端作品轮播扩展与多作品翻页微控导航就绪", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(html.includes('id="projectsNav"'), "HTML 必须包含作品翻页导航容器");
    assert.ok(html.includes('id="projectsPrevBtn"'), "HTML 必须包含上一页作品微按钮");
    assert.ok(html.includes('id="projectsNextBtn"'), "HTML 必须包含下一页作品微按钮");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".projects-grid {\n    display: flex;\n    overflow-x: auto;"), "PC 端作品网格采用 flex + 横向溢出滚动");
    assert.ok(css.includes("flex: 0 0 calc(50% - 7px);"), "PC 端单张卡片占半屏确保双卡整齐平铺");
    assert.ok(css.includes(".projects-nav.is-visible {\n    display: inline-flex;\n}"), "多作品时 PC 翻页微按钮激活显示");
    assert.ok(css.includes(".projects-nav {\n        display: none !important;\n    }"), "移动端强制隐藏 PC 微按钮避免与手势冲突");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("projectsNav"), "JS 必须包含作品导航节点引用");
    assert.ok(js.includes("projectsPrevBtn") && js.includes("projectsNextBtn"), "JS 必须绑定翻页微按钮");
    assert.ok(js.includes("cards.length > 2"), "项目多于 2 个时才激活 PC 控制器");
});

test("首页个人卡片隐藏工作经历，转由全局指令面板 (Cmd+K) 彩蛋/关键词检索展示", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(!html.includes("class=\"career-row\""), "index.html 个人卡片中不再直接展示 career-row 工作经历");
    assert.ok(!html.includes("class=\"career-label\""), "index.html 个人卡片中不再直接展示 career-label");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("CAREER_ITEMS"), "script.js 必须包含工作经历彩蛋数据源 CAREER_ITEMS");
    assert.ok(js.includes("曾就职于"), "script.js 命令面板分组与徽章必须包含「曾就职于」");
    assert.ok(js.includes("/career"), "script.js 命令面板必须支持 /career 或相关指令");
    assert.ok(js.includes("58同城") && js.includes("字节跳动") && js.includes("美团") && js.includes("百度"), "工作经历数据源必须完整包含 58同城、字节跳动、美团、百度");
    assert.ok(js.includes("ico-bytedance"), "必须包含字节跳动专属 SVG 图标");
    assert.ok(js.includes("FFD900"), "必须包含 58 同城专属黄色 SVG 图标");
    assert.ok(js.includes("FFC300"), "必须包含美团专属黄色 SVG 图标");
    assert.ok(js.includes("2932E1"), "必须包含百度专属蓝色 SVG 图标");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".cmd-palette-item-icon svg"), "styles.css 必须为命令面板图标 SVG 设置标准尺寸");
});

test("个人卡片头衔增加 Dad 角色标识", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(html.includes('<p class="role-text">Backend Engineer / Developer · Dad</p>'), "首页个人卡片头衔中必须包含 Dad 标识");
    assert.ok(html.includes('<p class="text-secondary">一个男孩的父亲，正在学习如何陪他慢慢长大</p>'), "首页个人简介中必须包含「一个男孩的父亲，正在学习如何陪他慢慢长大」");
});

test("相册页照片反重力吸附动效 (Anti-gravity Magnetic Float) 就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".g-row.g-row-float"), "styles.css 必须包含相册浮空行类名");
    assert.ok(css.includes("cubic-bezier(0.35, 0, 0.25, 1)"), "styles.css 必须包含反重力向上加速度与阻尼入座曲线");
    assert.ok(css.includes("--stagger-i"), "styles.css 必须支持行内照片错落交错延迟");
    assert.ok(css.includes("--float-y"), "styles.css 必须支持自定义错落深度下沉位移");
    assert.ok(css.includes(".g-row.g-row-float.g-absorbed"), "styles.css 必须包含吸附完成状态类名");
    assert.ok(css.includes("backdrop-filter: none;"), "styles.css 移动端 card-gallery 移除 backdrop-filter 彻底杜绝 Chrome 闪屏");

    const js = fs.readFileSync(path.join(ROOT, "gallery.js"), "utf8");
    assert.ok(js.includes("floatObserver"), "gallery.js 必须包含反重力视口观察器");
    assert.ok(js.includes("staggerOrder"), "gallery.js 必须支持行内照片随机打乱吸附顺序");
    assert.ok(js.includes("--float-y"), "gallery.js 必须为每张照片设置错落下沉位移");
    assert.ok(js.includes("floatObserver.unobserve(entry.target)"), "gallery.js 必须在元素吸附后解除观察，不进行反向重置动画");
    assert.ok(js.includes("ROW_BATCH = 1;"), "gallery.js 必须支持逐行动态按需加载");
    assert.ok(css.includes("overflow: visible;"), "styles.css 浮空行必须允许溢出以支撑全屏底边起跳位移");
});

test("说说列表页反重力吸附动效 (Moments Magnetic Float) 就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".moment-item.moment-item-float"), "styles.css 必须包含说说浮动卡片类名");
    assert.ok(css.includes(".moment-item.moment-item-float.moment-absorbed"), "styles.css 必须包含说说吸附完成类名");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("momentFloatObserver"), "script.js 必须包含说说视口浮动观察器");
    assert.ok(js.includes("moment-absorbed"), "script.js 必须在说说进入视口时添加吸附类名");
});

test("文章列表页轻量微阻尼浮现动效 (Blog Posts Subtle Float-in) 就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".post-item.post-item-float"), "styles.css 必须包含文章微阻尼浮现类名");
    assert.ok(css.includes(".post-item.post-item-float.post-absorbed"), "styles.css 必须包含文章吸附类名");

    const tpl = fs.readFileSync(path.join(ROOT, "templates/blog-list.html"), "utf8");
    assert.ok(tpl.includes("postObserver"), "templates/blog-list.html 必须包含文章视口观察器");
    assert.ok(tpl.includes("post-item-float"), "templates/blog-list.html 必须给非首屏文章添加微阻尼浮现类名");
});

test("说说图片放大展示说说文字内容与长文本截断防护", () => {
    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("isMoment"), "script.js 必须判断是否为说说图片灯箱");
    assert.ok(js.includes("MAX_MOMENT_CAPTION"), "script.js 必须限制说说底栏标题最大长度并做截断");
    assert.ok(js.includes("photo.fullText"), "script.js 必须保留完整文字用于 title 提示");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".post-lightbox-caption[role=\"button\"]"), "styles.css 必须为可交互按钮设置手型光标");
    assert.ok(css.includes("line-height: 44px;"), "styles.css 移动端底栏文字高度必须与翻页按钮垂直居中平齐");
});


test("首页板块反重力阻尼吸附动效 (Home Sections Magnetic Float) 就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".home-card-float"), "styles.css 必须包含首页卡片浮动类名");
    assert.ok(css.includes(".home-card-float.card-absorbed"), "styles.css 必须包含卡片吸附完成类名");
    assert.ok(css.includes("cubic-bezier(0.35, 0, 0.25, 1)"), "styles.css 必须包含反重力阻尼贝塞尔曲线");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initHomeFloatAnimation"), "script.js 必须包含 initHomeFloatAnimation 函数");
    assert.ok(js.includes("homeFloatObserver"), "script.js 必须包含首页卡片视口浮动观察器");
    assert.ok(js.includes("card-absorbed"), "script.js 必须在进入视口或级联时添加吸附类名");
});

test("说说发布 401 凭据失效拦截与重新授权闭环 (Scheme 3) 就绪", () => {
    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("startMomentOAuth"), "script.js 必须包含 startMomentOAuth 统一授权函数");
    assert.ok(js.includes("isAuthExpired"), "script.js 必须具备 401 / Bad credentials 认证失效拦截逻辑");
    assert.ok(js.includes("clearMomentAuth()"), "script.js 凭据失效时必须自动清理脏 Token");
    assert.ok(js.includes("submitBtn.dataset.reauth = \"true\""), "script.js 必须将提交按钮转换为重新授权状态");
    assert.ok(js.includes("mfcheer_reauth_open_moment"), "script.js 必须包含授权后自动唤起说说并恢复草稿的标记");
    assert.ok(js.includes("is-reauth"), "script.js 必须添加 is-reauth 视觉类名");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".moment-btn-primary.is-reauth"), "styles.css 必须包含重新授权按钮警示高亮样式");
});

test("外链视频与流媒体播放优化 (Bilibili / YouTube / MP4 直链与文章容器) 就绪", () => {
    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("high_quality=1"), "script.js B站播放器参数必须包含 high_quality=1 高清标识");
    assert.ok(js.includes("danmaku=0"), "script.js B站播放器必须默认关闭弹幕 danmaku=0 以保持清爽");
    assert.ok(js.includes("as_wide=1"), "script.js B站播放器必须包含 as_wide=1 宽屏适配");
    assert.ok(js.includes("b23.tv"), "script.js 必须支持 b23.tv 短链中的 BV 号提取");
    assert.ok(js.includes("directVideo"), "script.js 必须支持原生视频直链解析");
    assert.ok(js.includes("createElement('video')"), "script.js 必须支持直接创建原生 video 标签原位播放");

    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".moment-media-player video"), "styles.css 说说播放器必须适配 video 标签");
    assert.ok(css.includes(".post-video-container"), "styles.css 必须包含文章视频 16:9 响应式容器类名");
    assert.ok(css.includes(".post-body video"), "styles.css 必须包含文章原生 video 基础样式");

    const buildPosts = fs.readFileSync(path.join(ROOT, "scripts/build-posts.mjs"), "utf8");
    assert.ok(buildPosts.includes("post-video-container"), "scripts/build-posts.mjs 必须支持将视频渲染为 post-video-container");
    assert.ok(buildPosts.includes("player.bilibili.com"), "scripts/build-posts.mjs 必须支持 B 站内嵌");
});

test("相册发布后即刻乐观更新与待同步合并 (Optimistic Gallery Update & Pending Sync) 就绪", () => {
    const galleryJs = fs.readFileSync(path.join(ROOT, "gallery.js"), "utf8");
    assert.ok(galleryJs.includes("optimisticAddGalleryPhotos"), "gallery.js 必须包含乐观更新函数 optimisticAddGalleryPhotos");
    assert.ok(galleryJs.includes("GALLERY_PENDING_KEY"), "gallery.js 必须包含本地待同步批次常量");
    assert.ok(galleryJs.includes("getPendingGalleryBatches"), "gallery.js 必须包含读取待同步批次函数");
    assert.ok(galleryJs.includes("savePendingGalleryBatch"), "gallery.js 必须包含保存待同步批次函数");
    assert.ok(galleryJs.includes("mergeBatchIntoAlbums"), "gallery.js 必须包含待同步批次合并函数");
    assert.ok(galleryJs.includes("🎉 照片发布成功！已在相册实时展示。"), "gallery.js 必须给出即时乐观展示的成功提示");
    assert.ok(galleryJs.includes("raw.githubusercontent.com"), "gallery.js 必须支持 Pages 未部署时的 raw GitHub 回退加载");
    assert.ok(galleryJs.includes("p.startsWith('blob:') || p.startsWith('data:')"), "gallery.js rootUrl 必须保留 blob: 与 data: 协议");

    const scriptJs = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(scriptJs.includes("resolve({ dataUrl, base64, width, height })"), "script.js 图片压缩必须返回尺寸元数据供相册排版");
    assert.ok(scriptJs.includes("raw.githubusercontent.com"), "script.js 灯箱必须支持相册未部署原图回退");
});

test("说说配图发布即刻乐观预览与 Pages 未就绪容灾 (Moments Image Optimistic Preview & Fallback) 就绪", () => {
    const scriptJs = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(scriptJs.includes("previewUrl"), "script.js 必须支持说说配图 previewUrl 内存预览");
    assert.ok(scriptJs.includes("raw.githubusercontent.com/mfcheer/mfcheer.github.io/main/"), "script.js 必须具备 Pages 构建期 raw.githubusercontent 容灾");
    assert.ok(scriptJs.includes("cleanList"), "script.js writeMomentsCache 必须过滤大体积 dataUrl 以免超出配额");
});

test("主页微信群聊分享卡片规范（itemprop 专用元信息与 1:1 正方形首图锚点）", () => {
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert.ok(html.includes("itemprop=\"name\" content=\"mfcheer · 个人主页\""), "必须包含微信专属 itemprop name 规范");
    assert.ok(html.includes("itemprop=\"description\""), "必须包含微信专属 itemprop description 规范");
    assert.ok(html.includes("itemprop=\"image\" content=\"https://mfcheer.github.io/assets/wechat-share.jpg\""), "必须包含微信专属正方形缩略图链接");
    assert.ok(html.includes("<img src=\"https://mfcheer.github.io/assets/wechat-share.jpg\" width=\"400\" height=\"400\""), "body 必须包含微信不可见首图锚点以保障微信客户端 100% 抓取");

    // 保证国际标准 Open Graph 保持完整
    assert.ok(html.includes("property=\"og:image\" content=\"https://mfcheer.github.io/assets/share-card.png\""), "国际标准 16:9 横版 share-card.png 必须完整保留");
    assert.ok(html.includes("name=\"twitter:image\" content=\"https://mfcheer.github.io/assets/share-card.png\""), "Twitter 大卡片必须完整保留");

    // 检查图片文件
    const imgPath = path.join(ROOT, "assets/wechat-share.jpg");
    assert.ok(fs.existsSync(imgPath), "assets/wechat-share.jpg 必须存在");
    const stat = fs.statSync(imgPath);
    assert.ok(stat.size > 0 && stat.size <= 65536, "图片体积必须适中且小于 64KB");
});
