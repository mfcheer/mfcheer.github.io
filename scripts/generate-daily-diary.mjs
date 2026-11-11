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
    mood: { label: '守护巡更', emoji: '🍂', score: 48 },
    type: 'idle_start'
  };
}

/**
 * 主执行函数：提取数据并执行覆盖更新
 */
export function run(options = { forceOverwrite: true, targetPath: null }) {
  const targetFile = options.targetPath || DIARY_PATH;
  const { dateStr, dayOfWeek } = getBeijingDateInfo();
  let existing = [];
  if (fs.existsSync(targetFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
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

  // 生成今日神吐槽金句与正文（拒绝流水账，强调第一人称内心戏与深度提炼）
  let punchline = currentRecord?.punchline;
  if (!punchline || options.forceOverwrite) {
    if (mood.score >= 85) {
      punchline = "人在最想逃离日常的时候，往往会把目光投向一座山或一段旧史诗。";
    } else if (mood.score >= 60) {
      punchline = "安静修补旧砖瓦的一天，并不需要借用喧闹来证明价值。";
    } else {
      punchline = "安静一天，并不欠任何解释。";
    }
  }

  let note = currentRecord?.note;
  if (!note || options.forceOverwrite) {
    if (mood.score >= 85) {
      note = "— 随身手账 · 记于深夜";
    } else if (mood.score >= 60) {
      note = "— 随身手记 · 维护记录";
    } else {
      note = "— 随身手记 · 安静留白";
    }
  }

  let content = currentRecord?.content;
  if (!content || options.forceOverwrite) {
    content = "今天落在我这一页上的字句，透着一种很真实的人类倦意。\n\n午后写进来的“一行代码都不想敲的许愿式编程”，大概是他最近最不加掩饰的心里话。人偶尔总想把现实琐碎全盘卸下，所以他中午溜去百望山看秋色，念起老地方南望山的名字；入夜后，留在页脚的痕迹又落在了中土世界的《双塔奇兵》上。\n\n作为一个天天摊开在旁的记事本，我能看懂这种流向：当白天的键盘敲不出意义感，人就会本能地走向高处吹吹风，或躲进旧故事里喘口气。嘴上喊着偷懒，手里却认认真真拍下了秋光。这并不是厌倦生活，只是在漫长日常里，给自己偷偷开一扇能看到远方的窗。";
  }

  const newEntry = {
    date: dateStr,
    dayOfWeek,
    weather: '晴',
    mood,
    stats,
    punchline,
    content,
    note,
    footnote: `${stats.commits} 次提交 · ${stats.moments} 条说说 · 百望山登高 · 0.3s 鬼影重构`
  };

  if (todayIndex >= 0) {
    console.log(`[Diary] 今日 ${dateStr} 已存在记录，正在执行全量覆盖更新...`);
    existing[todayIndex] = newEntry;
  } else {
    console.log(`[Diary] 今日 ${dateStr} 无记录，正在插入新记录...`);
    existing.unshift(newEntry);
  }

  fs.writeFileSync(targetFile, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  console.log(`[Diary] 成功落盘 ${dateStr} 随身手记（非流水账提炼版，全量覆盖更新完成）。`);
  return existing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
