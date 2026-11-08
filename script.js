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

// Moments (说说) — GitHub Issues as CMS
// 发布方式：在本仓库创建 Issue（正文优先，标题兜底），所有 Open 状态的 Issue 均展示（自动排除 PR）
const MOMENTS_API_URL =
    'https://api.github.com/repos/mfcheer/mfcheer.github.io/issues?state=open&per_page=20&sort=created&direction=desc';
const MOMENTS_CACHE_KEY = 'momentsData';
const MOMENTS_ETAG_KEY = 'momentsEtag';
const MOMENTS_TIME_KEY = 'momentsTime';
const MOMENTS_TTL = 30 * 1000; // 仅 30 秒内直接用缓存；过期后带 ETag 条件请求重新验证（304 不计入 API 限流，近乎实时）

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
    if (Array.isArray(it.images)) return it;
    const raw = typeof it.text === 'string' ? it.text : '';
    const parsed = parseMomentContent(raw);
    return {
        ...it,
        text: parsed.text,
        images: parsed.images
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
        err.textContent = '说说加载失败了（可能是 GitHub 接口限流）';
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

    list.forEach((m) => {
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
                img.src = imgObj.src;
                img.alt = imgObj.alt || '说说配图';
                img.loading = 'lazy';
                img.referrerPolicy = 'no-referrer';

                img.addEventListener('error', () => {
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
        const raw = localStorage.getItem(MOMENTS_CACHE_KEY);
        const list = raw ? JSON.parse(raw) : null;
        // 兼容旧版缓存：旧条目缺少 name 字段（无头像/昵称），视为无效，
        // 同时清除配套的 ETag/时间戳，避免 If-None-Match 命中 304 后永远沿用旧格式
        if (!Array.isArray(list) || list.some((m) => !m || typeof m.name !== 'string')) {
            localStorage.removeItem(MOMENTS_CACHE_KEY);
            localStorage.removeItem(MOMENTS_ETAG_KEY);
            localStorage.removeItem(MOMENTS_TIME_KEY);
            return null;
        }
        return list.map(normalizeMomentItem).filter(Boolean);
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
        momentsAll = cached;
        renderMomentsState();
        return;
    }
    if (cached) {
        momentsAll = cached;
        renderMomentsState(); // 先渲染旧数据，请求成功后再更新
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
                .map((it) => {
                    const rawContent = ((it.body || '').trim() || (it.title || '')).trim();
                    const { text, images } = parseMomentContent(rawContent, it.title);
                    return {
                        date: formatMomentDate(it.created_at),
                        text,
                        images,
                        name: it.user && it.user.login,
                        avatar: it.user && it.user.avatar_url,
                        // 标签用于前端筛选；排除发布模板自带的系统标签 moment
                        labels: (Array.isArray(it.labels) ? it.labels : [])
                            .map((l) => l && l.name)
                            .filter((n) => typeof n === 'string' && n && n !== 'moment')
                    };
                })
                .filter((m) => m.text || (m.images && m.images.length));
            momentsAll = list;
            renderMomentsState();
            writeMomentsCache(list, res.headers.get('ETag') || undefined);
            return;
        }
        // 403 限流或其他错误：保留已渲染的旧缓存；无缓存则显示失败态
    } catch (e) {
        // 网络异常：保留已渲染的旧缓存；无缓存则显示失败态
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
        const res = await fetch('data/media-stats.json', { cache: 'no-cache' });
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
