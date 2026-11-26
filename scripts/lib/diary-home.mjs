import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import MarkdownIt from 'markdown-it';

const { escapeHtml } = new MarkdownIt().utils;

export async function syncLatestDiary(root) {
    const homepage = path.join(root, 'index.html');
    const original = await fs.readFile(homepage, 'utf8');
    if (!original.includes('id="diaryEntryDate"')) return;

    const source = await fs.readFile(path.join(root, 'data/diary.json'), 'utf8');
    const [latest] = JSON.parse(source);
    if (!latest || !/^\d{4}-\d{2}-\d{2}$/.test(latest.date) ||
        !latest.dayOfWeek || !latest.punchline || !latest.content) {
        throw new Error('最新日记缺少日期、星期、金句或正文');
    }

    const version = createHash('sha256').update(source).digest('hex').slice(0, 12);
    const dateLabel = escapeHtml(`${latest.date.replace(/-/g, '.')} · ${latest.dayOfWeek}`);
    const rawFootnote = latest.footnote || '';
    const tags = Array.isArray(rawFootnote)
        ? rawFootnote
        : rawFootnote.split(/\s*·\s*/).map((tag) => tag.trim()).filter(Boolean);
    const stamps = tags.map((tag) => `                        <span class="diary-stamp">${escapeHtml(String(tag))}</span>`);
    const html = original
        .replace(/id="diaryEntryDate"[^>]*>[\s\S]*?<\/span>/,
            () => `id="diaryEntryDate" data-date="${latest.date}" data-history-version="${version}">${dateLabel}</span>`)
        .replace(/(id="diaryPunchline">)[\s\S]*?(<\/p>)/,
            (_, open, close) => open + escapeHtml(latest.punchline) + close)
        .replace(/(id="diaryContent">)[\s\S]*?(<\/p>)/,
            (_, open, close) => open + escapeHtml(latest.content) + close)
        .replace(/(id="diaryFootnote">)[\s\S]*?(<\/div>)/,
            (_, open, close) => [open, ...stamps, `                    ${close}`].join('\n'));

    if (html !== original) await fs.writeFile(homepage, html);
}
