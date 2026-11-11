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
