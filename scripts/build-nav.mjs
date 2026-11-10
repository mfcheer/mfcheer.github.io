#!/usr/bin/env node
// 同步全站导航与列表页联系区。新增带 nav-links 的列表页自动沿用。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTACT = /[ \t]*<section class="glass card-contact" id="contact">[\s\S]*?<\/section>\s*/;
const MODAL = /[ \t]*(?:<!-- 小红书名片弹层 -->\s*)?<div class="modal-backdrop" id="xhsModal"[\s\S]*?<\/div>\s*<\/div>\s*/;

export function syncSiteChrome(root = ROOT) {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'data/nav.json'), 'utf8'));
    if (!Array.isArray(config.items) || !config.items.length) throw new Error('nav.json 缺少 items 配置');
    const contact = fs.readFileSync(path.join(root, 'templates/contact.html'), 'utf8').trimEnd();
    const targets = new Map([
        ['index.html', '/'],
        ['templates/blog-list.html', '/blog/'],
        ['templates/post.html', null]
    ]);
    // 自动发现列表页，不遍历文章详情或依赖目录。
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || ['node_modules', 'templates', 'blog', '_site'].includes(entry.name)) continue;
        const file = `${entry.name}/index.html`;
        if (fs.existsSync(path.join(root, file))) targets.set(file, `/${entry.name}/`);
    }
    // 也支持导航中新增加的多级列表路径。
    for (const item of config.items) {
        if (/^\/(?:[\w-]+\/)+$/.test(item.sub) && item.sub !== '/blog/') {
            const file = `${item.sub.slice(1)}index.html`;
            if (fs.existsSync(path.join(root, file))) targets.set(file, item.sub);
        }
    }
    const changed = [];
    for (const [file, pagePath] of targets) {
        const abs = path.join(root, file);
        const original = fs.readFileSync(abs, 'utf8');
        if (!original.includes('<ul class="nav-links">')) continue;
        const items = config.items.map((item) => {
            const href = pagePath === '/' ? item.home : item.sub;
            const current = pagePath && href === pagePath ? ' aria-current="page"' : '';
            return `                        <li><a href="${href}"${current}>${item.label}</a></li>`;
        });
        let html = original.replace(/<ul class="nav-links">[\s\S]*?<\/ul>/,
            `<ul class="nav-links">\n${items.join('\n')}\n                    </ul>`);
        // 详情页只同步导航；首页及所有列表页在 main 末尾统一放置联系区。
        if (pagePath !== null && !html.includes('<article')) {
            html = html.replace(CONTACT, '').replace(MODAL, '');
            if (!html.includes('</main>')) throw new Error(`${file} 缺少 main`);
            html = html.replace(/\s*<\/main>/, `\n\n${contact}\n        </main>`);
        }
        if (html !== original) {
            fs.writeFileSync(abs, html);
            changed.push(file);
        }
    }
    return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    console.log(`导航与联系区同步：${syncSiteChrome().join(', ') || '无变化'}`);
}
