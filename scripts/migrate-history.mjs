#!/usr/bin/env node
/**
 * 将 Obsidian 历史文章迁移为本站 _posts 格式。
 * 源目录只读；仅把文章副本和文章实际引用的本地图片写入当前仓库。
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VAULT = '/Users/mfcheer/Library/Mobile Documents/iCloud~md~obsidian/Documents/mfcheer';
const SOURCES = [
  { name: 'csdn', dir: path.join(VAULT, '4.Blog/1 csdn'), fallbackDate: '2015-01-01', tag: 'CSDN备份' },
  { name: 'article', dir: path.join(VAULT, '4.Blog/2 article'), fallbackDate: '2018-01-01', tag: '历史文章' }
];
const POSTS = path.join(ROOT, '_posts');
const IMAGES = path.join(ROOT, 'assets/images/legacy');

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const quote = (s) => `'${String(s).replaceAll("'", "''")}'`;
const titleFrom = (file, body) => {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || path.basename(file, '.md');
};
const sourceFiles = SOURCES.flatMap((source) => walk(source.dir).filter((file) => file.endsWith('.md')).map((file) => ({ ...source, file })));
const attachmentFiles = walk(path.join(VAULT, '附件'));
const byBase = new Map(attachmentFiles.map((file) => [path.basename(file), file]));
const copied = new Set();
let missing = 0;

fs.mkdirSync(POSTS, { recursive: true });
fs.mkdirSync(IMAGES, { recursive: true });

for (const item of sourceFiles) {
  const raw = fs.readFileSync(item.file, 'utf8').replace(/^\uFEFF/, '');
  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const body = fm ? raw.slice(fm[0].length) : raw;
  const title = fm?.[1].match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '') || (item.name === 'article' && path.relative(item.dir, item.file) === '旅行.md' ? '旅行' : titleFrom(item.file, body));
  const date = fm?.[1].match(/^date:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, '') || item.fallbackDate;
  const relative = path.relative(item.dir, item.file);
  const slug = `legacy-${item.name}-${hash(relative)}`;
  const fileDate = /^\d{4}-\d{2}-\d{2}/.test(date) ? date.slice(0, 10) : item.fallbackDate;

  let converted = body;
  converted = converted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (all, alt, target) => {
    const trimmed = target.trim();
    const url = trimmed.split(/\s+/)[0];
    if (/^(?:https?:|data:|\/|#)/.test(url)) return all;
    const sourceImage = path.resolve(path.dirname(item.file), url);
    if (!fs.existsSync(sourceImage)) { missing += 1; return all; }
    const imageRelative = path.relative(path.join(VAULT, '附件'), sourceImage);
    const destination = path.join(IMAGES, imageRelative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!copied.has(destination)) { fs.copyFileSync(sourceImage, destination); copied.add(destination); }
    const publicPath = `/assets/images/legacy/${imageRelative.split(path.sep).map(encodeURIComponent).join('/')}`;
    return `![${alt}](${publicPath})`;
  });
  converted = converted.replace(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g, (all, name) => {
    const sourceImage = byBase.get(name.trim());
    if (!sourceImage) { missing += 1; return all; }
    const imageRelative = path.relative(path.join(VAULT, '附件'), sourceImage);
    const destination = path.join(IMAGES, imageRelative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    if (!copied.has(destination)) { fs.copyFileSync(sourceImage, destination); copied.add(destination); }
    return `![](/assets/images/legacy/${imageRelative.split(path.sep).map(encodeURIComponent).join('/')})`;
  });

  const front = fm
    ? fm[1].replace(/\nslug:\s*.*$/m, '').trimEnd() + `\nslug: ${slug}\n`
    : `title: ${quote(title)}\ndate: '${fileDate}'\ntags: [${item.tag}]\nsummary: ${quote(`历史迁移文章：${title}`)}\nslug: ${slug}\n`;
  const output = `---\n${front}---\n\n${converted.replace(/^\s+/, '')}`;
  fs.writeFileSync(path.join(POSTS, `${fileDate}-${slug}.md`), output);
}

console.log(`迁移文章：${sourceFiles.length} 篇`);
console.log(`复制图片：${copied.size} 个`);
if (missing) console.log(`未找到的图片引用：${missing} 处（保留原引用）`);
