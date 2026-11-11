import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function getBeijingDateInfo(now = new Date()) {
    const parts = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' }).formatToParts(now);
    const value = (type) => parts.find((p) => p.type === type)?.value;
    return { dateStr: `${value('year')}-${value('month')}-${value('day')}`, dayOfWeek: value('weekday') };
}
function validDate(date) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
}
export function collect(date = getBeijingDateInfo().dateStr, root = ROOT) {
    if (!validDate(date)) throw new Error('日期无效');
    const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    const commits = execFileSync('git', ['log', '--no-merges', `--since=${date}T00:00:00+08:00`, `--until=${date}T23:59:59+08:00`, '--format=%H %cI %s'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean).filter((line) => !/ (build:|chore\(gallery\): 自动同步|chore\(moments\): 自动同步)/.test(line));
    const moments = read('data/moments.json').filter((item) => item.date?.startsWith(date.replaceAll('-', '/')));
    const photos = (read('data/gallery.json').albums || []).flatMap((album) => album.photos || []).filter((photo) => photo.date?.startsWith(date));
    const blog = read('data/blog-index.json');
    const posts = (Array.isArray(blog) ? blog : blog.posts || []).filter((post) => post.date?.startsWith(date));
    return { date, commits, moments, photos, posts, externalSources: '请由 AI 直接核对豆瓣、微博和小红书公开页面，保留状态与日期；本站媒体缓存不能替代实时来源。' };
}
export function validateEntry(entry) {
    if (!entry || !validDate(entry.date)) throw new Error('日期无效');
    if (typeof entry.title !== 'string' || !entry.title.trim() || entry.title.length > 30) throw new Error('需要 30 字内的短标题');
    if (typeof entry.mood?.label !== 'string' || !entry.mood.label.trim() || entry.mood.label.length > 12) throw new Error('需要自然心绪词');
    if ('score' in entry.mood) throw new Error('不再使用情绪分数');
    if (typeof entry.content !== 'string') throw new Error('缺少 AI 本次撰写的正文');
    const length = Array.from(entry.content.replace(/\s/g, '')).length;
    const paragraphs = entry.content.trim().split(/\n\s*\n/);
    if (length < 180 || length > 250 || paragraphs.length < 2 || paragraphs.length > 3) throw new Error(`正文需为 180～250 字、两三段，当前 ${length} 字 / ${paragraphs.length} 段`);
    if (!Number.isFinite(Date.parse(entry.generatedAt))) throw new Error('缺少真实生成时间');
    if (!Array.isArray(entry.sources) || !entry.sources.length || !entry.sources.some((source) => source.status === 'read')) throw new Error('需要至少一项可核对依据');
    for (const source of entry.sources) {
        if (!source.label || !source.detail || !['read', 'limited', 'unavailable'].includes(source.status)) throw new Error('来源说明不完整');
        if (source.url && (!source.url.startsWith('https://') || new URL(source.url).username || new URL(source.url).password)) throw new Error('来源必须为无凭据的公开 HTTPS 地址');
    }
    // 仅保存公开格式，过期天气、统计和模板字段不再流入页面。
    return { date: entry.date, title: entry.title.trim(), mood: { label: entry.mood.label.trim() }, content: entry.content.trim(), sources: entry.sources.map(({ label, url, status, detail }) => ({ label, ...(url ? { url } : {}), status, detail })), generatedAt: entry.generatedAt };
}
export function upsertEntries(existing, incoming) {
    const validated = incoming.map(validateEntry);
    if (new Set(validated.map((item) => item.date)).size !== validated.length) throw new Error('输入日期重复');
    const map = new Map(existing.map((item) => [item.date, item]));
    for (const item of validated) map.set(item.date, item);
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}
export function run({ input, diaryPath = path.join(ROOT, 'data/diary.json') } = {}) {
    if (!input) throw new Error('请先根据已核实素材写作，使用 --input 文件.json；不生成模板正文');
    const incoming = Array.isArray(input) ? input : [input];
    const existing = fs.existsSync(diaryPath) ? JSON.parse(fs.readFileSync(diaryPath, 'utf8')) : [];
    const output = upsertEntries(existing, incoming);
    const temp = `${diaryPath}.${process.pid}.tmp`;
    try { fs.writeFileSync(temp, JSON.stringify(output, null, 2) + '\n'); fs.renameSync(temp, diaryPath); }
    finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
    return output;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const args = process.argv.slice(2);
    if (args[0] === 'collect') console.log(JSON.stringify(collect(args[1]), null, 2));
    else if (args[0] === '--input' && args[1]) {
        const input = JSON.parse(fs.readFileSync(args[1], 'utf8'));
        run({ input }); console.log('AI 手记已校验并按日期覆盖。');
    } else { console.error('用法：node scripts/generate-daily-diary.mjs collect [YYYY-MM-DD] 或 --input 文件.json'); process.exitCode = 1; }
}
