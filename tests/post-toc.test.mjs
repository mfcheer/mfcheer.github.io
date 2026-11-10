import test from 'node:test';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import { buildToc } from '../scripts/lib/post-toc.mjs';

const md = new MarkdownIt().use(anchor, { permalink: false, slugify: (s) => s.trim().toLowerCase().replace(/\s+/g, '-') });
const toc = (source) => buildToc(md.render(source));

test('纯 H1 历史文章可生成目录，H1/H2/H3 保持层级，H2/H3 原有缩进不变', () => {
    assert.match(toc('# 开始\n# 结束'), /href="#开始"/);
    const mixed = toc('# 概览\n## 章节\n### 细节\n# 总结');
    assert.match(mixed, /<li><a href="#概览">/);
    assert.match(mixed, /<li class="toc-sub"><a href="#章节">/);
    assert.match(mixed, /<li class="toc-sub toc-sub-deep"><a href="#细节">/);
    const old = toc('## 开始\n### 细节\n## 结束');
    assert.match(old, /<li><a href="#开始">/);
    assert.match(old, /<li class="toc-sub"><a href="#细节">/);
});

test('短文不展示无用目录，代码块内伪标题不会收录', () => {
    for (const source of ['', '# 单节', '### A\n### B', '## 单节\n### 细节', '# 单节\n```md\n# 伪标题\n```']) {
        assert.equal(toc(source), '', source);
    }
});

test('重复标题锚点唯一，格式化文字及实体正常显示且不会注入 HTML', () => {
    const source = '# 重复\n# 重复\n## **A & B** `<tag>`';
    const html = md.render(source);
    const result = buildToc(html);
    const ids = [...html.matchAll(/<h[123] id="([^"]+)"/g)].map((m) => m[1]);
    const links = [...result.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, 3);
    assert.deepEqual(links, ids);
    assert.match(result, />A &amp; B &lt;tag&gt;<\/a>/);
    assert.doesNotMatch(result, /&amp;amp;|<tag>/);
});
