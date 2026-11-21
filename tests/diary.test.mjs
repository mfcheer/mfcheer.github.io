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
  assert.ok(html.includes('<h2>助手日记</h2>'), '组件标题必须为 助手日记');
  assert.ok(html.includes('class="diary-spine"'), '必须包含书脊装订压痕 diary-spine');
  assert.ok(html.includes('class="diary-page-curl"'), '必须包含右下角微卷角 diary-page-curl');
  assert.ok(html.includes('id="diaryEntryDate"'), '必须包含日记内页日期 diaryEntryDate');
  assert.ok(html.includes('id="diaryEntryMood"'), '必须包含日记内页心绪 diaryEntryMood');
  assert.ok(html.includes('class="diary-book-pager"'), '必须包含书本分页器 diary-book-pager');
  assert.ok(html.includes('id="diaryPageIndicator"'), '必须包含页码指示器 diaryPageIndicator');
  assert.ok(html.includes('id="diaryPrevPageBtn"'), '必须包含上一页按钮 diaryPrevPageBtn');
  assert.ok(html.includes('id="diaryNextPageBtn"'), '必须包含下一页按钮 diaryNextPageBtn');
});

test('styles.css 包含手账样式、呼吸灯、便签层叠、拖拽抓手与平滑过渡', () => {
  const css = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf-8');
  assert.ok(css.includes('.card-diary'), '必须定义 .card-diary');
  assert.ok(css.includes('.diary-deck-container'), '必须定义便签层叠容器样式');
  assert.ok(css.includes('.diary-stack-layer'), '必须定义底层便签层叠厚度样式');
  assert.ok(css.includes('.diary-punchline'), '必须定义金句样式');
  assert.ok(css.includes('@keyframes diaryPulse'), '必须包含呼吸灯动画');
  assert.ok(css.includes('cursor: default') || css.includes('cursor: pointer'), '必须定义鼠标手势');
  assert.ok(css.includes('is-switching'), '必须包含平滑切换过渡样式');
  assert.ok(css.includes('.diary-spine'), '必须定义书脊样式 .diary-spine');
  assert.ok(css.includes('.diary-page-curl'), '必须定义右下角卷角样式 .diary-page-curl');
  assert.ok(css.includes('.diary-book-pager'), '必须定义分页器容器样式 .diary-book-pager');
  assert.ok(css.includes('.diary-page-nav-btn'), '必须定义翻页按钮样式 .diary-page-nav-btn');
  assert.ok(css.includes('prefers-reduced-motion') && css.includes('.diary-body-wrap'), '必须针对减弱动态效果优化 .diary-body-wrap 动画');
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
  assert.ok(script.includes('lastTouchEndTime') && script.includes('FLIP_COOLDOWN_MS'), '必须包含触屏合成事件过滤与翻页冷却防抖逻辑以防手机双跳');
  assert.ok(script.includes('diaryPageIndicator'), '必须更新页码指示器');
  assert.ok(script.includes('diaryPrevPageBtn'), '必须支持上一页按钮事件');
  assert.ok(script.includes('diaryNextPageBtn'), '必须支持下一页按钮事件');
  assert.ok(script.includes('isMotionReduced') || script.includes('prefers-reduced-motion'), '必须检测并支持无障碍减弱动态效果');
});

test('formatHumanDate 具备动态自然日历适配能力（今天/昨天/前天/跨年），杜绝按数组索引写死', () => {
  const script = fs.readFileSync(path.join(ROOT_DIR, 'script.js'), 'utf-8');
  assert.ok(script.includes('getBeijingDateStr'), '必须包含获取北京时间日期函数');
  assert.ok(script.includes('dayDiff'), '必须基于自然天数差计算相对日期');

  // 提取 formatHumanDate 与 getBeijingDateStr 进行动态执行测试
  const funcMatch = script.match(/function getBeijingDateStr[\s\S]*?function formatHumanDate[\s\S]*?\n    \}/);
  assert.ok(funcMatch, '必须能成功提取 formatHumanDate 实现');

  const ctx = {};
  const fn = new Function('ctx', funcMatch[0] + '\nctx.formatHumanDate = formatHumanDate;\nctx.getBeijingDateStr = getBeijingDateStr;');
  fn(ctx);

  const mockBaseDate = new Date('2026-11-12T10:00:00+08:00');
  assert.equal(ctx.formatHumanDate('2026-11-12', mockBaseDate), '今天', '当天记录必须显示为 今天');
  assert.equal(ctx.formatHumanDate('2026-11-11', mockBaseDate), '昨天', '昨日记录必须动态适配为 昨天');
  assert.equal(ctx.formatHumanDate('2026-11-10', mockBaseDate), '前天', '前日记录必须动态适配为 前天');
  assert.equal(ctx.formatHumanDate('2026-11-09', mockBaseDate), '11月9日', '同年前日之前记录显示为 M月D日');
  assert.equal(ctx.formatHumanDate('2025-11-09', mockBaseDate), '2025年11月9日', '跨年记录显示为 YYYY年M月D日');
});

test('素材采集按近 24 小时时间窗口筛选，并提供多模态视觉路径与证据边界', async () => {
  const { getBeijingDateInfo, getTimeWindow24h, collect } = await import('../scripts/generate-daily-diary.mjs');
  assert.equal(getBeijingDateInfo(new Date('2026-11-09T16:01:00Z')).dateStr, '2026-11-10');
  const win = getTimeWindow24h('2026-11-18', 22);
  assert.equal(win.endTime.getTime() - win.startTime.getTime(), 24 * 60 * 60 * 1000, '窗口必须精确为 24 小时');
  const sample = collect('2026-11-18');
  assert.ok(sample.window && sample.window.description.includes('24 小时'));
  assert.ok(sample.mediaHints.every((item) => item.verified === false));
  assert.ok(sample.photos.every((item) => item.dateMeaning.includes('非拍摄时间') && item.visionHint));
  assert.ok(sample.git.commits.every((item) => !item.subject.startsWith('build:')));
  assert.throws(() => collect('2026-02-30'), /无效日期/);
});

test('成稿覆盖保留其他日期，非法批次和损坏旧文件均不写入', async () => {
  const { run } = await import('../scripts/generate-daily-diary.mjs');
  const os = await import('node:os');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'diary-test-'));
  const targetPath = path.join(directory, 'diary.json');
  const originals = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/diary.json'), 'utf8'));
  const nextDate = new Date(`${originals[0].date}T12:00:00+08:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const now = nextDate;
  const futureDate = new Date(nextDate);
  futureDate.setDate(futureDate.getDate() + 1);
  const futureDateStr = futureDate.toISOString().slice(0, 10);
  try {
    fs.writeFileSync(targetPath, JSON.stringify(originals));
    const entries = { ...originals[0], punchline: '覆盖后的具体发现' };
    const updated = run({ entries, targetPath, allowHistory: true, now });
    assert.equal(updated.length, originals.length);
    assert.equal(updated[0].punchline, entries.punchline);
    assert.deepEqual(updated.slice(1), originals.slice(1));
    const before = fs.readFileSync(targetPath, 'utf8');
    for (const invalid of [
      [entries, { ...originals[1], content: '过短' }],
      [entries, entries],
      [{ ...entries, date: futureDateStr }],
      [{ ...entries, sources: [] }]
    ]) {
      assert.throws(() => run({ entries: invalid, targetPath, allowHistory: true, now }));
      assert.equal(fs.readFileSync(targetPath, 'utf8'), before);
    }
    assert.throws(() => run({ entries, targetPath, now }), /历史重写/);
    assert.throws(() => run({ targetPath }), /脚本不生成文章/);
    assert.equal(fs.readFileSync(targetPath, 'utf8'), before);
    fs.writeFileSync(targetPath, '{broken');
    assert.throws(() => run({ entries, targetPath, allowHistory: true, now }));
    assert.equal(fs.readFileSync(targetPath, 'utf8'), '{broken');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('全部手账符合新规则的字数、来源、版本及日期唯一降序要求', async () => {
  const { validateEntry, PROMPT_VERSION } = await import('../scripts/generate-daily-diary.mjs');
  const entries = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/diary.json'), 'utf8'));
  for (const entry of entries) {
    validateEntry(entry);
    assert.equal(entry.promptVersion, PROMPT_VERSION);
  }
  const dates = entries.map((entry) => entry.date);
  assert.equal(new Set(dates).size, dates.length);
  assert.deepEqual(dates, [...dates].sort().reverse());
});
