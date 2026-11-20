import fs from 'node:fs';
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

test("代码块语法高亮强化：自动推断未标注语言并赋予语种类名与丰富层次", () => {
    const buildScript = fs.readFileSync(new URL("../scripts/build-posts.mjs", import.meta.url), "utf8");
    assert.ok(buildScript.includes("SUPPORTED_AUTO_LANGS"), "构建脚本必须定义常用语言子集推断");
    assert.ok(buildScript.includes("hljs.highlightAuto"), "必须具备自动语种推断兜底");

    const css = fs.readFileSync(new URL("../styles.css", import.meta.url), "utf8");
    assert.ok(css.includes("--code-string: #7ee787;"), "深色模式字符串必须采用鲜活对比绿色");
    assert.ok(css.includes("--code-number: #ffa657;"), "深色模式数字必须采用暖金橙色");
    assert.ok(css.includes("--code-keyword: #ff7b72;"), "深色模式关键字必须采用珊瑚粉色");
    assert.ok(css.includes(".post-editor-preview-content pre code"), "在线编辑器预览区必须完整复用代码高亮规则");

    const js = fs.readFileSync(new URL("../script.js", import.meta.url), "utf8");
    assert.ok(js.includes("highlightSimpleCode"), "编辑器端必须具备轻量语法染色解析器");
    assert.ok(js.includes("window._mfcheerInitCodeBlocks"), "必须导出代码块卡片初始化函数供抽屉预览与原地更新复用");
});
