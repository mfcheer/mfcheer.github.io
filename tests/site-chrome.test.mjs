import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncSiteChrome } from '../scripts/build-nav.mjs';

// 验证新列表页自动沿用，以及重复同步不会累积联系区或触发无意义重建。
test('共享联系区覆盖现有及新增列表页，保留详情页边界，重复构建稳定', (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'site-chrome-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const put = (file, data) => {
        fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        fs.writeFileSync(path.join(root, file), data);
    };
    for (const file of ['data/nav.json', 'templates/contact.html']) {
        put(file, fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));
    }
    const page = (body = '<section>列表</section>') => `<nav><ul class="nav-links"><li><a href="/#contact">联系</a></li></ul></nav>\n<main>${body}</main>\n        <footer class="footer">页脚</footer>`;
    const lists = ['index.html', 'templates/blog-list.html', 'moments/index.html', 'gallery/index.html', 'reading/index.html'];
    for (const file of lists) put(file, page());
    put('templates/post.html', page('<article>正文</article>'));
    put('privacy/index.html', '<main>隐私</main>');
    syncSiteChrome(root);
    for (const file of lists) {
        const html = fs.readFileSync(path.join(root, file), 'utf8');
        assert.equal((html.match(/id="contact"/g) || []).length, 1, file);
        assert.equal((html.match(/class="contact-icon"/g) || []).length, 6, file);
        assert.doesNotMatch(html, /id="xhsModal"/, file);
        assert.ok(html.includes('https://www.xiaohongshu.com/user/profile/583815306a6a6979390baf9a'), file);
        assert.ok(html.indexOf('id="contact"') < html.indexOf('</main>'));
        assert.doesNotMatch(html.match(/<ul class="nav-links">[\s\S]*?<\/ul>/)[0], /#contact/);
    }
    const post = fs.readFileSync(path.join(root, 'templates/post.html'), 'utf8');
    assert.doesNotMatch(post, /#contact|id="contact"|id="xhsModal"/);
    assert.equal(fs.readFileSync(path.join(root, 'privacy/index.html'), 'utf8'), '<main>隐私</main>');
    assert.deepEqual(syncSiteChrome(root), []);
});
