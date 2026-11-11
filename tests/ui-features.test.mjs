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

test("书影音移动端标签切换 (Media Tabs) 逻辑与样式就绪", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes(".media-tabs"), "styles.css 必须包含 .media-tabs 样式");
    assert.ok(css.includes(".media-tab"), "styles.css 必须包含 .media-tab 样式");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("initMediaTabs"), "script.js 必须包含 initMediaTabs");
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
