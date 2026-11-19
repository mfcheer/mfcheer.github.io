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
