#!/usr/bin/env node
/**
 * 博客构建脚本：把 _posts/*.md 渲染为静态页面，并生成列表 / RSS / sitemap / 首页索引。
 *
 * 输入：_posts/*.md（front matter + Markdown）、templates/*.html
 * 输出：blog/<slug>/index.html、blog/index.html、atom.xml、sitemap.xml、data/blog-index.json
 *
 * 设计原则：
 * 1. 确定性输出 —— 同输入同输出，GitHub Actions 回写 main 时不产生无意义 diff；
 * 2. 不做客户端渲染 —— 全部构建期生成，保住 SEO / AI 检索；
 * 3. 样式与首页同源 —— 模板通过 {{CSS_VERSION}} / {{JS_VERSION}} 注入三同步版本号。
 *
 * 本地预览：npm install && npm run build
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import matter from 'gray-matter';
import { syncSiteChrome } from './build-nav.mjs';
import { buildToc } from './lib/post-toc.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
syncSiteChrome(ROOT);
const SITE = 'https://mfcheer.github.io';
const POSTS_DIR = path.join(ROOT, '_posts');
const TPL_DIR = path.join(ROOT, 'templates');

// 与 index.html / sw.js 的「三同步」版本号保持一处维护（规则见 README）
import anchor from 'markdown-it-anchor';
import taskLists from 'markdown-it-task-lists';

const VERSIONS = { css: '1.3.45', js: '1.3.43' };

// ---------- 工具 ----------
const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderTemplate(tpl, vars) {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) =>
        Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : ''
    );
}

function countWords(content) {
    const noCode = content.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
    const cjk = (noCode.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    const latin = (noCode.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
    return cjk + latin;
}

/**
 * 解析文章日期。约定（README 有载）：
 * - front matter 的 date 建议用引号字符串，如 date: '2026-11-07 21:00'，按北京时间 (+08:00) 解析；
 * - 缺省时回退到文件名日期前缀（2026-11-07-slug.md）。
 */
function parseDate(value, filename) {
    const fromFile = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const fromStr = (s) => {
        const t = String(s).trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
        return t
            ? { date: new Date(`${t[1]}-${t[2]}-${t[3]}T${t[4] || '00'}:${t[5] || '00'}:00+08:00`), hasTime: Boolean(t[4]) }
            : null;
    };
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = fromStr(value);
        if (parsed) return parsed;
    }
    // gray-matter 会把 YAML 时间戳解析成 Date（无时区按 UTC 处理），取其 UTC 分量即书写时的墙钟时间
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        const pad = (n) => String(n).padStart(2, '0');
        const t = fromStr(
            `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())} ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`
        );
        if (t) return t;
    }
    if (fromFile) return { date: new Date(`${fromFile[1]}-${fromFile[2]}-${fromFile[3]}T00:00:00+08:00`), hasTime: false };
    throw new Error(`无法解析日期：${filename}（请在 front matter 里写 date: 'YYYY-MM-DD HH:mm'）`);
}

function deriveSummary(html) {
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > 96 ? `${text.slice(0, 96)}…` : text;
}

// ---------- Markdown 渲染器 ----------
const md = new MarkdownIt({
    html: false, // 正文禁用原始 HTML，天然免疫 XSS
    linkify: true,
    breaks: false,
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre><code class="hljs language-${esc(lang)}">${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } catch (e) {
                /* fallthrough */
            }
        }
        return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`;
    }
});

// 标题锚点：为正文标题生成 id，TOC 与文内跳链依赖
md.use(anchor, {
    slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, '-'),
    permalink: false
});

// 任务列表：- [ ] / - [x] 渲染为复选框
md.use(taskLists, { label: false });

// Obsidian 兼容预处理（在 Markdown 渲染前对原文做转换）：
// 1. ![[图片.png]] → ![](/assets/images/图片.png)
// 2. 相对路径图片 ![alt](image/xxx.png / ./assets/images/xxx.png ...) → 站点绝对路径 /assets/images/xxx.png
// 3. 笔记互链 [[xxx]] → 纯文本（站点没有同名页面，降级避免坏链）
function normalizeObsidian(src) {
    return src
        .replace(/!\[\[([^\]]+)\]\]/g, (_, name) => `![](/assets/images/${name.trim().replace(/ /g, '%20')})`)
        .replace(/!\[([^\]]*)\]\(\s*(?!https?:|\/|data:)([^)\s]+)\s*\)/g, (_, alt, srcPath) => {
            const clean = srcPath
                .replace(/^\.\//, '')
                .replace(/^(?:image|images|assets\/images)\//, '')
                .replace(/ /g, '%20');
            return `![${alt}](/assets/images/${clean})`;
        })
        .replace(/(?<!!)\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, '$1')
        .replace(/^[ \t]*<!--\s*more\s*-->[ \t]*\r?\n?/gim, "")
        .replace(/<!--\s*more\s*-->/gi, "");
}

// KaTeX 按需注入片段：仅当文中检测到 $ / $$ 公式时插入 <head>
const KATEX_HEAD = [
    '    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">',
    '    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>',
    `    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.querySelector('.post-body'),{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});"></script>`
].join('\n');

// 图片统一懒加载 + 不带 referer
const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('referrerpolicy', 'no-referrer');
    return defaultImage(tokens, idx, options, env, self);
};
// 外链新窗口打开
const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet('href') || '';
    if (/^https?:\/\//.test(href)) {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noreferrer');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
};

// ---------- 读取文章 ----------
const files = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('.')).sort()
    : [];

const posts = [];
const seenSlugs = new Set();

for (const file of files) {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    if (data.draft) {
        console.log(`  跳过草稿：${file}`);
        continue;
    }
    const title = String(data.title || '').trim();
    if (!title) throw new Error(`${file} 缺少 front matter title`);
    const slug = String(data.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '')).trim();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error(`${file} 的 slug 不合法：${slug}（仅限小写字母/数字/连字符）`);
    if (seenSlugs.has(slug)) throw new Error(`slug 重复：${slug}`);
    seenSlugs.add(slug);

    const { date, hasTime } = parseDate(data.date, file);
    const normalized = normalizeObsidian(content);
    const html = md.render(normalized);
    const tocHtml = buildToc(html);
    const hasMath = /\$\$[\s\S]+?\$\$|\$[^\s$][^$\n]*?\$/.test(normalized);
    const words = countWords(normalized);
    const tags = Array.isArray(data.tags) ? data.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    // 统一按东八区格式化：本地与 GitHub Actions（UTC）构建产物保持一致
    const cnParts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const part = (type) => cnParts.find((p) => p.type === type).value;
    const y = Number(part('year'));
    const dateText = `${y}/${part('month')}/${part('day')}${hasTime ? ` ${part('hour')}:${part('minute')}` : ''}`;

    posts.push({
        title,
        slug,
        tags,
        summary: data.summary ? String(data.summary).trim() : deriveSummary(html),
        html,
        tocHtml,
        hasMath,
        words,
        minutes: Math.max(1, Math.round(words / 400)),
        date,
        dateText,
        year: y,
        atomDate: date.toISOString()
    });
}

posts.sort((a, b) => b.date - a.date);
const today = new Date().toISOString().slice(0, 10);
const latest = posts.length ? posts[0].atomDate : new Date().toISOString();

// 删除已下架/改名/转草稿的文章，避免合并发布时残留旧页面。
const activeSlugs = new Set(posts.map((p) => p.slug));
fs.mkdirSync(path.join(ROOT, 'blog'), { recursive: true });
for (const entry of fs.readdirSync(path.join(ROOT, 'blog'), { withFileTypes: true })) {
    if (entry.isDirectory() && !activeSlugs.has(entry.name)) {
        fs.rmSync(path.join(ROOT, 'blog', entry.name), { recursive: true });
    }
}

// ---------- 文章页 ----------
const postTpl = fs.readFileSync(path.join(TPL_DIR, 'post.html'), 'utf8');
for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const prev = posts[i + 1]; // 早一篇（上一篇）
    const next = posts[i - 1]; // 晚一篇（下一篇）

    const prevHtml = prev
        ? `<a class="post-nav-card post-nav-prev" href="/blog/${prev.slug}/">
              <span class="post-nav-sub">← 上一篇</span>
              <span class="post-nav-title">${esc(prev.title)}</span>
          </a>`
        : `<div class="post-nav-card post-nav-empty" aria-hidden="true"></div>`;

    const nextHtml = next
        ? `<a class="post-nav-card post-nav-next" href="/blog/${next.slug}/">
              <span class="post-nav-sub">下一篇 →</span>
              <span class="post-nav-title">${esc(next.title)}</span>
          </a>`
        : `<div class="post-nav-card post-nav-empty" aria-hidden="true"></div>`;

    const postNavHtml = (prev || next)
        ? `<nav class="post-nav" aria-label="文章翻页导航">
              ${prevHtml}
              ${nextHtml}
          </nav>`
        : '';

    const pageUrl = `${SITE}/blog/${p.slug}/`;
    const ogImage = `${SITE}/assets/share-card.png`;
    const jsonld = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.summary,
        datePublished: p.atomDate,
        dateModified: p.atomDate,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        image: ogImage,
        keywords: p.tags.join(','),
        author: { '@type': 'Person', name: 'mfcheer', url: `${SITE}/` }
    });
    const tagsHtml = p.tags.length
        ? `<div class="post-tags">${p.tags.map((t) => `<a class="post-tag" href="/blog/?tag=${encodeURIComponent(t)}" title="查看「${esc(t)}」标签的所有文章">#${esc(t)}</a>`).join('')}</div>`
        : '';
    const vars = {
        TITLE: esc(p.title),
        DESCRIPTION: esc(p.summary),
        PAGE_URL: pageUrl,
        JSONLD: jsonld,
        OG_IMAGE: ogImage,
        ATOM_DATE: p.atomDate,
        DATE_TEXT: p.dateText,
        WORD_COUNT: String(p.words),
        READING_MINUTES: String(p.minutes),
        TAGS_HTML: tagsHtml,
        TOC_HTML: p.tocHtml,
        POST_NAV_HTML: postNavHtml,
        KATEX: p.hasMath ? KATEX_HEAD : '',
        CONTENT: p.html,
        CSS_VERSION: VERSIONS.css,
        JS_VERSION: VERSIONS.js
    };
    const dir = path.join(ROOT, 'blog', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderTemplate(postTpl, vars));
}

// ---------- 列表页 ----------
const listTpl = fs.readFileSync(path.join(TPL_DIR, 'blog-list.html'), 'utf8');
const years = [...new Set(posts.map((p) => p.year))];
const listHtml = years
    .map((year) => {
        const group = posts.filter((p) => p.year === year);
        return [
            `<div class="post-year" id="year-${year}">${year}</div>`,
            `<div class="post-group">`,
            ...group.map(
                (p) => [
                    `<a class="post-item" href="/blog/${p.slug}/" data-tags="${esc(p.tags.join(','))}">`,
                    `  <span class="post-item-main">`,
                    `    <span class="post-item-title">${esc(p.title)}</span>`,
                    `    <span class="post-item-summary">${esc(p.summary)}</span>`,
                    `    <span class="post-item-meta">${p.dateText} · ${p.tags.length ? p.tags.map((t) => `<span class="post-item-tag" data-tag="${esc(t)}">${esc(t)}</span>`).join(' / ') : '随笔'} · 约 ${p.minutes} 分钟</span>`,
                    `  </span>`,
                    `  <span class="post-item-arrow" aria-hidden="true">→</span>`,
                    `</a>`
                ].join('\n')
            ),
            `</div>`
        ].join('\n');
    })
    .join('\n');

fs.writeFileSync(
    path.join(ROOT, 'blog', 'index.html'),
    renderTemplate(listTpl, {
        POST_COUNT: String(posts.length),
        YEAR_LINKS: years.map((year) => `<a href="#year-${year}">${year}</a>`).join('\n'),
        POST_LIST_HTML: listHtml || '<p class="blog-empty">还没有文章，去 _posts/ 里写第一篇吧。</p>',
        CSS_VERSION: VERSIONS.css,
        JS_VERSION: VERSIONS.js
    })
);

// ---------- 首页索引（供首页「最近文章」渲染） ----------
fs.writeFileSync(
    path.join(ROOT, 'data', 'blog-index.json'),
    JSON.stringify(
        {
            updatedAt: today,
            count: posts.length,
            posts: posts.map((p) => ({
                title: p.title,
                url: `/blog/${p.slug}/`,
                dateText: p.dateText,
                year: p.year,
                tags: p.tags,
                summary: p.summary,
                readingMinutes: p.minutes,
                wordCount: p.words
            }))
        },
        null,
        2
    ) + '\n'
);

// ---------- sitemap（脚本接管重建：首页 + 列表页 + 文章页） ----------
const sitemapUrls = [
    { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
    { loc: `${SITE}/blog/`, lastmod: today, priority: '0.9' },
    { loc: `${SITE}/moments/`, lastmod: today, priority: '0.9' },
    ...posts.map((p) => ({ loc: `${SITE}/blog/${p.slug}/`, lastmod: p.atomDate.slice(0, 10), priority: '0.8' }))
];
fs.writeFileSync(
    path.join(ROOT, 'sitemap.xml'),
    [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapUrls.map(
            (u) =>
                [
                    '  <url>',
                    `    <loc>${u.loc}</loc>`,
                    `    <lastmod>${u.lastmod}</lastmod>`,
                    '    <changefreq>weekly</changefreq>',
                    `    <priority>${u.priority}</priority>`,
                    '  </url>'
                ].join('\n')
        ),
        '</urlset>',
        ''
    ].join('\n')
);

// ---------- Atom RSS ----------
const feedEntries = posts
    .map(
        (p) =>
            [
                '  <entry>',
                `    <title>${esc(p.title)}</title>`,
                `    <link href="${SITE}/blog/${p.slug}/" rel="alternate"/>`,
                `    <id>${SITE}/blog/${p.slug}/</id>`,
                `    <published>${p.atomDate}</published>`,
                `    <updated>${p.atomDate}</updated>`,
                `    <summary>${esc(p.summary)}</summary>`,
                `    <content type="html">${esc(p.html)}</content>`,
                '  </entry>'
            ].join('\n')
    )
    .join('\n');
fs.writeFileSync(
    path.join(ROOT, 'atom.xml'),
    [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        `  <title>mfcheer 的文章</title>`,
        `  <subtitle>后端架构 · 基础组件 · 随笔</subtitle>`,
        `  <link href="${SITE}/"/>`,
        `  <link href="${SITE}/atom.xml" rel="self"/>`,
        `  <id>${SITE}/</id>`,
        `  <updated>${latest}</updated>`,
        `  <author><name>mfcheer</name></author>`,
        feedEntries,
        '</feed>',
        ''
    ].join('\n')
);

console.log(`博客构建完成：${posts.length} 篇文章（${files.length - posts.length} 篇草稿跳过）`);
