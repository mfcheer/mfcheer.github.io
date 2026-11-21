import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIARY_PATH = path.join(ROOT_DIR, 'data/diary.json');
export const PROMPT_VERSION = '2026-11-17';
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT_DIR, file), 'utf8'));

function assertDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error(`无效日期：${date}`);
  }
}

export function getBeijingDateInfo(now = new Date()) {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long'
  }).formatToParts(now);
  const value = (type) => parts.find((p) => p.type === type).value;
  return { dateStr: `${value('year')}-${value('month')}-${value('day')}`, dayOfWeek: value('weekday') };
}

export function getTimeWindow24h(dateStr, targetHour = 22) {
  assertDate(dateStr);
  const endTime = new Date(`${dateStr}T${String(targetHour).padStart(2, '0')}:00:00+08:00`);
  const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
  return {
    startTime,
    endTime,
    startISO: startTime.toISOString(),
    endISO: endTime.toISOString(),
    startBJ: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium' }).format(startTime),
    endBJ: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium' }).format(endTime)
  };
}

export function getTodayGitStats(dateStr, windowOptions = null) {
  assertDate(dateStr);
  const win = windowOptions || getTimeWindow24h(dateStr);
  const log = execFileSync('git', ['log', '--no-merges',
    `--since=${win.startTime.toISOString()}`, `--before=${win.endTime.toISOString()}`,
    '--format=%H%x09%s'], { cwd: ROOT_DIR, encoding: 'utf8' });
  const commits = log.trim().split('\n').filter(Boolean).map((line) => {
    const [hash, ...subject] = line.split('\t');
    return { hash, subject: subject.join('\t') };
  }).filter(({ subject }) => !/^(build\b|chore\((moments|gallery)\):.*自动同步)/i.test(subject) &&
    !/^[^:]*\(diary\):/.test(subject));
  return { count: commits.length, commits };
}

export function getTodayMoments(dateStr, windowOptions = null) {
  assertDate(dateStr);
  const win = windowOptions || getTimeWindow24h(dateStr);
  const startTs = win.startTime.getTime();
  const endTs = win.endTime.getTime();

  return readJson('data/moments.json').filter((m) => {
    if (!m.date) return false;
    const parsed = new Date(m.date.replace(/\//g, '-') + '+08:00');
    const ts = parsed.getTime();
    return Number.isFinite(ts) && ts >= startTs && ts <= endTs;
  }).map((m) => {
    const images = (m.images || []).map((img) => {
      const localPath = img.src ? path.join(ROOT_DIR, img.src) : null;
      return {
        ...img,
        localPath: localPath && fs.existsSync(localPath) ? localPath : null
      };
    });
    return { ...m, images };
  });
}

export function getTodayGalleryPhotos(dateStr, windowOptions = null) {
  assertDate(dateStr);
  const win = windowOptions || getTimeWindow24h(dateStr);
  const startTs = win.startTime.getTime();
  const endTs = win.endTime.getTime();

  return (readJson('data/gallery.json').albums || []).flatMap((a) => a.photos || [])
    .filter((p) => {
      if (!p.date) return false;
      const parsed = new Date(p.date.replace(/\s+/g, 'T') + '+08:00');
      const ts = parsed.getTime();
      return Number.isFinite(ts) && ts >= startTs && ts <= endTs;
    })
    .map((p) => {
      const localPath = p.src ? path.join(ROOT_DIR, p.src) : null;
      const thumbPath = p.thumb ? path.join(ROOT_DIR, p.thumb) : null;
      return {
        src: p.src,
        thumb: p.thumb,
        date: p.date,
        issueNumber: p.issueNumber,
        w: p.w,
        h: p.h,
        ratio: p.ratio,
        localPath: localPath && fs.existsSync(localPath) ? localPath : null,
        thumbPath: thumbPath && fs.existsSync(thumbPath) ? thumbPath : null,
        dateMeaning: '上传记录，非拍摄时间',
        visionHint: '请通过多模态感知本地图片，识别画面文字(OCR)、主体细节、场景与现实反差'
      };
    });
}

export function getTodayMediaItems(dateStr, windowOptions = null) {
  assertDate(dateStr);
  const win = windowOptions || getTimeWindow24h(dateStr);
  const startTs = win.startTime.getTime();
  const endTs = win.endTime.getTime();
  const media = readJson('data/media.json');

  return ['movies', 'books', 'games'].flatMap((category) => (media[category] || [])
    .filter((item) => {
      if (!item.date) return false;
      const parsed = new Date(item.date.replace(/\s+/g, 'T') + '+08:00');
      const ts = parsed.getTime();
      return Number.isFinite(ts) && ts >= startTs && ts <= endTs;
    })
    .map((item) => ({ ...item, category, verified: false, warning: '仅为待核实线索；日期、评分不证明观看状态' })));
}

export function collect(dateStr, options = {}) {
  assertDate(dateStr);
  const targetHour = options.targetHour ?? 22;
  const win = getTimeWindow24h(dateStr, targetHour);

  return {
    date: dateStr,
    window: {
      from: win.startBJ,
      to: win.endBJ,
      startISO: win.startISO,
      endISO: win.endISO,
      description: '统计近 24 小时（前一日 22:00 至 当日 22:00）'
    },
    promptFile: 'docs/ai-diary.md',
    promptVersion: PROMPT_VERSION,
    git: getTodayGitStats(dateStr, win),
    moments: getTodayMoments(dateStr, win),
    photos: getTodayGalleryPhotos(dateStr, win),
    mediaHints: getTodayMediaItems(dateStr, win),
    posts: readJson('data/blog-index.json').posts.filter((p) => {
      if (!p.dateText) return false;
      const parsed = new Date(p.dateText.replace(/\//g, '-') + 'T00:00:00+08:00');
      const ts = parsed.getTime();
      return Number.isFinite(ts) && ts >= win.startTime.getTime() && ts <= win.endTime.getTime() &&
        !p.tags?.includes('历史文章');
    }),
    limitations: ['只采集本站本地素材；未抓取豆瓣、微博、小红书，也未核实时事。缺少记录不代表没有活动。']
  };
}

export function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') throw new Error('日记必须为对象');
  assertDate(entry.date);
  const required = ['dayOfWeek', 'weather', 'punchline', 'content', 'note', 'footnote'];
  for (const key of required) {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`${entry.date} 缺少 ${key}`);
  }
  if (entry.punchline.trim().endsWith('。') || entry.content.trim().endsWith('。')) {
    throw new Error(`${entry.date} 总结短句(punchline)与正文末尾不得以句号结束`);
  }
  const length = [...entry.content.replace(/\s/gu, '')].length;
  const paragraphs = entry.content.trim().split(/\n\s*\n/);
  if (length < 180 || length > 250 || paragraphs.length < 2 || paragraphs.length > 3) {
    throw new Error(`${entry.date} 正文须为 180～250 字、2～3 段（当前 ${length} 字、${paragraphs.length} 段）`);
  }
  if ([...entry.punchline].length > 60 || !entry.mood?.label || [...entry.mood.label].length > 12 ||
      !entry.mood.emoji || entry.mood.score !== 50) throw new Error(`${entry.date} 标题或心绪格式不符`);
  for (const key of ['commits', 'moments', 'photos', 'media']) {
    if (!Number.isInteger(entry.stats?.[key]) || entry.stats[key] < 0) throw new Error(`${entry.date} 统计格式错误`);
  }
  if (typeof entry.stats.focus !== 'string' || !Number.isFinite(Date.parse(entry.generatedAt)) ||
      !entry.promptVersion) throw new Error(`${entry.date} 缺少生成时间或规则版本`);
  if (!Array.isArray(entry.sources) || !entry.sources.some((s) => s.status === 'read')) {
    throw new Error(`${entry.date} 须有实际读取的来源`);
  }
  for (const source of entry.sources) {
    if (!source.label || !source.detail || !['read', 'limited', 'unavailable'].includes(source.status)) {
      throw new Error(`${entry.date} 来源格式错误`);
    }
    if (source.url && new URL(source.url).protocol !== 'https:') throw new Error('来源链接须为 HTTPS');
  }
  return entry;
}

export function run({ entries, targetPath = DIARY_PATH, allowHistory = false, now = new Date() } = {}) {
  if (!entries) throw new Error('请先采集素材并由 AI 写作，再通过 --input 提交成稿；脚本不生成文章');
  const incoming = Array.isArray(entries) ? entries : [entries];
  if (!incoming.length) throw new Error('成稿数组不能为空');
  const seen = new Set();
  const today = getBeijingDateInfo(now).dateStr;
  for (const entry of incoming) {
    if (typeof entry.punchline === 'string') {
      entry.punchline = entry.punchline.trim().replace(/。+$/u, '');
    }
    if (typeof entry.content === 'string') {
      entry.content = entry.content.trim().replace(/。+$/u, '');
    }
    validateEntry(entry);
    if (entry.date > today || (!allowHistory && entry.date !== today)) throw new Error('历史重写须显式传入 --allow-history；不允许未来日记');
    if (seen.has(entry.date)) throw new Error(`批次日期重复：${entry.date}`);
    seen.add(entry.date);
  }
  const existing = fs.existsSync(targetPath) ? JSON.parse(fs.readFileSync(targetPath, 'utf8')) : [];
  if (!Array.isArray(existing) || new Set(existing.map((e) => e.date)).size !== existing.length) {
    throw new Error('现有日记格式错误或日期重复，停止写入');
  }
  const merged = new Map(existing.map((entry) => [entry.date, entry]));
  incoming.forEach((entry) => merged.set(entry.date, entry));
  const result = [...merged.values()].sort((a, b) => b.date.localeCompare(a.date));
  const temp = `${targetPath}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(result, null, 2) + '\n', 'utf8');
    fs.renameSync(temp, targetPath);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args[0] === 'collect') {
      if (args.length !== 2) throw new Error('用法：collect YYYY-MM-DD');
      console.log(JSON.stringify(collect(args[1]), null, 2));
    } else {
      if (args[0] !== '--input' || !args[1] || args.slice(2).some((a) => a !== '--allow-history')) {
        throw new Error('用法：--input 成稿.json [--allow-history]；脚本不生成文章');
      }
      const entries = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      const result = run({ entries, allowHistory: args.includes('--allow-history') });
      console.log(`已校验并保存，现有 ${result.length} 篇手账。`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
