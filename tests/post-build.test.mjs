import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false });

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
        .replace(/^[ \t]*<!--\s*more\s*-->[ \t]*\r?\n?/gim, '')
        .replace(/<!--\s*more\s*-->/gi, '');
}

test('normalizeObsidian 彻底剥离 <!--more--> 标记，不会转义为 &lt;!--more--&gt;', () => {
    const markdown = '段落一\n\n<!--more-->\n\n段落二';
    const normalized = normalizeObsidian(markdown);
    const html = md.render(normalized);
    assert.doesNotMatch(html, /<!--more-->|&lt;!--more--&gt;/);
    assert.match(html, /<p>段落一<\/p>\s*<p>段落二<\/p>/);
});

test('文章标签 Tag 生成链接跳转与列表 data-tags', () => {
    const tag = 'MySQL';
    const tagHtml = `<a class="post-tag" href="/blog/?tag=${encodeURIComponent(tag)}" title="查看「${tag}」标签的所有文章">#${tag}</a>`;
    assert.match(tagHtml, /href="\/blog\/\?tag=MySQL"/);
    assert.match(tagHtml, /#MySQL<\/a>/);
});
