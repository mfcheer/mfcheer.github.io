import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { webcrypto, createHash } from 'node:crypto';
const source = readFileSync(new URL('../gallery.js', import.meta.url), 'utf8');
const functions = source.slice(source.indexOf('    function updateGalleryResumeUI()'), source.indexOf('    // 事件委托绑定'));
const sha = base64 => {
    const bytes = Buffer.from(base64, 'base64');
    return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
};
function setup(saved = {}) {
    const calls = { puts: [], posts: [], reads: [], compress: 0, closed: 0, authCleared: 0 };
    const persisted = { files: structuredClone(saved.files || []), fields: structuredClone(saved.fields || {}) };
    const elements = new Map();
    for (const selector of ['#galleryAlbumName', '#galleryAlbumDesc', '#gallerySubmitBtn', '#galleryUploadStatus', '#galleryImgPreviews', '#galleryFileInput', '.moment-thumb-del']) {
        elements.set(selector, { value: selector === '#galleryAlbumName' ? '旅行' : '', style: {}, disabled: false });
    }
    const card = { querySelector: s => elements.get(s), querySelectorAll: s => [elements.get(s)].filter(Boolean), setAttribute() {} };
    const context = vm.createContext({
        console, crypto: webcrypto, TextEncoder, Uint8Array, atob, AbortSignal,
        window: { location: { origin: 'https://mfcheer.github.io' } },
        document: { getElementById: () => card }, URL: { revokeObjectURL() {} },
        galleryUploadBusy: false, galleryUploadFiles: structuredClone(persisted.files),
        galleryDraft: {
            fields: structuredClone(persisted.fields), imageSaved: true, textSaved: true,
            saveFields(fields) { this.fields = fields; persisted.fields = structuredClone(fields); },
            async saveFiles(files) { persisted.files = structuredClone(files); this.imageSaved = true; }
        },
        getMomentAuth: () => ({ token: 'TEST_ONLY' }),
        clearMomentAuth: () => calls.authCleared++,
        renderGalleryUploadModal() {}, renderGalleryUploadPreviews() {},
        setEditorBusy(draft, _, busy) { draft.busy = busy; },
        showMomentToast() {}, closeGalleryUploadModal() { calls.closed++; },
        compressMomentImage: async () => { calls.compress++; return { base64: 'cGhvdG8=' }; },
        fileToRawBase64: async () => 'R0lG',
        uploadMomentImage: async (_, filename) => {
            calls.puts.push(filename);
            assert.ok(persisted.files.some(item => item.upload?.filename === filename && item.upload.attempted), '请求前先保存身份');
            return `assets/gallery/${filename}`;
        },
        createMomentIssue: async (_, title, body, labels) => { calls.posts.push({ title, body, labels }); return { number: 123 }; },
        fetch: async url => { calls.reads.push(url); return { ok: true, status: 200, json: async () => [] }; }
    });
    vm.runInContext(functions, context);
    return { calls, persisted, context, elements,
        run: code => vm.runInContext(code, context),
        submit: () => { context.card = card; return vm.runInContext("submitGalleryUpload(card, card.querySelector('#galleryUploadStatus'), card.querySelector('#gallerySubmitBtn'))", context); }
    };
}
const photo = name => ({ file: { type: 'image/jpeg', name }, dataUrl: `blob:${name}` });

test('中途失败后刷新续传：已完成不重传、不重压缩，顺序保持', async () => {
    const env = setup({ files: [photo('a'), photo('b'), photo('c')] });
    const original = env.context.uploadMomentImage;
    env.context.uploadMomentImage = async (...args) => { if (env.calls.puts.length === 1) throw Error('断网'); return original(...args); };
    await env.submit();
    assert.equal(env.calls.puts.length, 1);
    assert.equal(env.calls.posts.length, 0);
    assert.equal(env.persisted.files[0].upload.path.endsWith('.jpg'), true);
    const restored = setup(env.persisted);
    restored.context.fetch = async url => { restored.calls.reads.push(url); return { status: 404, ok: false }; };
    await restored.submit();
    assert.equal(restored.calls.puts.length, 2);
    assert.equal(restored.calls.compress, 1); // 第2张已有压缩快照，只压第3张
    assert.equal(restored.calls.puts[0], env.persisted.files[1].upload.filename);
    assert.equal(restored.calls.posts.length, 1);
    const body = restored.calls.posts[0].body;
    assert.ok(body.indexOf(env.persisted.files[0].upload.filename) < body.indexOf(restored.calls.puts[0]));
    assert.deepEqual(restored.persisted.files, []);
    assert.deepEqual(restored.persisted.fields, {});
});

test('图片已写入但响应丢失：SHA 核对一致后跳过 PUT', async () => {
    const env = setup({ files: [photo('a')] });
    env.context.uploadMomentImage = async () => { throw Error('响应丢失'); };
    await env.submit();
    assert.equal(env.persisted.files[0].upload.sha, sha('cGhvdG8='));
    const restored = setup(env.persisted);
    restored.context.fetch = async () => ({ ok: true, status: 200, json: async () => ({ sha: sha('cGhvdG8=') }) });
    await restored.submit();
    assert.equal(restored.calls.puts.length, 0);
    assert.equal(restored.calls.compress, 0);
    assert.equal(restored.calls.posts.length, 1);
});

test('同名文件 SHA 不一致时不覆盖、不创建相册', async () => {
    const env = setup({ files: [{ ...photo('a'), upload: { filename: 'stable.jpg', attempted: true, sha: 'expected' } }] });
    env.context.fetch = async () => ({ ok: true, status: 200, json: async () => ({ sha: 'other' }) });
    await env.submit();
    assert.equal(env.calls.puts.length + env.calls.posts.length, 0);
    assert.match(env.elements.get('#galleryUploadStatus').textContent, /内容不一致/);
});

test('创建相册失败后只重试创建，照片不重传', async () => {
    const env = setup({ files: [photo('a'), photo('b')] });
    env.context.createMomentIssue = async () => { throw Error('断网'); };
    await env.submit();
    const restored = setup(env.persisted);
    await restored.submit();
    assert.equal(restored.calls.puts.length + restored.calls.compress, 0);
    assert.equal(restored.calls.posts.length, 1);
    assert.ok(restored.calls.posts[0].body.includes(env.persisted.fields.publish.id));
});

test('创建成功但响应丢失：遍历分页查找批次标记，包含已关闭相册，不重复创建', async () => {
    const env = setup({ files: [photo('a')], fields: { publish: { id: 'batch', since: '2026-11-10T00:00:00Z' } } });
    env.context.fetch = async url => {
        env.calls.reads.push(url);
        const issues = new URL(url).searchParams.get('page') === '1' ? Array.from({ length: 100 }, () => ({})) : [{ user: { login: 'mfcheer' }, state: 'closed', body: '<!-- gallery-upload:batch -->' }];
        return { ok: true, status: 200, json: async () => issues };
    };
    await env.submit();
    assert.equal(env.calls.reads.length, 2);
    assert.match(env.calls.reads[0], /state=all/);
    assert.equal(env.calls.posts.length + env.calls.puts.length, 0);
    assert.equal(env.calls.closed, 1);
});

for (const status of [401, 403, 500]) {
    test(`核对结果失败 (${status}) 保留草稿且不盲目重发`, async () => {
        const env = setup({ files: [photo('a')], fields: { publish: { id: 'batch', since: '2026-11-10T00:00:00Z' } } });
        env.context.fetch = async () => ({ ok: false, status });
        await env.submit();
        assert.equal(env.calls.puts.length + env.calls.posts.length, 0);
        assert.equal(env.persisted.files.length, 1);
        assert.equal(env.run('galleryUploadBusy'), false);
        assert.equal(env.calls.authCleared, status === 401 ? 1 : 0);
    });
}

test('重复点击只执行一个上传流程', async () => {
    const env = setup({ files: [photo('a')] });
    await Promise.all([env.submit(), env.submit()]);
    assert.equal(env.calls.puts.length, 1);
    assert.equal(env.calls.posts.length, 1);
});

test('GIF 保留原格式；超限在上传前拒绝', async () => {
    const env = setup({ files: [{ file: { type: 'image/gif', name: 'a.gif', size: 100 }, dataUrl: 'blob:gif' }] });
    await env.submit();
    assert.match(env.calls.puts[0], /\.gif$/);
    assert.equal(env.calls.compress, 0);
    const large = setup({ files: [{ file: { type: 'image/gif', name: 'large.gif', size: 16 * 1024 * 1024 } }] });
    await large.submit();
    assert.equal(large.calls.puts.length + large.calls.posts.length, 0);
    assert.match(large.elements.get('#galleryUploadStatus').textContent, /15MB/);
});

test('发布成功但清理图片草稿失败，刷新后只清理、不重复发布', async () => {
    const env = setup({ files: [photo('a')] });
    const save = env.context.galleryDraft.saveFiles;
    env.context.galleryDraft.saveFiles = async function(files) {
        if (!files.length) { this.imageSaved = false; return; }
        return save.call(this, files);
    };
    await env.submit();
    assert.equal(env.persisted.fields.publish.created, true);
    const restored = setup(env.persisted);
    await restored.submit();
    assert.equal(restored.calls.posts.length + restored.calls.puts.length + restored.calls.reads.length, 0);
    assert.deepEqual(restored.persisted.files, []);
});


test('清理图片成功后页面中断，空照片列表仍能完成已发布草稿清理', async () => {
    const env = setup({ files: [], fields: { name: '已发布', publish: { id: 'batch', created: true } } });
    await env.submit();
    assert.equal(env.calls.puts.length + env.calls.posts.length + env.calls.reads.length, 0);
    assert.equal(env.calls.closed, 1);
    assert.deepEqual(env.persisted.fields, {});
});
