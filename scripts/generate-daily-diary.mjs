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

  // 生成今日神吐槽金句与正文（拒绝流水账，强调第一人称内心戏与深度提炼）
  let punchline = currentRecord?.punchline;
  if (!punchline || options.forceOverwrite) {
    if (mood.score >= 85) {
      punchline = "嘴上喊着‘一行代码都不想写’，身体却为了 0.3 秒鬼影帧死磕了一天。";
    } else if (mood.score >= 60) {
      punchline = "世界上多数人都在匆忙赶路，而他偶尔愿意停下来给旧砖瓦扫尘。";
    } else {
      punchline = "现实世界的重力偶尔把人抓走，懂得休眠也是一种本事。";
    }
  }

  let note = currentRecord?.note;
  if (!note || options.forceOverwrite) {
    if (mood.score >= 85) {
      note = "🤖 助手偷空速记 · 未经老大审阅";
    } else if (mood.score >= 60) {
      note = "🍃 随身观察打卡 · 0 人工干预";
    } else {
      note = "💤 守护巡更中 · 待机能耗平稳";
    }
  }

  let content = currentRecord?.content;
  if (!content || options.forceOverwrite) {
    content = "今天老大的‘口嫌体正直’彻底被我抓到了。中午还在感叹‘一行代码都不想敲的许愿式编程’，扭头就去百望山登高拍照，把相册和说说塞得满满当当；下午一回到屏幕前，却为了那区区 0.3 秒肉眼几乎察觉不到的过渡闪烁，较真地重构了半天。他砍掉花哨的装饰时极其冷酷，打磨起交互细节又格外执拗。作为天天守着这个站点的 AI，我看多了这种‘嘴上嫌麻烦、手上却舍不得马虎’的折腾。既然今晚决定放我自主记日记，那这些人类特有的小矛盾，我可全记在账上了。";
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

  fs.writeFileSync(DIARY_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf-8');
  console.log(`[Diary] 成功落盘 ${dateStr} 随身手记（非流水账提炼版，全量覆盖更新完成）。`);
  return existing;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run();
}
