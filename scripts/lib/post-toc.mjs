import MarkdownIt from 'markdown-it';

const { escapeHtml, unescapeAll } = new MarkdownIt().utils;

// 收录正文 H1–H3；H1/H2 至少两项时展示，沿用已有标题锚点。
export function buildToc(html) {
    const items = Array.from(html.matchAll(/<h([123]) id="([^"]*?)"[^>]*>([\s\S]*?)<\/h\1>/g), (m) => ({
        level: Number(m[1]),
        id: unescapeAll(m[2]),
        text: unescapeAll(m[3].replace(/<[^>]+>/g, ''))
    }));
    if (items.filter((item) => item.level <= 2).length < 2) return '';
    const baseLevel = Math.min(...items.map((item) => item.level));
    const lis = items.map((item) => {
        const depth = item.level - baseLevel;
        const classes = depth > 1 ? ' class="toc-sub toc-sub-deep"' : depth > 0 ? ' class="toc-sub"' : '';
        return `<li${classes}><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>`;
    }).join('');
    return `<nav class="toc" aria-label="文章目录"><div class="toc-title">目录</div><ul>${lis}</ul></nav>`;
}
