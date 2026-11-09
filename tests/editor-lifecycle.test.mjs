import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const lifecycle = source.slice(source.indexOf('// 草稿正文同步保存'), source.indexOf('// ============================================================\n// 说说站内发布'));
function setup({ storageError = false, imageError = false } = {}) {
    let reloads = 0;
    const notices = [], listeners = {}, saved = new Map();
    const db = { transaction() {
        const tx = { objectStore: () => ({
            get() { const req = {}; queueMicrotask(() => { req.result = saved.get('files'); req.onsuccess(); }); return req; },
            put(files) { const copy = structuredClone(files); queueMicrotask(() => { saved.set('files', copy); tx.oncomplete(); }); }
        }) }; return tx;
    } };
    const context = vm.createContext({
        window: { location: { reload: () => reloads++ }, addEventListener: (name, fn) => { listeners[name] = fn; } },
        indexedDB: { open() { const req = {}; queueMicrotask(() => { if (imageError) { req.error = Error('quota'); req.onerror(); } else { req.result = db; req.onsuccess(); } }); return req; } },
        localStorage: { getItem: () => 'null', setItem() { if (storageError) throw Error('quota'); } },
        showMomentToast: msg => notices.push(msg), URL: { createObjectURL: () => 'blob:restored' },
        console
    });
    vm.runInContext(lifecycle, context);
    return { run: code => vm.runInContext(code, context), reloads: () => reloads, notices, listeners, saved };
}
test('阅读时新版本刷新一次', () => {
    const env = setup(); env.run('requestSiteUpdate(); requestSiteUpdate()'); assert.equal(env.reloads(), 1);
});
for (const state of ['open', 'busy', 'saving']) {
    test(`${state} 状态延后更新，结束后应用`, () => {
        const env = setup(); env.run(`var editor = { ${state}: true, textSaved: true, imageSaved: true, files: [] }; siteEditors.add(editor); requestSiteUpdate()`);
        assert.equal(env.reloads(), 0); env.run(`editor.${state} = false; applySiteUpdate()`); assert.equal(env.reloads(), 1);
    });
}
test('文字或图片未保存成功时禁止自动刷新', () => {
    for (const state of ['textSaved: false, imageSaved: true', 'textSaved: true, imageSaved: false']) {
        const env = setup(); env.run(`siteEditors.add({ ${state}, files: [{}] }); requestSiteUpdate()`); assert.equal(env.reloads(), 0);
    }
});
test('上传和待写入草稿离开保护；正常阅读不阻止', () => {
    const env = setup(); let prevented = 0;
    const event = { preventDefault() { prevented++; } };
    env.listeners.beforeunload(event); assert.equal(prevented, 0);
    env.run('siteEditors.add({busy: true})'); env.listeners.beforeunload(event); assert.equal(prevented, 1);
});
test('图片写入顺序一致，后一次快照胜出，清空落盘', async () => {
    const env = setup(); env.run('var draft = createSiteDraft("test")'); await env.run('draft.ready');
    const writes = env.run('Promise.all([draft.saveFiles([{base64:"old"}]), draft.saveFiles([{base64:"latest"}])])');
    await writes; assert.equal(env.saved.get('files')[0].base64, 'latest');
    await env.run('draft.clear()'); assert.equal(env.saved.get('files').length, 0);
});
test('存储不可用时保留内存并明确提示', async () => {
    const env = setup({ storageError: true, imageError: true });
    env.run('var draft = createSiteDraft("test")'); await env.run('draft.ready');
    env.run('draft.saveFields({text:"保留"})'); await env.run('draft.saveFiles([{base64:"image"}])');
    assert.equal(env.run('draft.fields.text'), '保留'); assert.equal(env.run('draft.files.length'), 1);
    assert.equal(env.notices.length, 2); env.run('requestSiteUpdate()'); assert.equal(env.reloads(), 0);
});
