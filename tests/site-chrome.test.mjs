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

test('全站导航栏行为一致：首页与各子页面点击「说说」均指向 /moments/ 专页', () => {
    const navJson = JSON.parse(fs.readFileSync(new URL('../data/nav.json', import.meta.url), 'utf8'));
    const momentsItem = navJson.items.find(i => i.label === '说说');
    assert.equal(momentsItem.home, '/moments/', '首页说说导航必须指向 /moments/');
    assert.equal(momentsItem.sub, '/moments/', '子页面说说导航必须指向 /moments/');

    const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    assert.match(indexHtml, /<a href="\/moments\/">说说<\/a>/, '首页导航必须包含指向 /moments/ 的说说链接');

    const momentsHtml = fs.readFileSync(new URL('../moments/index.html', import.meta.url), 'utf8');
    assert.match(momentsHtml, /<a href="\/moments\/" aria-current="page">说说<\/a>/, '说说专页导航必须高亮当前页');

    const galleryHtml = fs.readFileSync(new URL('../gallery/index.html', import.meta.url), 'utf8');
    assert.match(galleryHtml, /<a href="\/moments\/">说说<\/a>/, '相册专页说说导航必须指向 /moments/');

    const blogHtml = fs.readFileSync(new URL('../blog/index.html', import.meta.url), 'utf8');
    assert.match(blogHtml, /<a href="\/moments\/">说说<\/a>/, '博客专页说说导航必须指向 /moments/');
});
