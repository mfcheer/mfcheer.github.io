import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIARY_PATH = path.join(ROOT_DIR, 'data', 'diary.json');
const MOMENTS_PATH = path.join(ROOT_DIR, 'data', 'moments.json');

/**
 * 获取当前北京时间相关信息
 */
export function getBeijingDateInfo(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  const dayOfWeek = parts.find((p) => p.type === 'weekday')?.value || '星期三';
  const dateStr = `${year}-${month}-${day}`;
  return { dateStr, dayOfWeek };
}

/**
 * 获取今日 Git 提交统计
 */
export function getTodayGitStats(dateStr) {
  try {
    const log = execSync(`git log --since="${dateStr} 00:00:00" --until="${dateStr} 23:59:59" --oneline`, {
      cwd: ROOT_DIR,
      encoding: 'utf-8'
    }).trim();
    if (!log) return { count: 0, commits: [] };
    const lines = log.split('\n').filter(Boolean);
    return { count: lines.length, commits: lines };
  } catch {
    return { count: 0, commits: [] };
  }
}

/**
 * 获取今日说说条目
 */
export function getTodayMoments(dateStr) {
  try {
    if (!fs.existsSync(MOMENTS_PATH)) return [];
    const moments = JSON.parse(fs.readFileSync(MOMENTS_PATH, 'utf-8'));
    const formattedPrefix = dateStr.replace(/-/g, '/');
    return moments.filter((m) => m.date && m.date.startsWith(formattedPrefix));
  } catch {
    return [];
  }
}

/**
 * 根据数据与历史对比推算情绪与状态
 */
export function computeMoodAndSummary(commitCount, momentCount, previousEntries = []) {
  const prevCount = previousEntries[0]?.stats?.commits ?? 0;
  
  if (commitCount >= 6) {
    return {
      mood: { label: '算力发烫', emoji: '⚡️', score: Math.min(98, 85 + commitCount) },
      type: 'high_intensity'
    };
  }
  if (commitCount > 0 || momentCount > 0) {
    return {
      mood: { label: '微风徐徐', emoji: '🌤️', score: 65 + commitCount * 3 },
      type: 'calm_routine'
    };
  }
  if (prevCount === 0) {
    return {
      mood: { label: '待机数羊', emoji: '💤', score: 38 },
      type: 'idle_long'
    };
  }
  return {
    mood: { label: '托腮发呆', emoji: '🍂', score: 48 },
    type: 'idle_start'
  };
}

/**
 * 主执行函数
 */
export function run() {
  const { dateStr, dayOfWeek } = getBeijingDateInfo();
  let existing = [];
  if (fs.existsSync(DIARY_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(DIARY_PATH, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const gitStats = getTodayGitStats(dateStr);
  const moments = getTodayMoments(dateStr);
  const { mood } = computeMoodAndSummary(gitStats.count, moments.length, existing);

  console.log(`[Diary] 日期: ${dateStr} (${dayOfWeek}), 今日 Commit: ${gitStats.count}, 说说: ${moments.length}, 情绪: ${mood.emoji} ${mood.label}`);

  const todayIndex = existing.findIndex((item) => item.date === dateStr);
  if (todayIndex >= 0) {
    console.log(`[Diary] 今日 ${dateStr} 已存在手记，已保留人工/生成的高质量记录。`);
    return existing;
  }

  const newEntry = {
    date: dateStr,
    dayOfWeek,
    weather: '晴',
    mood,
    stats: {
      commits: gitStats.count,
      moments: moments.length,
      focus: gitStats.count > 0 ? '日常技术迭代' : '待机与休眠'
    },
    content: `今天老大的键盘保持着熟悉的节奏。作为一本随身手账本，我默默记录着每一次代码构建与足迹流转。显存温度稳定，神经元待命中。`,
    footnote: `${gitStats.count} 次提交 · ${moments.length} 条生活动态 · 陪伴中`
  };

  existing.unshift(newEntry);
  fs.writeFileSync(DIARY_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  console.log(`[Diary] 成功记录 ${dateStr} 随身手记。`);
  return existing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
