import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collect, getBeijingDateInfo, upsertEntries, validateEntry, run } from '../scripts/generate-daily-diary.mjs';
const entries = JSON.parse(fs.readFileSync(new URL('../data/diary.json', import.meta.url)));

test('手记完整校验、日期唯一降序，旧模板字段已清除', () => {
    entries.forEach((entry) => {
        assert.deepEqual(validateEntry(entry), entry);
        for (const key of ['punchline', 'footnote', 'weather', 'note']) assert.equal(key in entry, false);
    });
    const dates = entries.map((entry) => entry.date);
    assert.equal(new Set(dates).size, dates.length);
    assert.deepEqual(dates, [...dates].sort().reverse());
});
test('北京时间跨日按中国日期采集，不读取站内豆瓣缓存', () => {
    assert.equal(getBeijingDateInfo(new Date('2026-11-10T16:01:00Z')).dateStr, '2026-11-11');
    const evidence = collect('2026-11-09');
    assert.ok(evidence.commits.some((line) => line.includes('a9eea069')));
    assert.ok(evidence.moments.length > 0);
    assert.equal(evidence.media, undefined);
    assert.throws(() => collect('2026-02-30'), /日期无效/);
});
test('同日内容确实覆盖，其他日期不丢失，重复输入被拒绝', () => {
    const entry = { ...entries[0], title: '新的观察' };
    const result = upsertEntries(entries, [entry]);
    assert.equal(result.length, entries.length);
    assert.equal(result[0].title, '新的观察');
    assert.deepEqual(result.slice(1), entries.slice(1));
    assert.throws(() => upsertEntries(entries, [entry, entry]), /日期重复/);
});
test('错误输入不会损坏既有手记，不传入本次 AI 正文不会落盘', () => {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'diary-test-'));
    const diaryPath = path.join(folder, 'diary.json');
    const original = JSON.stringify(entries);
    fs.writeFileSync(diaryPath, original);
    try {
        assert.throws(() => run({ diaryPath }), /请先/);
        for (const bad of [
            { ...entries[0], content: '预设短文' },
            { ...entries[0], mood: { label: '发热', score: 99 } },
            { ...entries[0], sources: [{ label: '假来源', status: 'read', detail: 'test', url: 'javascript:alert(1)' }] },
            { ...entries[0], generatedAt: 'invalid' },
            { ...entries[0], sources: [] }
        ]) {
            assert.throws(() => run({ diaryPath, input: [entries[1], bad] }));
            assert.equal(fs.readFileSync(diaryPath, 'utf8'), original);
        }
        run({ diaryPath, input: { ...entries[0], title: '已更新' } });
        assert.equal(JSON.parse(fs.readFileSync(diaryPath))[0].title, '已更新');
        assert.equal(fs.readdirSync(folder).length, 1);
    } finally { fs.rmSync(folder, { recursive: true, force: true }); }
});
