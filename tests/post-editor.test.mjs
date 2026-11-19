import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('文章模板与构建产物包含文章编辑上下文元数据及按钮', () => {
    const postTpl = fs.readFileSync(path.join(ROOT, 'templates/post.html'), 'utf8');
    assert.ok(postTpl.includes('data-post-source="_posts/{{SOURCE_FILE}}"'), 'templates/post.html 必须注入 data-post-source');
    assert.ok(postTpl.includes('data-post-slug="{{SLUG}}"'), 'templates/post.html 必须注入 data-post-slug');
    assert.ok(postTpl.includes('id="postEditBtn"'), 'templates/post.html 顶部元数据栏必须包含 postEditBtn 编辑按钮');
    assert.ok(postTpl.includes('id="postFootEditBtn"'), 'templates/post.html 底部翻页栏必须包含 postFootEditBtn 编辑按钮');

    const buildPosts = fs.readFileSync(path.join(ROOT, 'scripts/build-posts.mjs'), 'utf8');
    assert.ok(buildPosts.includes('SOURCE_FILE: esc(p.file)'), 'build-posts.mjs 必须提取并注入 SOURCE_FILE');
    assert.ok(buildPosts.includes('SLUG: esc(p.slug)'), 'build-posts.mjs 必须提取并注入 SLUG');

    const samplePostDir = path.join(ROOT, 'blog/silicon-valley-tiger-kunlun/index.html');
    if (fs.existsSync(samplePostDir)) {
        const sampleHtml = fs.readFileSync(samplePostDir, 'utf8');
        assert.ok(sampleHtml.includes('data-post-source="_posts/2026-11-12-silicon-valley-tiger-kunlun.md"'), '真实生成文章必须包含对应的 md 源码路径');
        assert.ok(sampleHtml.includes('id="postEditBtn"'), '真实生成文章必须包含编辑入口');
    }
});

test('styles.css 包含文章编辑按钮与沉浸式在线编辑抽屉样式', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('.post-edit-btn'), 'styles.css 必须包含 .post-edit-btn 样式');
    assert.ok(css.includes('.post-foot-edit-btn'), 'styles.css 必须包含 .post-foot-edit-btn 样式');
    assert.ok(css.includes('.post-editor-backdrop'), 'styles.css 必须包含 .post-editor-backdrop 样式');
    assert.ok(css.includes('.post-editor-drawer'), 'styles.css 必须包含 .post-editor-drawer 样式');
    assert.ok(css.includes('.post-editor-meta-panel'), 'styles.css 必须包含 Front Matter 折叠面板样式');
    assert.ok(css.includes('.post-editor-toolbar'), 'styles.css 必须包含快捷工具栏样式');
    assert.ok(css.includes('.post-editor-textarea'), 'styles.css 必须包含 Markdown 编辑框样式');
    assert.ok(css.includes('.post-editor-pane.is-preview'), 'styles.css 必须包含实时预览面板样式');
});

test('script.js 包含文章在线编辑模块与 GitHub Contents 提交闭环', () => {
    const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(js.includes('initPostOnlineEditor'), 'script.js 必须包含文章在线编辑模块 initPostOnlineEditor');
    assert.ok(js.includes('article[data-post-source]'), 'script.js 必须通过 data-post-source 锚定文章');
    assert.ok(js.includes('openPostEditorDrawer'), 'script.js 必须导出并具备 openPostEditorDrawer 函数');
    assert.ok(js.includes('api.github.com/repos/mfcheer/mfcheer.github.io/contents/'), 'script.js 必须调用 GitHub Contents API');
    assert.ok(js.includes('parseMarkdownWithFrontMatter'), 'script.js 必须支持 Front Matter 解析');
    assert.ok(js.includes('serializeMarkdown'), 'script.js 必须支持 Front Matter 序列化');
    assert.ok(js.includes('decodeBase64Utf8'), 'script.js 必须具备 UTF-8 严格解码函数');
    assert.ok(js.includes('encodeUtf8Base64'), 'script.js 必须具备 UTF-8 严格编码函数');
    assert.ok(js.includes('applyOptimisticPostUpdate'), 'script.js 必须具备文章原地乐观更新 applyOptimisticPostUpdate');
    assert.ok(js.includes('mfcheer_open_post_editor'), 'script.js 必须支持 OAuth 登录后回跳并自动打开编辑器');
});

test("styles.css 与 script.js 具备深色模式自适应与源码拉取双轨容灾保护", () => {
    const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
    assert.ok(css.includes("--card-bg: rgba(255, 255, 255, 0.96);"), "浅色模式必须定义 --card-bg");
    assert.ok(css.includes("--card-bg: #121317;"), "深色模式必须定义暗色 --card-bg，严防白屏穿透");
    assert.ok(css.includes("background: var(--card-bg, var(--bg));"), "抽屉背景必须采用主题自适应变量");
    assert.ok(!css.includes("background: var(--card-bg, rgba(255, 255, 255, 0.96));"), "抽屉背景绝不可硬编码回退为纯白");

    const js = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
    assert.ok(js.includes("raw.githubusercontent.com"), "script.js 必须具备 raw.githubusercontent.com 降级容灾兜底");
    assert.ok(js.includes("titleInput.value = postTitle"), "script.js 必须在网络拉取期间从 DOM 立即预填标题");
});

test('沉浸式文档画布、胶囊分段控制器与专注全屏模式样式与交互就绪', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('.post-editor-segmented'), 'styles.css 必须包含胶囊分段控制器 .post-editor-segmented');
    assert.ok(css.includes('.post-editor-drawer.is-zen'), 'styles.css 必须包含专注全屏模式 .post-editor-drawer.is-zen');
    assert.ok(css.includes('.post-editor-canvas-title'), 'styles.css 必须包含画布无边框大标题 .post-editor-canvas-title');
    assert.ok(css.includes('.post-editor-tag-chip'), 'styles.css 必须包含标签 Chips .post-editor-tag-chip');
    assert.ok(css.includes('.post-editor-status-dot'), 'styles.css 必须包含微状态呼吸指示灯 .post-editor-status-dot');

    const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(js.includes('postEditorModeEdit'), 'script.js 必须支持编辑视图切换');
    assert.ok(js.includes('postEditorModeSplit'), 'script.js 必须支持分栏对照视图切换');
    assert.ok(js.includes('postEditorZenToggle'), 'script.js 必须支持专注模式切换');
    assert.ok(js.includes('syncTagsFromInput'), 'script.js 必须支持标签 Chips 联动');
    assert.ok(js.includes('autoResizeTitle'), 'script.js 必须支持大标题自适应展开');
});

test('移动端 Header 具备双层网格防覆盖排版与自适应微调', () => {
    const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
    assert.ok(css.includes('grid-template-areas:'), 'styles.css 移动端 Header 必须采用 grid 布局');
    assert.ok(css.includes('"left actions"'), 'styles.css 移动端首层必须为 left 与 actions 区域');
    assert.ok(css.includes('"center center"'), 'styles.css 移动端次层必须独占 center 分段切换器，防止文字重叠');
    assert.ok(css.includes('#postEditorZenToggle'), '移动端必须隐藏专注全屏切换按钮以节约视口');
    assert.ok(css.includes('.save-text-short'), '移动端必须具备精简保存按钮文字 .save-text-short');

    const js = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
    assert.ok(js.includes('save-text-full'), 'script.js 必须输出桌面完整保存文字类');
    assert.ok(js.includes('save-text-short'), 'script.js 必须输出移动端精炼保存文字类');
});
