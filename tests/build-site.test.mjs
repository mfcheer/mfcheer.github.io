import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { buildSite, fetchIssues, normalizeIssues } from '../scripts/build-site.mjs';

const issue = (label, number = 1) => ({ number, title: '示例', body: '正文', created_at: '2026-11-09T12:00:00Z', state: 'open', user: { login: 'mfcheer', avatar_url: 'avatar' }, author_association: 'OWNER', labels: [{ name: label }] });
async function fixture(t) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'site-test-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    async function put(file, data) {
        await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
        await fs.writeFile(path.join(root, file), data);
    }
    for (const [file, data] of Object.entries({
        'index.html': '首页', 'gallery/index.html': '相册页面', 'moments/index.html': '说说页面',
        'privacy/index.html': '隐私页面', '.nojekyll': '',
        'scripts/build-posts.mjs': 'blog', 'scripts/build-gallery.mjs': 'gallery', 'scripts/sync-moments.mjs': 'moments',
        '_posts/example.md': '文章', 'templates/post.html': '模板',
        'data/moments.json': '[]', 'data/gallery.json': '{"albums":[]}',
        'blog/old/index.html': '旧文章', 'atom.xml': 'feed', 'sitemap.xml': 'map', 'data/blog-index.json': '{}',
        '.github/workflows/private.yml': '不发布', '.private': '不发布', 'tests/private.js': '不发布'
    })) await put(file, data);
    let moments = [], gallery = [];
    const calls = [];
    const run = async (script, env) => {
        calls.push(script);
        assert.equal(env.STRICT_BUILD, '1');
        if (script.includes('build-posts')) await put('blog/old/index.html', await fs.readFile(path.join(root, '_posts/example.md')));
        if (script.includes('sync-moments')) {
            const snapshot = JSON.parse(await fs.readFile(env.ISSUES_SNAPSHOT));
            await put('data/moments.json', JSON.stringify(snapshot.map((i) => ({ text: i.body, images: [] }))));
        }
        if (script.includes('build-gallery')) await put('data/gallery.json', JSON.stringify({ albums: [], input: JSON.parse(await fs.readFile(env.ISSUES_SNAPSHOT)) }));
    };
    const options = { root, output: path.join(root, '_site'), getIssues: async (label) => label === 'moment' ? moments : gallery, run };
    return { root, put, calls, options, setMoments: (items) => { moments = items; }, setGallery: (items) => { gallery = items; } };
}

test('首次组装完整站点；不发布源码、测试和内部状态；重复事件不构建不发布', async (t) => {
    const f = await fixture(t);
    assert.equal((await buildSite(f.options)).publish, true);
    for (const p of ['index.html', 'blog/old/index.html', 'moments/index.html', 'gallery/index.html', 'privacy/index.html', '.nojekyll']) await fs.access(path.join(f.root, '_site', p));
    for (const p of ['scripts', 'tests', '.github', '.build-state.json', '.private']) await assert.rejects(fs.access(path.join(f.root, '_site', p)));
    f.calls.length = 0;
    const repeat = await buildSite(f.options);
    assert.deepEqual(repeat.changed, { blog: false, moments: false, gallery: false });
    assert.equal(repeat.publish, false);
    assert.deepEqual(f.calls, []);
});

test('相册变化仅构建相册，完整保留文章和说说', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    f.calls.length = 0;
    f.setGallery([issue('gallery')]);
    const result = await buildSite(f.options);
    assert.deepEqual(result.changed, { blog: false, moments: false, gallery: true });
    assert.deepEqual(f.calls, ['scripts/build-gallery.mjs']);
    assert.equal(await fs.readFile(path.join(f.root, '_site/blog/old/index.html'), 'utf8'), '文章');
    assert.equal(await fs.readFile(path.join(f.root, '_site/data/moments.json'), 'utf8'), '[]');
});

test('说说变化仅同步说说；删除、关闭或去标签后的空集合仍同步下架', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    f.setMoments([issue('moment')]);
    f.calls.length = 0;
    assert.deepEqual((await buildSite(f.options)).changed, { blog: false, moments: true, gallery: false });
    assert.deepEqual(f.calls, ['scripts/sync-moments.mjs']);
    f.setMoments([]);
    assert.equal((await buildSite(f.options)).changed.moments, true);
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(f.root, '_site/data/moments.json'))), []);
});

test('跨模块 pending 事件被替换后仍从完整输入发现两边的改动', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    f.setMoments([issue('moment')]);
    f.setGallery([issue('gallery')]);
    f.calls.length = 0;
    assert.deepEqual((await buildSite(f.options)).changed, { blog: false, moments: true, gallery: true });
    assert.deepEqual(f.calls, ['scripts/sync-moments.mjs', 'scripts/build-gallery.mjs']);
});

test('文章、模板变化重建文章；静态样式仅重新组装发布', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    await f.put('_posts/example.md', '修改后的文章');
    assert.deepEqual((await buildSite(f.options)).changed, { blog: true, moments: false, gallery: false });
    await f.put('templates/post.html', '新模板');
    assert.equal((await buildSite(f.options)).changed.blog, true);
    f.calls.length = 0;
    await f.put('styles.css', 'body {}');
    const result = await buildSite(f.options);
    assert.equal(result.publish, true);
    assert.deepEqual(f.calls, []);
});

test('构建失败不推进状态、不覆盖上次完整发布目录；重试仍发现待构建输入', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    const before = await fs.readFile(path.join(f.root, '.build-state.json'), 'utf8');
    f.setGallery([issue('gallery')]);
    await assert.rejects(buildSite({ ...f.options, run: async () => { throw new Error('模拟图片失败'); } }), /模拟图片失败/);
    assert.equal(await fs.readFile(path.join(f.root, '.build-state.json'), 'utf8'), before);
    assert.equal((await buildSite(f.options)).changed.gallery, true);
});

test('API 失败、缺失本地配图均停止发布并保留状态', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    const state = await fs.readFile(path.join(f.root, '.build-state.json'), 'utf8');
    await assert.rejects(buildSite({ ...f.options, getIssues: async () => { throw new Error('HTTP 503'); } }), /503/);
    await f.put('data/moments.json', JSON.stringify([{ images: [{ src: 'assets/moments/missing.jpg' }] }]));
    // 模拟已有 JSON 被误改而同步未修复，校验必须阻止发布。
    await assert.rejects(buildSite({ ...f.options, run: async () => {} }), /ENOENT/);
    assert.equal(await fs.readFile(path.join(f.root, '.build-state.json'), 'utf8'), state);
});

test('产物丢失自动修复；手动全量重建可回退', async (t) => {
    const f = await fixture(t);
    await buildSite(f.options);
    await fs.rm(path.join(f.root, 'data/moments.json'));
    assert.equal((await buildSite(f.options)).changed.moments, true);
    assert.deepEqual((await buildSite({ ...f.options, force: true })).changed, { blog: true, moments: true, gallery: true });
});

test('分页完整读取；任何一页失败或格式异常均不能静默截断', async () => {
    let calls = 0;
    const items = Array.from({ length: 100 }, (_, i) => issue('moment', i + 1));
    const fetched = await fetchIssues('moment', async () => ({ ok: true, json: async () => ++calls === 1 ? items : [issue('moment', 101)] }));
    assert.equal(fetched.length, 101);
    calls = 0;
    await assert.rejects(fetchIssues('moment', async () => ++calls === 1 ? { ok: true, json: async () => items } : { ok: false, status: 503 }), /第 2 页失败/);
    await assert.rejects(fetchIssues('moment', async () => ({ ok: true, json: async () => ({}) })), /格式错误/);
    await assert.rejects(fetchIssues('moment', async () => ({ ok: true, json: async () => items })), /5000/);
});

test('只接受本人相应标签的开放 Issue；保留恢复判断所需的更新时间', () => {
    const original = issue('moment');
    assert.deepEqual(normalizeIssues([original, { ...original, user: { login: 'stranger' } }, { ...original, pull_request: {} }, { ...original, state: 'closed' }, issue('gallery')], 'moment'), normalizeIssues([original], 'moment'));
    assert.deepEqual(normalizeIssues([{ ...original, comments: 20 }], 'moment'), normalizeIssues([original], 'moment'));
    assert.equal(normalizeIssues([{ ...original, updated_at: 'today' }], 'moment')[0].updated_at, 'today');
});
