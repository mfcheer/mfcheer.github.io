#!/usr/bin/env node
/**
 * build-nav.mjs — 从 data/nav.json（单一配置源）同步导航到所有页面
 *
 * 用法：node scripts/build-nav.mjs
 *
 * 同步目标：
 *   - index.html            （主页，锚点用 #section 形式）
 *   - moments/index.html    （子页，锚点用 /#section 形式）
 *   - gallery/index.html
 *   - templates/blog-list.html
 *   - templates/post.html
 *
 * 说明：
 *   - 每个导航项配置 home（主页用）与 sub（子页用）两个链接形态
 *   - 子页中若某项的 sub 与该页面自身路径一致，自动加 aria-current="page"
 *   - 只替换 <ul class="nav-links"> … </ul> 之间的 <li>，其余结构不动
 *   - 博客模板更新后需再运行 scripts/build-posts.mjs 重新生成博客页
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const NAV_FILE = path.join(ROOT, 'data/nav.json');

const TARGETS = [
    { file: 'index.html', pagePath: '/' },
    { file: 'moments/index.html', pagePath: '/moments/' },
    { file: 'gallery/index.html', pagePath: '/gallery/' },
    { file: 'templates/blog-list.html', pagePath: '/blog/' },
    { file: 'templates/post.html', pagePath: null } // 文章详情页路径不定，不做 current 标记
];

function renderItem(item, pagePath) {
    const isHome = pagePath === '/';
    let href = isHome ? item.home : item.sub;
    const current = pagePath && href === pagePath ? ' aria-current="page"' : '';
    return `                        <li><a href="${href}"${current}>${item.label}</a></li>`;
}

function syncNav(config, target) {
    const abs = path.join(ROOT, target.file);
    let html = fs.readFileSync(abs, 'utf8');
    const openTag = '<ul class="nav-links">';
    const closeTag = '</ul>';
    const start = html.indexOf(openTag);
    if (start === -1) {
        console.warn(`[Skip] ${target.file}: 未找到 nav-links`);
        return false;
    }
    const bodyStart = start + openTag.length;
    const end = html.indexOf(closeTag, bodyStart);
    if (end === -1) {
        console.warn(`[Skip] ${target.file}: nav-links 结构异常`);
        return false;
    }
    // 保留闭合标签前的缩进
    const indentMatch = html.slice(0, bodyStart).match(/\n([ \t]*)<li>/);
    if (indentMatch) {
        // 统一缩进为文件既有风格
    }
    const items = config.items.map((it) => renderItem(it, target.pagePath));
    const closingIndent = html.slice(bodyStart, end).match(/\n([ \t]*)<\/li>\s*$/) || ['', '                        '];
    const newBody = '\n' + items.join('\n') + '\n' + (closingIndent[1] || '                        ');
    const before = html.slice(bodyStart, end);
    if (before === newBody) {
        console.log(`[No change] ${target.file}`);
        return false;
    }
    html = html.slice(0, bodyStart) + newBody + html.slice(end);
    fs.writeFileSync(abs, html);
    console.log(`[Synced] ${target.file} (${config.items.length} 项)`);
    return true;
}

const config = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));
if (!Array.isArray(config.items) || config.items.length === 0) {
    console.error('nav.json 缺少 items 配置');
    process.exit(1);
}

let changed = 0;
for (const t of TARGETS) {
    if (fs.existsSync(path.join(ROOT, t.file)) && syncNav(config, t)) changed++;
}
console.log(`导航同步完成：${changed}/${TARGETS.length} 个文件有更新`);
