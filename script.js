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
            themeToggleBtn.setAttribute('aria-pressed', 'true');
        }
    } else {
        rootElement.setAttribute('data-theme', 'light');
        if (themeToggleBtn) {
            themeToggleBtn.textContent = '🌙';
            themeToggleBtn.setAttribute('title', '切换至深色模式');
            themeToggleBtn.setAttribute('aria-pressed', 'false');
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
        syncGiscusTheme(currentTheme);
    });
}

// Listen to system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        currentTheme = e.matches ? 'dark' : 'light';
        applyTheme(currentTheme);
        syncGiscusTheme(currentTheme);
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
// 注意：移动端「只显示最近半年」的裁剪由 styles.css 的 @media (max-width: 768px) 实现，
// 同时作用于 fetch 成功注入的 svg 与降级显示的 img（ghchart.rshah.org 在部分网络不可达，
// 依赖 JS 裁剪会在降级场景失效）。此处仅保留 viewBox 补丁保证缩放。
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

// 页脚版权年份：动态取当前年份（无 JS 时回退 HTML 里的静态 2026）
(function () {
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// 全局图片点击放大预览（Lightbox），支持文章正文与说说配图
let siteLightbox = null;
let siteLightboxImg = null;
let siteLightboxCaption = null;
let siteLastActiveElement = null;

function closeLightbox() {
    if (!siteLightbox || !siteLightbox.classList.contains('is-open')) return;
    siteLightbox.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (siteLastActiveElement && typeof siteLastActiveElement.focus === 'function') {
        siteLastActiveElement.focus();
    }
}

function createLightbox() {
    if (siteLightbox) return;
    siteLightbox = document.createElement('div');
    siteLightbox.id = 'siteLightbox';
    siteLightbox.className = 'post-lightbox';
    siteLightbox.setAttribute('role', 'dialog');
    siteLightbox.setAttribute('aria-modal', 'true');
    siteLightbox.setAttribute('aria-label', '图片预览');
    siteLightbox.setAttribute('tabindex', '-1');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'post-lightbox-close';
    closeBtn.setAttribute('title', '关闭预览 (Esc)');
    closeBtn.setAttribute('aria-label', '关闭预览 (Esc)');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    siteLightboxImg = document.createElement('img');
    siteLightboxImg.className = 'post-lightbox-img';
    siteLightboxImg.alt = '';

    siteLightboxCaption = document.createElement('div');
    siteLightboxCaption.className = 'post-lightbox-caption';

    siteLightbox.append(closeBtn, siteLightboxImg, siteLightboxCaption);
    document.body.appendChild(siteLightbox);

    siteLightbox.addEventListener('click', () => {
        closeLightbox();
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && siteLightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });
}

function openLightbox(img) {
    createLightbox();
    siteLastActiveElement = img;
    siteLightboxImg.src = img.currentSrc || img.src;
    const caption = (img.alt || '').trim();
    if (caption && caption !== '这里写图片描述' && caption !== '说说配图' && caption !== 'Image') {
        siteLightboxCaption.textContent = caption;
        siteLightboxCaption.style.display = 'block';
    } else {
        siteLightboxCaption.textContent = '';
        siteLightboxCaption.style.display = 'none';
    }
    document.body.classList.add('lightbox-open');
    siteLightbox.classList.add('is-open');
    siteLightbox.focus();
}

function bindZoomableImage(img) {
    if (!img) return;
    img.classList.add('zoomable-img');
    const altText = (img.alt || '').trim();
    const hasMeaningfulAlt = altText && altText !== '这里写图片描述' && altText !== '说说配图' && altText !== 'Image';
    img.setAttribute('title', hasMeaningfulAlt ? `${altText}（点击放大）` : '点击放大图片');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', hasMeaningfulAlt ? `放大图片：${altText}` : '点击放大图片');

    img.addEventListener('click', (e) => {
        const parentLink = img.closest('a');
        if (parentLink) {
            e.preventDefault();
        }
        openLightbox(img);
    });

    img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(img);
        }
    });
}

// 文章页增强：代码块加复制按钮/语言标签 + TOC 滚动高亮 + 阅读进度条（仅 .post-body 存在时生效）
(function () {
    const postBody = document.querySelector('.post-body');
    if (!postBody) return;

    // 阅读进度条
    let progressBar = document.getElementById('readingProgress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'readingProgress';
        progressBar.className = 'reading-progress';
        progressBar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progressBar);
    }
    let progressTicking = false;
    const updateProgress = () => {
        const rect = postBody.getBoundingClientRect();
        const winH = window.innerHeight;
        const total = rect.height - winH * 0.4;
        const current = -rect.top;
        let pct = 0;
        if (total > 0) {
            pct = Math.min(100, Math.max(0, (current / total) * 100));
        }
        progressBar.style.width = pct.toFixed(1) + '%';
        progressBar.style.opacity = pct > 0 ? '1' : '0';
        progressTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (!progressTicking) {
            requestAnimationFrame(updateProgress);
            progressTicking = true;
        }
    }, { passive: true });
    updateProgress();

    // Clipboard API 仅在 HTTPS 等安全上下文可用，HTTP 环境降级 execCommand
    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
        } finally {
            ta.remove();
        }
    }

    postBody.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code || pre.parentElement.classList.contains('code-block')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        pre.before(wrapper);
        wrapper.appendChild(pre);

        const langMatch = (code.className || '').match(/language-([\w+-]+)/);
        if (langMatch) {
            const lang = document.createElement('span');
            lang.className = 'code-lang';
            lang.textContent = langMatch[1];
            wrapper.appendChild(lang);
        }

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.textContent = '复制';
        btn.addEventListener('click', async () => {
            try {
                await copyText(code.innerText);
                btn.textContent = '已复制';
                btn.classList.add('copied');
            } catch (e) {
                btn.textContent = '复制失败';
            }
            setTimeout(() => {
                btn.textContent = '复制';
                btn.classList.remove('copied');
            }, 1500);
        });
        wrapper.appendChild(btn);
    });

    const tocLinks = Array.from(document.querySelectorAll('.toc a'));
    if (tocLinks.length && 'IntersectionObserver' in window) {
        const map = new Map();
        tocLinks.forEach((a) => {
            const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
            const target = id && document.getElementById(id);
            if (target) map.set(target, a);
        });
        const setActive = (link) => {
            tocLinks.forEach((a) => a.classList.toggle('active', a === link));
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(map.get(entry.target));
            });
        }, { rootMargin: '-80px 0px -55% 0px' });
        map.forEach((_, target) => observer.observe(target));
    }

    // 图片点击放大预览（Lightbox）
    const postImages = postBody.querySelectorAll("img");
    postImages.forEach(bindZoomableImage);
})();

// 全局/文章页悬浮回到顶部按钮（滚动超过阈值淡入，点击平滑滚回顶部）
(function () {
    let topBtn = document.getElementById('floatTopBtn');
    if (!topBtn) {
        topBtn = document.createElement('button');
        topBtn.id = 'floatTopBtn';
        topBtn.className = 'float-top-btn';
        topBtn.type = 'button';
        topBtn.setAttribute('title', '回到顶部');
        topBtn.setAttribute('aria-label', '回到顶部');
        topBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
        document.body.appendChild(topBtn);
    }

    let ticking = false;
    const toggleBtn = () => {
        if (window.scrollY > 350) {
            topBtn.classList.add('visible');
        } else {
            topBtn.classList.remove('visible');
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(toggleBtn);
            ticking = true;
        }
    }, { passive: true });

    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 为页面中已有的 .back-to-top 链接绑定平滑滚动，避免改变 URL 哈希
    document.querySelectorAll('.back-to-top').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    toggleBtn();
})();

// 小红书名片弹层：点图标打开，点遮罩/×/Esc 关闭；焦点陷阱 + 关闭后焦点归还
(function () {
    const btn = document.getElementById('xhsBtn');
    const modal = document.getElementById('xhsModal');
    if (!btn || !modal) return;
    const closeBtn = document.getElementById('xhsClose');
    let lastFocused = null; // 打开前的焦点元素，关闭时归还

    const open = () => {
        lastFocused = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus(); // 焦点移入弹层
    };
    const close = () => {
        modal.hidden = true;
        document.body.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
        lastFocused = null;
    };
    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
        if (modal.hidden) return;
        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'Tab') {
            // 焦点陷阱：Tab 循环限制在弹层内（弹层内仅关闭按钮一个可聚焦元素，首尾相同）
            const items = modal.querySelectorAll('button, a[href]');
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
})();

// 巴萨近期赛程（ESPN 公开接口，免 Key、CORS 开放、非官方）：在「关于」卡底部渲染近 3 场；
// 失败/无数据时整块隐藏。队徽用 ESPN CDN（以球队数字 ID 拼接，缩写路径已实测 404）。
const BARCA_ESPN_ID = '83';

async function loadBarcaSchedule() {
    const wrap = document.getElementById('barcaSchedule');
    const section = document.getElementById('barca');
    if (!wrap) return;
    try {
        const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/${BARCA_ESPN_ID}/schedule?fixture=true`
        );
        if (!res.ok) return;
        const data = await res.json();
        const now = Date.now();
        const matches = (Array.isArray(data.events) ? data.events : [])
            .map((e) => {
                const comp = e.competitions && e.competitions[0];
                const teams = comp && Array.isArray(comp.competitors) ? comp.competitors : [];
                const barca = teams.find((t) => t && t.team && t.team.id === BARCA_ESPN_ID);
                const ts = new Date(e.date).getTime();
                if (!barca || teams.length < 2 || !Number.isFinite(ts) || ts <= now) return null;
                return {
                    ts,
                    isHome: barca.homeAway === 'home',
                    // 按足球惯例主队在前
                    teams: teams.map((t) => ({ id: t.team.id, name: t.team.displayName }))
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.ts - b.ts)
            .slice(0, 3);
        if (!matches.length) return;
        matches.forEach((m) => {
            const d = new Date(m.ts);
            const row = document.createElement('div');
            row.className = 'barca-match';

            const dateCol = document.createElement('div');
            dateCol.className = 'bm-date';
            const day = document.createElement('span');
            day.className = 'bm-day';
            day.textContent = `${d.getMonth() + 1}月${d.getDate()}日`;
            const sub = document.createElement('span');
            sub.className = 'bm-sub';
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            sub.textContent = `周${'日一二三四五六'[d.getDay()]} ${hh}:${mm}`;
            dateCol.append(day, sub);

            const makeTeam = (t, isHomeCell) => {
                const s = document.createElement('span');
                s.className = 'bm-team' + (t.id === BARCA_ESPN_ID ? ' is-barca' : '') + (isHomeCell ? ' is-home' : '');
                const img = document.createElement('img');
                img.className = 'bm-logo';
                img.loading = 'lazy';
                img.alt = '';
                img.src = `https://a.espncdn.com/i/teamlogos/soccer/500/${t.id}.png`;
                img.addEventListener('error', () => img.remove());
                const name = document.createElement('span');
                name.className = 'bm-name';
                name.textContent = t.name;
                // 主队 cell：队名在外、徽章贴 vs；客队 cell：徽章贴 vs、队名在外（vs 居中对称）
                if (isHomeCell) {
                    s.append(name, img);
                } else {
                    s.append(img, name);
                }
                return s;
            };
            const makeVs = () => {
                const vs = document.createElement('span');
                vs.className = 'bm-vs';
                vs.textContent = 'vs';
                return vs;
            };

            const venue = document.createElement('span');
            venue.className = 'bm-venue' + (m.isHome ? ' is-home' : '');
            venue.textContent = m.isHome ? '主场' : '客场';

            // 每行 5 个 cell：日期 | 主队 | vs | 客队 | 主客徽（配合 CSS subgrid 实现 vs 竖向对齐与徽章对称）
            row.append(dateCol, makeTeam(m.teams[0], true), makeVs(), makeTeam(m.teams[1], false), venue);
            wrap.append(row);
        });
        wrap.hidden = false;
        if (section) section.hidden = false;
    } catch (e) {
        // 接口失败或网络异常：保持隐藏，不打扰
    }
}

loadBarcaSchedule();

// Moments (说说) — 静态数据驱动（由 GitHub Actions 自动从 Issues 同步至 data/moments.json）
const MOMENTS_STATIC_URL = '/data/moments.json?v=1.3.16';
const MOMENTS_API_URL =
    'https://api.github.com/repos/mfcheer/mfcheer.github.io/issues?state=open&per_page=30&sort=created&direction=desc';
const MOMENTS_CACHE_KEY = 'momentsData_v2';
const MOMENTS_TIME_KEY = 'momentsTime_v2';
const MOMENTS_TTL = 60 * 1000; // 本地缓存 1 分钟，配合 Service Worker Stale-While-Revalidate 实现 0ms 秒开

/**
 * 解析说说内容：
 * 1. 自动过滤 Issue 模板自带的表单标记（如 ### 想说的话）
 * 2. 提取并分离图片（支持 HTML <img> 标签、Markdown ![](url) 语法、独立附件链接）
 * 3. 返回纯文本内容 text 与图片附件数组 images [{ src, alt }]
 */
function parseMomentContent(raw, fallbackTitle = '') {
    if (!raw) return { text: '', images: [] };
    let clean = raw.replace(/^#{1,4}\s*想说的话\s*[\r\n]*/gm, '').trim();

    const images = [];
    const seenSrcs = new Set();
    const addImage = (src, alt = '') => {
        const trimmedSrc = (src || '').trim();
        if (!trimmedSrc || !/^https?:\/\//i.test(trimmedSrc)) return;
        if (!seenSrcs.has(trimmedSrc)) {
            seenSrcs.add(trimmedSrc);
            images.push({
                src: trimmedSrc,
                alt: (alt || '').trim()
            });
        }
    };

    // 1. 匹配 HTML img 标签
    clean = clean.replace(/<img\b([^>]*?)\/?>/gi, (_, attrs) => {
        const srcMatch = attrs.match(/src=["'](https?:\/\/[^"'\s]+)["']/i);
        const altMatch = attrs.match(/alt=["']([^"'*]*)["']/i);
        if (srcMatch) {
            addImage(srcMatch[1], altMatch ? altMatch[1] : '');
            return '';
        }
        return '';
    });

    // 2. 匹配 Markdown 图片语法: ![alt](url)
    clean = clean.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/gi, (_, alt, src) => {
        addImage(src, alt);
        return '';
    });

    // 3. 匹配单独成行的 GitHub 附件链接
    clean = clean.replace(/^(https?:\/\/(?:github\.com\/user-attachments\/assets\/|user-images\.githubusercontent\.com\/)[^\s]+)$/gmi, (_, src) => {
        addImage(src, '');
        return '';
    });

    // 4. 清理多余空行与首尾空白
    clean = clean.replace(/\n{3,}/g, '\n\n').trim();

    // 5. 若正文完全为图片，且有自定义标题（非系统模板标题），可用标题作为说说文本兜底
    if (!clean && (!images.length || (fallbackTitle && fallbackTitle !== '✨ 说说'))) {
        if (fallbackTitle && fallbackTitle !== '✨ 说说') {
            clean = fallbackTitle.trim();
        }
    }

    return { text: clean, images };
}

function normalizeMomentItem(it) {
    if (!it) return null;
    let images = Array.isArray(it.images) ? it.images : [];
    let text = typeof it.text === 'string' ? it.text : '';
    if (!images.length && text) {
        const parsed = parseMomentContent(text);
        if (parsed.images.length || parsed.text !== text) {
            text = parsed.text;
            images = parsed.images;
        }
    }
    // 关键保底：自动将任何 GitHub 附件链接重写为本地同源 assets/moments/ 静态路径
    // 即使手机端读到旧缓存或 API 动态回退结果，也能在国内网络与移动端顺畅秒开
    images = images.map((img) => {
        if (!img || !img.src) return null;
        let src = String(img.src).trim();
        const ghMatch = src.match(/user-attachments\/assets\/([0-9a-fA-F-]+)/i);
        if (ghMatch) {
            src = `assets/moments/${ghMatch[1].toLowerCase()}.jpg`;
        }
        return {
            ...img,
            src
        };
    }).filter(Boolean);

    return {
        ...it,
        text,
        images
    };
}

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

let momentsAll = []; // 全量说说数据
let momentsFilter = null; // 当前筛选的标签；null = 显示全部

function renderMomentsState(state = 'ok') {
    const listEl = document.getElementById('momentList');
    const countEl = document.getElementById('momentCount');
    if (!listEl) return;
    listEl.innerHTML = '';

    const list = momentsFilter
        ? momentsAll.filter((m) => (m.labels || []).includes(momentsFilter))
        : momentsAll;

    if (countEl) {
        countEl.textContent = momentsFilter
            ? `#${momentsFilter} · ${list.length} 条`
            : `共 ${momentsAll.length} 条`;
    }

    // 加载失败（限流/网络异常）且无缓存可用：给出明确失败态，而非误显示「还没有说说」
    if (state === 'error') {
        const err = document.createElement('p');
        err.className = 'moment-empty';
        err.textContent = '说说加载失败了，请稍后重试';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'moment-retry';
        retry.textContent = '重新加载';
        retry.addEventListener('click', () => {
            retry.disabled = true;
            retry.textContent = '加载中…';
            loadMoments();
        });
        listEl.append(err, retry);
        return;
    }

    // 首页「查看更多」按钮状态联动（无数据或出错时隐藏）
    const moreLink = document.querySelector('.card-moments .moment-all');
    if (moreLink) {
        moreLink.style.display = (!momentsAll.length || state === 'error') ? 'none' : '';
    }

    if (!momentsAll.length) {
        const empty = document.createElement('p');
        empty.className = 'moment-empty';
        empty.textContent = '还没有说说，敬请期待';
        listEl.append(empty);
        return;
    }

    // 筛选中：顶部显示筛选条，可取消
    if (momentsFilter) {
        const bar = document.createElement('div');
        bar.className = 'moment-filterbar';
        const chip = document.createElement('span');
        chip.textContent = `只看 #${momentsFilter}`;
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'moment-filter-clear';
        clear.textContent = '取消筛选 ✕';
        clear.addEventListener('click', () => {
            momentsFilter = null;
            renderMomentsState();
        });
        bar.append(chip, clear);
        listEl.append(bar);
    } else if (!list.length) {
        const empty = document.createElement('p');
        empty.className = 'moment-empty';
        empty.textContent = '该标签下暂无说说';
        listEl.append(empty);
        return;
    }

    // 若容器指定了 data-limit（如首页限制显示最近 10 条），在非筛选状态下截取前 N 条
    const limit = parseInt(listEl.dataset.limit, 10);
    const displayList = (!Number.isNaN(limit) && limit > 0 && !momentsFilter)
        ? list.slice(0, limit)
        : list;

    displayList.forEach((m, itemIndex) => {
        const item = document.createElement('div');
        item.className = 'moment-item';

        const head = document.createElement('div');
        head.className = 'moment-head';
        if (m.avatar && m.name) {
            const avatar = document.createElement('img');
            avatar.className = 'moment-avatar';
            avatar.src = m.avatar;
            avatar.alt = m.name;
            avatar.loading = 'lazy';
            avatar.referrerPolicy = 'no-referrer';
            const name = document.createElement('span');
            name.className = 'moment-name';
            name.textContent = m.name; // 仅用 textContent，防 XSS
            head.append(avatar, name);
        }
        // 标签胶囊：点击进入筛选（发布模板自带的 moment 标签已在数据层排除）
        (m.labels || []).forEach((label) => {
            const tag = document.createElement('button');
            tag.type = 'button';
            tag.className = 'moment-tag';
            tag.textContent = `#${label}`;
            tag.addEventListener('click', () => {
                momentsFilter = label;
                renderMomentsState();
            });
            head.append(tag);
        });
        const date = document.createElement('span');
        date.className = 'moment-date';
        date.textContent = m.date;
        head.append(date);

        item.append(head);

        // 兼容处理：若条目缺少 images 字段，尝试即时从 text 解析提取
        let momentText = m.text || '';
        let momentImages = Array.isArray(m.images) ? m.images : [];
        if ((!m.images || !m.images.length) && momentText) {
            const parsed = parseMomentContent(momentText);
            if (parsed.images.length || parsed.text !== momentText) {
                momentText = parsed.text;
                momentImages = parsed.images;
            }
        }

        if (momentText) {
            const text = document.createElement('p');
            text.className = 'moment-text';
            // 正文中的 URL 自动转为可点击链接；仅用 createElement/textContent，防 XSS
            const URL_RE = /(https?:\/\/[^\s]+)/g;
            const TRAILING_PUNCT_RE = /[.,;:!?)\]}'"\u3001\u3002\uFF0C\uFF1F\uFF01\uFF1B\uFF1A\uFF09\u3011\u300B\u201D\u2019]+$/;
            let cursor = 0;
            let match;
            while ((match = URL_RE.exec(momentText)) !== null) {
                let url = match[0];
                const punctMatch = url.match(TRAILING_PUNCT_RE);
                const punct = punctMatch ? punctMatch[0] : '';
                if (punct) {
                    url = url.slice(0, -punct.length);
                }
                if (match.index > cursor) {
                    text.append(document.createTextNode(momentText.slice(cursor, match.index)));
                }
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noreferrer';
                link.textContent = url;
                text.append(link);
                if (punct) {
                    text.append(document.createTextNode(punct));
                }
                cursor = match.index + match[0].length;
            }
            if (cursor === 0) {
                text.textContent = momentText; // 无 URL，直接整段赋值
            } else if (cursor < momentText.length) {
                text.append(document.createTextNode(momentText.slice(cursor)));
            }
            item.append(text);
        }

        if (momentImages && momentImages.length) {
            const gallery = document.createElement('div');
            gallery.className = 'moment-gallery';
            gallery.dataset.count = Math.min(momentImages.length, 9);

            momentImages.forEach((imgObj) => {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'moment-img-wrap';

                const img = document.createElement('img');
                img.className = 'moment-img zoomable-img';
                const rawSrc = (imgObj.src || '').trim();
                // 确保相对路径能正确解析为站点根相对路径
                img.src = rawSrc.startsWith('http') || rawSrc.startsWith('/') ? rawSrc : '/' + rawSrc;
                img.alt = imgObj.alt || '说说配图';
                // 前部说说采用 eager 加载，避免移动端 WebKit 0 盒模型下 lazy 观察器不触发的问题
                img.loading = itemIndex < 3 ? 'eager' : 'lazy';
                img.decoding = 'async';
                img.referrerPolicy = 'no-referrer';

                let retried = false;
                img.addEventListener('error', () => {
                    // 若本地静态路径加载失败，回退尝试原始 GitHub 附件 URL
                    if (!retried && rawSrc && !rawSrc.startsWith('http')) {
                        const ghUuid = rawSrc.match(/([0-9a-fA-F-]+)\.\w+$/);
                        if (ghUuid) {
                            retried = true;
                            img.src = `https://github.com/user-attachments/assets/${ghUuid[1]}`;
                            return;
                        }
                    }
                    imgWrap.style.display = 'none';
                });

                bindZoomableImage(img);

                imgWrap.append(img);
                gallery.append(imgWrap);
            });

            item.append(gallery);
        }

        listEl.append(item);
    });
}

function readMomentsCache() {
    try {
        // 清理旧版本缓存键，避免残留脏数据影响
        localStorage.removeItem('momentsData');
        localStorage.removeItem('momentsTime');
        localStorage.removeItem('momentsEtag');

        const raw = localStorage.getItem(MOMENTS_CACHE_KEY);
        const list = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(list) || list.some((m) => !m || typeof m.name !== 'string')) {
            localStorage.removeItem(MOMENTS_CACHE_KEY);
            localStorage.removeItem(MOMENTS_TIME_KEY);
            return null;
        }
        return list.map(normalizeMomentItem).filter(Boolean);
    } catch (e) {
        return null;
    }
}

function writeMomentsCache(list) {
    try {
        localStorage.setItem(MOMENTS_CACHE_KEY, JSON.stringify(list));
        localStorage.setItem(MOMENTS_TIME_KEY, String(Date.now()));
    } catch (e) {
        // 隐私模式等存储异常时忽略，不影响展示
    }
}

async function loadMoments() {
    const cached = readMomentsCache();
    const lastTime = Number(localStorage.getItem(MOMENTS_TIME_KEY) || 0);
    const isFresh = cached && Date.now() - lastTime < MOMENTS_TTL;

    if (isFresh) {
        momentsAll = cached;
        renderMomentsState();
        return;
    }
    if (cached) {
        momentsAll = cached;
        renderMomentsState(); // 优先展示缓存，后台静默拉取更新
    }

    try {
        // 1. 优先拉取同源静态 JSON（0 限流风险、国内极速访问、支持 PWA 离线）
        const res = await fetch(MOMENTS_STATIC_URL, { cache: 'no-cache' });
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
                momentsAll = list.map(normalizeMomentItem).filter(Boolean);
                renderMomentsState();
                writeMomentsCache(momentsAll);
                return;
            }
        }
    } catch (e) {
        // 静态文件网络异常时静默降级
    }

    // 2. 降级容灾：若静态文件拉取失败且无本地有效缓存，尝试请求 GitHub Issues API
    if (!cached || !cached.length) {
        try {
            const apiRes = await fetch(MOMENTS_API_URL, { cache: 'no-store' });
            if (apiRes.ok) {
                const issues = await apiRes.json();
                const list = (Array.isArray(issues) ? issues : [])
                    .filter((it) => {
                        if (!it || it.pull_request) return false;
                        const isOwner =
                            it.author_association === "OWNER" ||
                            (it.user && it.user.login && it.user.login.toLowerCase() === "mfcheer");
                        return Boolean(isOwner);
                    })
                    .map((it) => {
                        const rawContent = ((it.body || '').trim() || (it.title || '')).trim();
                        const { text, images } = parseMomentContent(rawContent, it.title);
                        return {
                            date: formatMomentDate(it.created_at),
                            text,
                            images,
                            name: it.user && it.user.login,
                            avatar: it.user && it.user.avatar_url,
                            labels: (Array.isArray(it.labels) ? it.labels : [])
                                .map((l) => l && l.name)
                                .filter((n) => typeof n === 'string' && n && n !== 'moment')
                        };
                    })
                    .filter((m) => m.text || (m.images && m.images.length));
                momentsAll = list;
                renderMomentsState();
                writeMomentsCache(list);
                return;
            }
        } catch (e) {
            // API 请求亦失败
        }
    }

    if (!cached) {
        renderMomentsState('error');
    }
}

loadMoments();

// 书影音统计行：真实累计数来自 data/media-stats.json（维护时从豆瓣主页同步，流程见 README）；
// 页面上每列只展示 5 条，用 DOM 计数会不准。读取失败则保持隐藏，宁缺毋假。
async function renderMediaStats() {
    const statsEl = document.getElementById('mediaStats');
    if (!statsEl) return;
    try {
        const res = await fetch('/data/media-stats.json', { cache: 'no-cache' });
        if (!res.ok) return;
        const stats = await res.json();
        const parts = [];
        if (typeof stats.movies === 'number') parts.push(`看过 ${stats.movies} 部电影`);
        if (typeof stats.books === 'number') parts.push(`读过 ${stats.books} 本书`);
        if (typeof stats.games === 'number') parts.push(`玩过 ${stats.games} 款游戏`);
        if (parts.length) {
            statsEl.textContent = `豆瓣累计 ${parts.join(' · ')}`;
            statsEl.hidden = false;
        }
    } catch (e) {
        // 保持 hidden：不显示不准确的数据
    }
}

renderMediaStats();


// Giscus 评论区（基于 GitHub Discussions；主题跟随站点深浅色）
// 前置条件：仓库需开启 Discussions 并安装 giscus App（github.com/apps/giscus）
const GISCUS_REPO = 'mfcheer/mfcheer.github.io';
const GISCUS_REPO_ID = 'R_kgDOQ-YRwg';
const GISCUS_CATEGORY = 'General';
const GISCUS_CATEGORY_ID = 'DIC_kwDOQ-YRws4DKVoQ'; // Discussions · General 分类

function giscusTheme(theme) {
    return theme === 'dark' ? 'transparent_dark' : 'light';
}

function initGiscus() {
    const box = document.getElementById('giscusBox');
    if (!box || !GISCUS_CATEGORY_ID) return; // 分类 ID 未配置前不渲染，避免页面上出现报错组件
    const s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    const attrs = {
        'data-repo': GISCUS_REPO,
        'data-repo-id': GISCUS_REPO_ID,
        'data-category': GISCUS_CATEGORY,
        'data-category-id': GISCUS_CATEGORY_ID,
        'data-mapping': 'pathname',
        'data-strict': '0',
        'data-reactions-enabled': '1',
        'data-emit-metadata': '0',
        'data-input-position': 'top',
        'data-theme': giscusTheme(currentTheme),
        'data-lang': 'zh-CN',
        'data-loading': 'lazy'
    };
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    box.append(s);
}

function syncGiscusTheme(theme) {
    const frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme(theme) } } },
        'https://giscus.app'
    );
}

// 默认折叠留言区：点击展开时才首次挂载 giscus（省篇幅 + 首屏少一个 iframe），可再点收起
(function () {
    const toggle = document.getElementById('giscusToggle');
    const box = document.getElementById('giscusBox');
    if (!toggle || !box) return;
    let loaded = false;
    toggle.addEventListener('click', () => {
        const expand = box.hidden;
        if (expand && !loaded) {
            initGiscus();
            loaded = true;
        }
        box.hidden = !expand;
        toggle.setAttribute('aria-expanded', String(expand));
        const textEl = toggle.querySelector('.giscus-toggle-text');
        if (textEl) textEl.textContent = expand ? '收起留言区' : '展开留言区';
    });
})();

// 文章页（无折叠开关）直接挂载评论区；首页由上面的开关懒加载
(function () {
    const box = document.getElementById('giscusBox');
    if (!box || document.getElementById('giscusToggle')) return;
    initGiscus();
})();

// ============================================================
// PWA: Service Worker 注册与生命周期管理
// ============================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js') // 绝对路径：文章页在 /blog/<slug>/ 子目录下也能正确注册
            .then((reg) => {
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA] 网站已有新版本并在后台缓存完毕');
                            }
                        };
                    }
                };
            })
            .catch((err) => {
                console.warn('[PWA] ServiceWorker 注册失败:', err);
            });
    });
}

// ============================================================
// 说说站内发布与博主认证浮层 (Moment Publish & Auth Modal)
// ============================================================

const GITHUB_OAUTH_CLIENT_ID_KEY = "mfcheer_github_oauth_client_id";
const GITHUB_OAUTH_PROXY_KEY = "mfcheer_github_oauth_proxy";

function getOAuthConfig() {
    return {
        clientId: localStorage.getItem(GITHUB_OAUTH_CLIENT_ID_KEY) || "Ov23liXXXXXXXXXX",
        proxy: localStorage.getItem(GITHUB_OAUTH_PROXY_KEY) || "https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token"
    };
}

// 检查页面 URL 中是否携带 OAuth 重定向的 code 参数
async function checkOAuthCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (!code) return;

        // 清理地址栏 query，保持整洁
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        openMomentModal();
        const statusEl = document.getElementById("momentAuthStatus");
        if (statusEl) {
            statusEl.className = "moment-modal-status is-loading";
            statusEl.textContent = "正在通过 GitHub 授权登录完成认证…";
            statusEl.style.display = "block";
        }

        const oauthConfig = getOAuthConfig();
        if (!oauthConfig.proxy) {
            throw new Error("未配置 OAuth 代理服务地址");
        }

        const res = await fetch(oauthConfig.proxy, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: code,
                client_id: oauthConfig.clientId
            })
        });

        const data = await res.json().catch(() => ({}));
        const token = data.access_token || data.token;
        if (!token) {
            throw new Error(data.error_description || data.error || "授权换取 Token 失败，请检查 OAuth 代理配置");
        }

        // 验证用户身份
        const userRes = await fetch("https://api.github.com/user", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github+json"
            }
        });
        const user = await userRes.json();
        if (!user || !user.login || user.login.toLowerCase() !== "mfcheer") {
            throw new Error(`当前授权账号 (@${user ? user.login : "未知"}) 不是博主本人，无权发布说说`);
        }

        setMomentAuth(token, user);
        showMomentToast("🎉 欢迎回来，博主 mfcheer！已成功登录。");
        renderMomentModalContent();
    } catch (e) {
        const statusEl = document.getElementById("momentAuthStatus");
        if (statusEl) {
            statusEl.className = "moment-modal-status is-error";
            statusEl.textContent = e.message || "OAuth 授权登录失败，请使用备用方式登录";
            statusEl.style.display = "block";
        }
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkOAuthCallback);
} else {
    checkOAuthCallback();
}

const MOMENT_AUTH_TOKEN_KEY = "mfcheer_moment_auth_token";
const MOMENT_AUTH_USER_KEY = "mfcheer_moment_auth_user";

let momentModalBackdrop = null;
let selectedMomentFiles = [];
let selectedMomentTags = new Set();

function getMomentAuth() {
    try {
        const token = localStorage.getItem(MOMENT_AUTH_TOKEN_KEY);
        const userRaw = localStorage.getItem(MOMENT_AUTH_USER_KEY);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return token ? { token, user } : null;
    } catch (e) {
        return null;
    }
}

function setMomentAuth(token, user) {
    try {
        localStorage.setItem(MOMENT_AUTH_TOKEN_KEY, token);
        if (user) {
            localStorage.setItem(MOMENT_AUTH_USER_KEY, JSON.stringify(user));
        }
    } catch (e) {}
}

function clearMomentAuth() {
    try {
        localStorage.removeItem(MOMENT_AUTH_TOKEN_KEY);
        localStorage.removeItem(MOMENT_AUTH_USER_KEY);
    } catch (e) {}
}

function showMomentToast(msg, isSuccess = true) {
    let toast = document.getElementById("momentToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "momentToast";
        toast.className = "moment-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove("is-show");
    }, 3200);
}

function createMomentModal() {
    if (momentModalBackdrop) return;

    momentModalBackdrop = document.createElement("div");
    momentModalBackdrop.id = "momentModal";
    momentModalBackdrop.className = "moment-modal-backdrop";
    momentModalBackdrop.setAttribute("role", "dialog");
    momentModalBackdrop.setAttribute("aria-modal", "true");

    const card = document.createElement("div");
    card.className = "moment-modal-card";
    card.id = "momentModalCard";

    momentModalBackdrop.appendChild(card);
    document.body.appendChild(momentModalBackdrop);

    momentModalBackdrop.addEventListener("click", (e) => {
        if (e.target === momentModalBackdrop) {
            closeMomentModal();
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && momentModalBackdrop.classList.contains("is-open")) {
            closeMomentModal();
        }
    });
}

function closeMomentModal() {
    if (!momentModalBackdrop) return;
    momentModalBackdrop.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    selectedMomentFiles = [];
    selectedMomentTags.clear();
}

function openMomentModal() {
    createMomentModal();
    renderMomentModalContent();
    momentModalBackdrop.classList.add("is-open");
    document.body.classList.add("lightbox-open");
}

function renderMomentModalContent() {
    const card = document.getElementById("momentModalCard");
    if (!card) return;
    card.innerHTML = "";

    const auth = getMomentAuth();

    if (!auth || !auth.token) {
        // 渲染未登录 / 认证视图（支持 GitHub 一键登录与备用 Token）
        card.innerHTML = `
            <div class="moment-modal-header">
                <div class="moment-modal-title-wrap">
                    <span class="moment-modal-icon">🔐</span>
                    <h3 class="moment-modal-title">博主身份认证</h3>
                </div>
                <button class="moment-modal-close" type="button" aria-label="关闭">&times;</button>
            </div>
            <div class="moment-modal-body">
                <p class="moment-auth-desc">说说发布为博主专属功能。点击下方按钮使用 GitHub 账号一键授权登录，无需手动复制或配置 Token。</p>
                
                <button type="button" class="moment-btn-github" id="momentGithubOAuthBtn">
                    <svg class="moment-gh-icon" height="20" width="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9 1.08 1.48.33.56.98.81 1.77.81.41 0 .78-.06 1.06-.14 0 .71.01 1.34.01 1.58 0 .22-.15.47-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z"/>
                    </svg>
                    <span>使用 GitHub 账号登录</span>
                </button>

                <div class="moment-modal-status" id="momentAuthStatus" style="display:none;"></div>

                <div class="moment-manual-token-section">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <a href="https://github.com/mfcheer/mfcheer.github.io/issues/new?template=moment.yml" target="_blank" rel="noreferrer" class="moment-manual-token-toggle" id="momentIssueFallbackLink" style="display:inline-flex; align-items:center; gap:4px; margin:0; text-decoration:underline;">
                            <span>或直接前往 GitHub 提 Issue 发布</span>
                            <span>↗</span>
                        </a>
                        <button type="button" class="moment-manual-token-toggle" id="momentOAuthConfigToggle" style="text-decoration:none; opacity:0.75; margin:0;" title="配置 OAuth Client ID 或代理地址">OAuth 设置 ⚙️</button>
                    </div>
                </div>

                <p class="moment-visitor-note" style="margin-top:14px;">普通访客读者如有互动需求，欢迎前往页面下方「留言区」交流探讨。</p>
            </div>
        `;

        const closeBtn = card.querySelector(".moment-modal-close");
        const oauthBtn = card.querySelector("#momentGithubOAuthBtn");
        const oauthConfigBtn = card.querySelector("#momentOAuthConfigToggle");
        const issueFallbackLink = card.querySelector("#momentIssueFallbackLink");
        const statusEl = card.querySelector("#momentAuthStatus");

        closeBtn.addEventListener("click", closeMomentModal);

        if (issueFallbackLink) {
            issueFallbackLink.addEventListener("click", () => {
                closeMomentModal();
            });
        }

        oauthConfigBtn.addEventListener("click", () => {
            const config = getOAuthConfig();
            const newClientId = prompt("GitHub OAuth Client ID：", config.clientId || "");
            if (newClientId !== null) {
                localStorage.setItem(GITHUB_OAUTH_CLIENT_ID_KEY, newClientId.trim());
            }
            const newProxy = prompt("GitHub OAuth Gatekeeper/Proxy 代理服务地址：", config.proxy || "");
            if (newProxy !== null) {
                localStorage.setItem(GITHUB_OAUTH_PROXY_KEY, newProxy.trim());
            }
            showMomentToast("OAuth 参数已更新");
        });

        oauthBtn.addEventListener("click", () => {
            const config = getOAuthConfig();
            if (!config.clientId || config.clientId.includes("XXXX")) {
                const inputId = prompt(
                    "【初次使用 GitHub 授权登录】\n" +
                    "请填入你的 GitHub OAuth App Client ID（只需填一次，保存在当前设备）：\n\n" +
                    "💡 如未配置，可点取消并点击「直接前往 GitHub 提 Issue 发布」；\n" +
                    "也可配置 Client ID 与 Worker 代理体验全自动一键授权。"
                );
                if (!inputId || !inputId.trim()) {
                    return;
                }
                localStorage.setItem(GITHUB_OAUTH_CLIENT_ID_KEY, inputId.trim());
                config.clientId = inputId.trim();
            }

            // 跳转 GitHub 授权
            const redirectUri = window.location.origin + window.location.pathname;
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(config.clientId)}&scope=public_repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location.href = authUrl;
        });

        return;
    }

    // 渲染已认证发布视图
    const user = auth.user || { login: "mfcheer", avatar_url: "avatar.jpg" };
    card.innerHTML = `
        <div class="moment-modal-header">
            <div class="moment-user-badge">
                <img class="moment-modal-avatar" src="${user.avatar_url || "avatar.jpg"}" alt="${user.login || "mfcheer"}">
                <div class="moment-user-info">
                    <span class="moment-user-name">${user.login || "mfcheer"}</span>
                    <span class="moment-user-tag">博主已认证</span>
                </div>
            </div>
            <button class="moment-modal-close" type="button" aria-label="关闭">&times;</button>
        </div>
        <div class="moment-modal-body">
            <textarea id="momentTextInput" class="moment-textarea" placeholder="记录这一刻的想法、生活随想或灵感..." rows="4"></textarea>
            
            <div class="moment-img-picker-wrap">
                <div class="moment-img-previews" id="momentImgPreviews"></div>
                <label class="moment-add-img-btn" id="momentAddImgBtn" title="添加配图">
                    <input type="file" id="momentFileInput" accept="image/*" multiple hidden>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>添加图片</span>
                </label>
            </div>

            <div class="moment-tags-picker">
                <span class="moment-tags-label">标签：</span>
                <div class="moment-tag-chips" id="momentTagChips">
                    <button type="button" class="moment-chip" data-tag="生活">#生活</button>
                    <button type="button" class="moment-chip" data-tag="技术">#技术</button>
                    <button type="button" class="moment-chip" data-tag="随笔">#随笔</button>
                    <button type="button" class="moment-chip" data-tag="折腾">#折腾</button>
                    <button type="button" class="moment-chip" data-tag="思考">#思考</button>
                </div>
            </div>

            <div class="moment-modal-status" id="momentPublishStatus" style="display:none;"></div>

            <div class="moment-modal-footer">
                <button type="button" class="moment-logout-link" id="momentLogoutBtn" title="退出身份并清除本地保存的 Token">退出登录</button>
                <div class="moment-modal-btns">
                    <button type="button" class="moment-btn moment-btn-cancel" id="momentPublishCancelBtn">取消</button>
                    <button type="button" class="moment-btn moment-btn-primary" id="momentSubmitBtn">发布说说</button>
                </div>
            </div>
        </div>
    `;

    const closeBtn = card.querySelector(".moment-modal-close");
    const cancelBtn = card.querySelector("#momentPublishCancelBtn");
    const submitBtn = card.querySelector("#momentSubmitBtn");
    const textInput = card.querySelector("#momentTextInput");
    const fileInput = card.querySelector("#momentFileInput");
    const previewsWrap = card.querySelector("#momentImgPreviews");
    const statusEl = card.querySelector("#momentPublishStatus");
    const logoutBtn = card.querySelector("#momentLogoutBtn");
    const tagChips = card.querySelectorAll(".moment-chip");

    closeBtn.addEventListener("click", closeMomentModal);
    cancelBtn.addEventListener("click", closeMomentModal);

    logoutBtn.addEventListener("click", () => {
        if (confirm("确定退出博主身份并清除本地保存的 Token 吗？")) {
            clearMomentAuth();
            showMomentToast("已退出博主身份");
            renderMomentModalContent();
        }
    });

    tagChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const tag = chip.dataset.tag;
            if (selectedMomentTags.has(tag)) {
                selectedMomentTags.delete(tag);
                chip.classList.remove("is-selected");
            } else {
                selectedMomentTags.add(tag);
                chip.classList.add("is-selected");
            }
        });
    });

    fileInput.addEventListener("change", async () => {
        const files = Array.from(fileInput.files || []);
        if (!files.length) return;
        for (const file of files) {
            if (selectedMomentFiles.length >= 9) {
                alert("最多支持上传 9 张配图");
                break;
            }
            try {
                const { dataUrl, base64 } = await compressMomentImage(file);
                selectedMomentFiles.push({ file, dataUrl, base64 });
            } catch (e) {
                console.warn("图片解析压缩失败:", e);
            }
        }
        fileInput.value = "";
        renderSelectedPreviews(previewsWrap);
    });

    submitBtn.addEventListener("click", async () => {
        const text = (textInput.value || "").trim();
        if (!text && !selectedMomentFiles.length) {
            statusEl.className = "moment-modal-status is-error";
            statusEl.textContent = "请输入说说内容或选择配图";
            statusEl.style.display = "block";
            textInput.focus();
            return;
        }

        submitBtn.disabled = true;
        statusEl.className = "moment-modal-status is-loading";
        statusEl.style.display = "block";

        try {
            const uploadedImageUrls = [];
            for (let i = 0; i < selectedMomentFiles.length; i++) {
                statusEl.textContent = `正在上传第 ${i + 1}/${selectedMomentFiles.length} 张配图…`;
                const item = selectedMomentFiles[i];
                const filename = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
                const uploadedPath = await uploadMomentImage(auth.token, filename, item.base64);
                uploadedImageUrls.push({ src: uploadedPath, alt: "Image" });
            }

            statusEl.textContent = "正在发布说说…";
            let issueBody = text;
            if (uploadedImageUrls.length) {
                const imgMarkdown = uploadedImageUrls
                    .map((img) => `<img src="${img.src}" alt="${img.alt}">`)
                    .join("\n\n");
                issueBody = issueBody ? `${issueBody}\n\n${imgMarkdown}` : imgMarkdown;
            }

            const now = new Date();
            const dateStr = formatMomentDate(now.toISOString());
            const labels = ["moment", ...Array.from(selectedMomentTags)];

            await createMomentIssue(auth.token, `✨ 说说 · ${dateStr}`, issueBody, labels);

            // 乐观 UI 呈现：即刻插在说说列表首位
            const newMoment = {
                date: dateStr,
                text: text,
                name: user.login || "mfcheer",
                avatar: user.avatar_url || "avatar.jpg",
                labels: Array.from(selectedMomentTags),
                images: uploadedImageUrls
            };
            momentsAll.unshift(newMoment);
            writeMomentsCache(momentsAll);
            renderMomentsState();

            closeMomentModal();
            showMomentToast("🎉 说说发布成功！已在页面实时展示。");
        } catch (err) {
            statusEl.className = "moment-modal-status is-error";
            statusEl.textContent = err.message || "发布失败，请重试";
            statusEl.style.display = "block";
            submitBtn.disabled = false;
        }
    });

    setTimeout(() => textInput.focus(), 100);
}

function compressMomentImage(file, maxDimension = 1600, quality = 0.82) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL("image/jpeg", quality);
                const base64 = dataUrl.split(",")[1];
                resolve({ dataUrl, base64 });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderSelectedPreviews(container) {
    if (!container) return;
    container.innerHTML = "";
    selectedMomentFiles.forEach((item, index) => {
        const wrap = document.createElement("div");
        wrap.className = "moment-thumb-item";
        wrap.innerHTML = `
            <img class="moment-thumb-img" src="${item.dataUrl}" alt="预览">
            <button class="moment-thumb-del" type="button" title="删除图片">&times;</button>
        `;
        wrap.querySelector(".moment-thumb-del").addEventListener("click", (e) => {
            e.stopPropagation();
            selectedMomentFiles.splice(index, 1);
            renderSelectedPreviews(container);
        });
        container.appendChild(wrap);
    });
}

async function uploadMomentImage(token, filename, base64Content) {
    const url = `https://api.github.com/repos/mfcheer/mfcheer.github.io/contents/assets/moments/${filename}`;
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            message: `feat(moments): 上传说说配图 ${filename}`,
            content: base64Content
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `图片上传失败 (${res.status})`);
    }
    return `assets/moments/${filename}`;
}

async function createMomentIssue(token, title, body, labels) {
    const url = "https://api.github.com/repos/mfcheer/mfcheer.github.io/issues";
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            title,
            body,
            labels
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `创建 Issue 失败 (${res.status})`);
    }
    return await res.json();
}

// 绑定全局写一条按钮点击事件
document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".moment-write-trigger, #momentWriteBtn");
    if (trigger) {
        e.preventDefault();
        openMomentModal();
    }
});
