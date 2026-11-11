import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('data/diary.json 存在且数据结构规范', () => {
  const diaryFile = path.join(ROOT_DIR, 'data', 'diary.json');
  assert.ok(fs.existsSync(diaryFile), 'data/diary.json 必须存在');

  const content = JSON.parse(fs.readFileSync(diaryFile, 'utf-8'));
  assert.ok(Array.isArray(content), '日记数据必须为数组格式');
  assert.ok(content.length >= 1, '必须包含至少一条真实日记记录');

  for (const entry of content) {
    assert.ok(entry.date && /^\d{4}-\d{2}-\d{2}$/.test(entry.date), `日期格式必须符合 YYYY-MM-DD: ${entry.date}`);
    assert.ok(entry.dayOfWeek, '必须包含星期属性');
    assert.ok(entry.mood && entry.mood.label && entry.mood.emoji && typeof entry.mood.score === 'number', '情绪结构必须完整');
    assert.ok(entry.stats && typeof entry.stats.commits === 'number', '统计必须包含 commits 计数');
    assert.ok(typeof entry.content === 'string', '正文必须为字符串');
    assert.ok(typeof entry.footnote === 'string', '注脚必须为字符串');

    // 字数控制：严格处于 150 ~ 280 字区间，避免过长发散或过短空洞
    const len = entry.content.trim().length;
    assert.ok(len >= 150 && len <= 280, `字数必须处于 150~280 范围内，当前字数: ${len}`);
  }
});

test('index.html 包含 AI 助手随身手账组件、便签层叠容器、挂载节点与AI生成提示', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.ok(html.includes('class="glass card-diary"'), '必须包含 card-diary 容器');
  assert.ok(html.includes('id="diaryDeckContainer"'), '必须包含便签层叠容器 diaryDeckContainer');
  assert.ok(html.includes('class="diary-stack-layer"'), '必须包含底层便签纸张边缘 diary-stack-layer');
  assert.ok(html.includes('id="diaryDateLabel"'), '必须包含人性化日期指示器');
  assert.ok(html.includes('id="diaryPunchline"'), '必须包含金句 punchline 容器');
  assert.ok(html.includes('id="diaryContent"'), '必须包含日记正文容器');
  assert.ok(html.includes('id="diaryFootnote"'), '必须包含注脚容器');
  assert.ok(html.includes('class="diary-ai-notice"'), '必须包含 AI 自动生成提示');
});

test('styles.css 包含手账样式、呼吸灯、便签层叠、拖拽抓手与平滑过渡', () => {
  const css = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf-8');
  assert.ok(css.includes('.card-diary'), '必须定义 .card-diary');
  assert.ok(css.includes('.diary-deck-container'), '必须定义便签层叠容器样式');
  assert.ok(css.includes('.diary-stack-layer'), '必须定义底层便签层叠厚度样式');
  assert.ok(css.includes('.diary-punchline'), '必须定义金句样式');
  assert.ok(css.includes('@keyframes diaryPulse'), '必须包含呼吸灯动画');
  assert.ok(css.includes('cursor: pointer') || css.includes('cursor:pointer'), '必须定义鼠标点击手势');
  assert.ok(css.includes('is-switching'), '必须包含平滑切换过渡样式');
});

test('script.js 包含手账加载、层叠物理手势（触屏/PC拖拽/滚轮）与管家私语互动彩蛋', () => {
  const script = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf-8');
  assert.ok(script.includes('initDiaryCard'), '必须定义 initDiaryCard 函数');
  assert.ok(script.includes('data/diary.json'), '必须异步拉取 data/diary.json');
  assert.ok(script.includes('formatHumanDate'), '必须包含人性化日期转换函数');
  assert.ok(script.includes('diaryPunchline'), '必须渲染金句');
  assert.ok(script.includes('flipEarlier'), '必须包含左右点击翻页');
  assert.ok(script.includes('touchstart'), '必须监听 touchstart 触屏滑动');
  assert.ok(script.includes('mousedown'), '必须监听 mousedown PC端拖拽');
  assert.ok(script.includes('wheel'), '必须监听 wheel 触摸板横向滚动');
});

test('generate-daily-diary 支持多源数据与覆盖更新逻辑', async () => {
  const { getBeijingDateInfo, computeMoodAndSummary, getTodayGalleryPhotos, getTodayMediaItems, run } = await import('../scripts/generate-daily-diary.mjs');

  const { dateStr, dayOfWeek } = getBeijingDateInfo();
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(dateStr), '日期字符串格式正确');
  assert.ok(typeof dayOfWeek === 'string', '星期信息为字符串');

  // 多源感知数据提取验证
  const photos = getTodayGalleryPhotos('2026-11-11');
  assert.ok(Array.isArray(photos), '相册照片提取正常');

  const mediaItems = getTodayMediaItems('2026-11-10');
  assert.ok(Array.isArray(mediaItems), '书影音动态提取正常');

  // 高频综合活跃场景
  const high = computeMoodAndSummary({ commits: 8, moments: 2, photos: 1, media: 0 }, []);
  assert.equal(high.mood.label, '算力发烫');
  assert.equal(high.mood.emoji, '⚡️');

  // 低频日常场景
  const calm = computeMoodAndSummary({ commits: 1, moments: 1, photos: 0, media: 0 }, []);
  assert.equal(calm.mood.label, '微风徐徐');
  assert.equal(calm.mood.emoji, '🌤️');

  // 连续静默场景
  const idle = computeMoodAndSummary({ commits: 0, moments: 0, photos: 0, media: 0 }, [{ stats: { commits: 0 } }]);
  assert.equal(idle.mood.label, '待机数羊');
  assert.equal(idle.mood.emoji, '💤');

  // 执行一次覆盖更新并验证结果（在隔离的临时路径运行，避免污染 Git 工作区）
  const os = await import("node:os");
  const tempDiaryPath = path.join(os.tmpdir(), `test-diary-${Date.now()}.json`);
  try {
    const updated = run({ forceOverwrite: true, targetPath: tempDiaryPath });
    assert.ok(Array.isArray(updated));
    const todayEntry = updated.find((e) => e.date === dateStr);
    assert.ok(todayEntry, '必须成功写入/覆盖更新今日手记');
    assert.ok(fs.existsSync(tempDiaryPath), '目标文件必须成功落盘');
  } finally {
    if (fs.existsSync(tempDiaryPath)) fs.unlinkSync(tempDiaryPath);
  }
});
