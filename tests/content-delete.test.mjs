import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const code = script.slice(script.indexOf('// 删除仅修改'), script.indexOf('function showMomentToast'));
function setup({ owner = 'mfcheer', confirm = true, status = 200, failPatch = false, issue = {}, user = 'mfcheer' } = {}) {
    const calls = [], notices = [], events = [], storage = new Map();
    const targetIssue = { number: 7, user: { login: 'mfcheer' }, labels: [{ name: 'gallery' }, { name: 'moment' }], body: '文字\n![一](assets/a.jpg)\n![二](assets/b.jpg)', ...issue };
    const context = vm.createContext({
        getMomentAuth: () => ({ token: 'test-only', user: { login: owner } }),
        localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) },
        window: { confirm: () => confirm, addEventListener() {} },
        document: { addEventListener() {}, dispatchEvent: e => events.push(e) },
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } }, Event: class {},
        siteEditors: new Set(), siteLightbox: null,
        showMomentToast: (...args) => notices.push(args), clearMomentAuth() {},
        momentsAll: [{ issueNumber: 7 }, { issueNumber: 8 }], writeMomentsCache() {}, renderMomentsState() {}, applySiteUpdate() {},
        fetch: async (url, options) => {
            calls.push({ url, ...options });
            const responseStatus = failPatch && options.method === 'PATCH' ? 500 : status;
            return { ok: responseStatus === 200, status: responseStatus, json: async () => url.endsWith('/user') ? { login: user } : { ...targetIssue, updated_at: '2026-11-10T04:00:00Z' } };
        }
    });
    vm.runInContext(code, context);
    return { calls, notices, events, context, run: text => vm.runInContext(text, context) };
}
const remove = 'deleteSiteContent({ kind: "photo", issueNumber: 7, source: "assets/a.jpg" }, {disabled:false,textContent:"删除照片"})';
test('删除单张照片只修改它的图片引用，保留其他图片和正文', async () => {
    const env = setup(); await env.run(remove);
    assert.equal(env.calls.length, 3);
    assert.equal(env.calls[2].method, 'PATCH');
    assert.deepEqual(JSON.parse(env.calls[2].body), { body: '文字\n\n![二](assets/b.jpg)' });
    assert.equal(env.events[0].type, 'site-photo-deleted');
    assert.equal(env.run('isSiteDeleted("photo",7,"assets/a.jpg")'), true);
    assert.equal(env.run('isSiteDeleted("photo",7,"assets/b.jpg")'), false);
    assert.equal(env.run('isSiteDeleted("photo",7,"assets/a.jpg","2026-11-10T04:01:00Z")'), false);
});
test('删除说说关闭 Issue，成功后才从当前列表移除', async () => {
    const env = setup(); await env.run('deleteSiteContent({kind:"moment",issueNumber:7},{})');
    assert.deepEqual(JSON.parse(env.calls[2].body), { state: 'closed' });
    assert.equal(env.run('momentsAll.length'), 1);
    assert.equal(env.run('momentsAll[0].issueNumber'), 8);
});
test('未登录博主、取消确认时不发任何请求', async () => {
    for (const args of [{ owner: 'visitor' }, { confirm: false }]) {
        const env = setup(args); await env.run(remove); assert.equal(env.calls.length, 0);
    }
});
test('伪造本地身份或内容来源不符时绝不 PATCH', async () => {
    for (const args of [{ user: 'visitor' }, { issue: { user: {login:'visitor'} } }, { issue: { labels: [] } }, { issue: {pull_request:{}} }]) {
        const env = setup(args); await env.run(remove);
        assert.equal(env.calls.some(c => c.method === 'PATCH'), false);
        assert.equal(env.events.length, 0);
    }
});
test('网络或授权失败时保留内容并解除忙碌状态', async () => {
    for (const args of [{status:401},{status:403},{status:500},{failPatch:true}]) {
        const env = setup(args); await env.run(remove);
        assert.equal(env.events.length, 0);
        assert.equal(env.run('siteDeleteBusy'), false);
        assert.equal(env.run('siteEditors.size'), 0);
        assert.equal(env.run('isSiteDeleted("photo",7,"assets/a.jpg")'), false);
        assert.equal(env.notices.at(-1)[1], false);
    }
});
test('连续点击只发起一次删除；引用已变化时停止', async () => {
    const env = setup(); await env.run(`Promise.all([${remove},${remove}])`);
    assert.equal(env.calls.filter(c => c.method === 'PATCH').length, 1);
    const changed = setup({ issue: { body: '![二](assets/b.jpg)' } }); await changed.run(remove);
    assert.equal(changed.calls.some(c => c.method === 'PATCH'), false);
});
test('三类相册引用及重复引用删除准确，不删除同前缀的其他图片', () => {
    const env = setup();
    env.context.body = '说明 assets/a.jpg\n![一](assets/a.jpg)\n<img src="assets/a.jpg" width="200">\n![二](assets/a.jpg2)';
    assert.equal(env.run('removeGalleryImage(body,"assets/a.jpg")'), '说明 assets/a.jpg\n\n\n![二](assets/a.jpg2)');
    env.context.body = 'https://github.com/user-attachments/assets/abc\n![二](assets/b.jpg)';
    assert.equal(env.run('removeGalleryImage(body,"https://github.com/user-attachments/assets/abc")'), '\n![二](assets/b.jpg)');
});
test("认证常量与状态在说说加载前就绪，已登录博主首批与首页条目立即可见删除按钮", () => {
    const loadMomentsIndex = script.indexOf("loadMoments();");
    const authKeyIndex = script.indexOf("const MOMENT_AUTH_TOKEN_KEY");
    const isOwnerIndex = script.indexOf("function isSiteOwner");
    assert.ok(authKeyIndex > 0 && authKeyIndex < loadMomentsIndex, "MOMENT_AUTH_TOKEN_KEY 必须在 loadMoments 之前定义");
    assert.ok(isOwnerIndex > 0 && isOwnerIndex < loadMomentsIndex, "isSiteOwner 必须在 loadMoments 之前定义");
});
