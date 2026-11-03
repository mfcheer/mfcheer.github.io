// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const target = document.querySelector(targetId);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', targetId);
        }
    });
});

// Theme Management (Light / Dark mode)
const themeToggleBtn = document.getElementById('themeToggle');
const rootElement = document.documentElement;

function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    if (theme === 'dark') {
        rootElement.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = '☀️';
            themeToggleBtn.setAttribute('title', '切换至浅色模式');
        }
    } else {
        rootElement.setAttribute('data-theme', 'light');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = '🌙';
            themeToggleBtn.setAttribute('title', '切换至深色模式');
        }
    }
}

// Initialize theme
let currentTheme = getPreferredTheme();
applyTheme(currentTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    });
}

// Listen to system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
    }
});

// Live Beijing Time updater
function updateBeijingTime() {
    const timeEl = document.getElementById('beijingTime');
    if (!timeEl) return;
    try {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Shanghai',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        const formatter = new Intl.DateTimeFormat('zh-CN', options);
        timeEl.textContent = formatter.format(now);
    } catch (e) {
        const now = new Date();
        timeEl.textContent = now.toTimeString().substring(0, 8);
    }
}

updateBeijingTime();
setInterval(updateBeijingTime, 1000);

// Load GitHub Chart and ensure responsive vector scaling without dragging/overflow
async function loadGitHubChart() {
    const container = document.getElementById('ghChart');
    if (!container) return;
    try {
        const res = await fetch('https://ghchart.rshah.org/0071e3/mfcheer');
        if (!res.ok) return;
        let svgText = await res.text();
        if (svgText.includes('<svg')) {
            if (!svgText.includes('viewBox')) {
                svgText = svgText.replace('<svg ', '<svg viewBox="0 0 663 104" preserveAspectRatio="xMinYMid meet" ');
            }
            container.innerHTML = svgText;
        }
    } catch (e) {
        // Fallback: the static img remains displayed safely
    }
}

loadGitHubChart();

// Moments (说说) — GitHub Issues as CMS
// 发布方式：在本仓库创建 Issue（正文优先，标题兜底），仅展示仓库所有者创建的 Issue
const MOMENTS_API_URL =
    'https://api.github.com/repos/mfcheer/mfcheer.github.io/issues?creator=mfcheer&state=open&per_page=20&sort=created&direction=desc';
const MOMENTS_CACHE_KEY = 'momentsData';
const MOMENTS_ETAG_KEY = 'momentsEtag';
const MOMENTS_TIME_KEY = 'momentsTime';
const MOMENTS_TTL = 30 * 1000; // 仅 30 秒内直接用缓存；过期后带 ETag 条件请求重新验证（304 不计入 API 限流，近乎实时）

function formatMomentDate(isoString) {
    try {
        return new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(isoString));
    } catch (e) {
        return String(isoString).substring(0, 16).replace('T', ' ');
    }
}

function renderMoments(list) {
    const listEl = document.getElementById('momentList');
    const countEl = document.getElementById('momentCount');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (countEl) {
        countEl.textContent = `共 ${list.length} 条`;
    }
    if (!list.length) {
        const empty = document.createElement('p');
        empty.className = 'moment-empty';
        empty.textContent = '还没有说说，敬请期待';
        listEl.append(empty);
        return;
    }
    list.forEach((m) => {
        const item = document.createElement('div');
        item.className = 'moment-item';
        const text = document.createElement('p');
        text.className = 'moment-text';
        text.textContent = m.text; // 仅用 textContent，防 XSS
        const date = document.createElement('span');
        date.className = 'moment-date';
        date.textContent = m.date;
        item.append(text, date);
        listEl.append(item);
    });
}

function readMomentsCache() {
    try {
        const raw = localStorage.getItem(MOMENTS_CACHE_KEY);
        const list = raw ? JSON.parse(raw) : null;
        return Array.isArray(list) ? list : null;
    } catch (e) {
        return null;
    }
}

function writeMomentsCache(list, etag) {
    try {
        localStorage.setItem(MOMENTS_CACHE_KEY, JSON.stringify(list));
        localStorage.setItem(MOMENTS_TIME_KEY, String(Date.now()));
        if (etag) {
            localStorage.setItem(MOMENTS_ETAG_KEY, etag);
        }
    } catch (e) {
        // 隐私模式等存储异常时忽略，不影响展示
    }
}

async function loadMoments() {
    const cached = readMomentsCache();
    const lastTime = Number(localStorage.getItem(MOMENTS_TIME_KEY) || 0);
    const isFresh = cached && Date.now() - lastTime < MOMENTS_TTL;

    if (isFresh) {
        renderMoments(cached);
        return;
    }
    if (cached) {
        renderMoments(cached); // 先渲染旧数据，请求成功后再更新
    }

    try {
        const headers = {};
        const etag = localStorage.getItem(MOMENTS_ETAG_KEY);
        if (etag) {
            headers['If-None-Match'] = etag; // 条件请求：304 响应不计入 GitHub API 限流
        }
        const res = await fetch(MOMENTS_API_URL, { headers, cache: 'no-store' });

        if (res.status === 304 && cached) {
            writeMomentsCache(cached, etag);
            return;
        }
        if (res.ok) {
            const issues = await res.json();
            const list = (Array.isArray(issues) ? issues : [])
                .filter((it) => it && !it.pull_request) // Issues API 会混入 PR，需排除
                .map((it) => ({
                    date: formatMomentDate(it.created_at),
                    text: ((it.body || '').trim() || (it.title || '')).trim()
                }))
                .filter((m) => m.text);
            renderMoments(list);
            writeMomentsCache(list, res.headers.get('ETag') || undefined);
            return;
        }
        // 403 限流或其他错误：保留已渲染的旧缓存
    } catch (e) {
        // 网络异常：保留已渲染的旧缓存
    }
    if (!cached) {
        renderMoments([]);
    }
}

loadMoments();
