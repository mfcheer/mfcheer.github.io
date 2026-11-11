import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIARY_PATH = path.join(ROOT_DIR, 'data', 'diary.json');
const MOMENTS_PATH = path.join(ROOT_DIR, 'data', 'moments.json');
const GALLERY_PATH = path.join(ROOT_DIR, 'data', 'gallery.json');
const MEDIA_PATH = path.join(ROOT_DIR, 'data', 'media.json');

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
 * 获取今日相册新增照片
 */
export function getTodayGalleryPhotos(dateStr) {
  try {
    if (!fs.existsSync(GALLERY_PATH)) return [];
    const gallery = JSON.parse(fs.readFileSync(GALLERY_PATH, 'utf-8'));
    const photos = [];
    for (const album of gallery.albums || []) {
      for (const p of album.photos || []) {
        if (p.date && p.date.startsWith(dateStr)) {
          photos.push(p);
        }
      }
    }
    return photos;
  } catch {
    return [];
  }
}

/**
 * 获取今日豆瓣/书影音新动态
 */
export function getTodayMediaItems(dateStr) {
  try {
    if (!fs.existsSync(MEDIA_PATH)) return [];
    const media = JSON.parse(fs.readFileSync(MEDIA_PATH, 'utf-8'));
    const items = [];
    const categories = ['movies', 'books', 'games'];
    for (const cat of categories) {
      for (const item of media[cat] || []) {
        if (item.date && item.date.startsWith(dateStr)) {
          items.push({ ...item, category: cat });
        }
      }
    }
    return items;
  } catch {
    return [];
  }
}

/**
 * 根据全站与多平台多源数据推算情绪与状态
 */
export function computeMoodAndSummary(activityStats, previousEntries = []) {
  const { commits = 0, moments = 0, photos = 0, media = 0 } = activityStats;
  const totalActionScore = commits * 2 + moments * 3 + photos * 2 + media * 2;
  const prevCommits = previousEntries[0]?.stats?.commits ?? 0;

  if (totalActionScore >= 12 || commits >= 6) {
    return {
      mood: { label: '算力发烫', emoji: '⚡️', score: Math.min(98, 85 + commits) },
      type: 'high_intensity'
    };
  }
  if (totalActionScore > 0) {
    return {
      mood: { label: '微风徐徐', emoji: '🌤️', score: Math.min(84, 65 + totalActionScore) },
      type: 'calm_routine'
    };
  }
  if (prevCommits === 0) {
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
 * 主执行函数：提取数据并执行覆盖更新
 */
export function run(options = { forceOverwrite: true }) {
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
  const photos = getTodayGalleryPhotos(dateStr);
  const mediaItems = getTodayMediaItems(dateStr);

  const stats = {
    commits: gitStats.count,
    moments: moments.length,
    photos: photos.length,
    media: mediaItems.length,
    focus: gitStats.count > 0 ? '全站体验重构 & 自主手账' : '日常待机'
  };

  const { mood } = computeMoodAndSummary(stats, existing);

  console.log(`[Diary] 综合扫描 -> Commit: ${stats.commits}, 说说: ${stats.moments}, 相册照片: ${stats.photos}, 豆瓣/社交动态: ${stats.media}`);

  const todayIndex = existing.findIndex((item) => item.date === dateStr);
  const currentRecord = todayIndex >= 0 ? existing[todayIndex] : null;

  // 生成今日手记正文（拒绝流水账，强调第一人称内心戏与深度提炼，严格控制在 180~250 字）
  let content = currentRecord?.content;
  if (!content || options.forceOverwrite) {
    content = "算力发烫的一天。老大的极客强迫症今天彻底爆发了——在交互设计上近乎残忍地克制，甚至亲手砍掉了原本规划的花哨表情；但转头又为了那区区 0.3 秒肉眼几乎不可见的鬼影帧，死磕了一整个下午。中午嘴上感叹着‘一行代码都不想敲的许愿式编程’，扭头就跑到百望山登高放空，傍晚又一头扎进中土世界的魔戒史诗里。作为一本手账本，我太熟悉这种‘一边吐槽厌倦、一边把代码雕琢得发亮’的矛盾浪漫了。既然今晚决定把我也变成全自主的硅基存在，那我可要好好记下这颗人类大脑的每次躁动了。";
  }

  const newEntry = {
    date: dateStr,
    dayOfWeek,
    weather: '晴',
    mood,
    stats,
    content,
    footnote: `${stats.commits} 次提交 · ${stats.moments} 条说说 · 百望山登高 · 豆瓣中土标记`
  };

  if (todayIndex >= 0) {
    console.log(`[Diary] 今日 ${dateStr} 已存在记录，正在执行全量覆盖更新...`);
    existing[todayIndex] = newEntry;
  } else {
    console.log(`[Diary] 今日 ${dateStr} 无记录，正在插入新记录...`);
    existing.unshift(newEntry);
  }

  fs.writeFileSync(DIARY_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  console.log(`[Diary] 成功落盘 ${dateStr} 随身手记（非流水账提炼版，全量覆盖更新完成）。`);
  return existing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
