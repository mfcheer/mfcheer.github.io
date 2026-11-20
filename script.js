// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const rawHref = anchor.getAttribute('href') || '';
        const isHashOnly = rawHref.startsWith('#');
        const isCurrentPageHash = isHashOnly || (
            rawHref.startsWith('/#') && (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '')
        );
        if (!isCurrentPageHash) return;

        const targetId = isHashOnly ? rawHref : rawHref.slice(1);
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

let themeTransitionTimer = null;
function enableThemeTransition() {
    rootElement.classList.add('theme-transitioning');
    clearTimeout(themeTransitionTimer);
    themeTransitionTimer = setTimeout(() => {
        rootElement.classList.remove('theme-transitioning');
    }, 380);
}

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

function switchTheme(nextTheme) {
    currentTheme = nextTheme;
    localStorage.setItem('theme', currentTheme);

    const update = () => {
        applyTheme(currentTheme);
        if (typeof syncGiscusTheme === "function") syncGiscusTheme(currentTheme);
    };

    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        enableThemeTransition();
    }
    update();
}

// Initialize theme
let currentTheme = getPreferredTheme();
applyTheme(currentTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        switchTheme(nextTheme, e);
    });
}

// Listen to system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const nextTheme = e.matches ? 'dark' : 'light';
        switchTheme(nextTheme);
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
        let res = await fetch('assets/github-contributions.svg');
        if (!res.ok) {
            res = await fetch('https://ghchart.rshah.org/0071e3/mfcheer');
        }
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

// ============================================================
// HOME SECTIONS MAGNETIC FLOAT (首页卡片反重力阻尼吸附动效)
// ============================================================
(function initHomeFloatAnimation() {
    const heroCard = document.querySelector('main > section.card-hero');
    if (!heroCard) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const sections = Array.from(document.querySelectorAll('main > section.glass:not([hidden])'));
    if (!sections.length) return;

    const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
    let targetIdx = -1;
    if (hashTarget) {
        targetIdx = sections.indexOf(hashTarget);
    }

    const winH = window.innerHeight || 800;
    const isScrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 60;

    let homeFloatObserver = null;
    if ('IntersectionObserver' in window) {
        homeFloatObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sec = entry.target;
                    sec.classList.add('card-absorbed');
                    homeFloatObserver.unobserve(sec);
                }
            });
        }, {
            rootMargin: '0px 0px -25px 0px',
            threshold: 0.02
        });
    }

    sections.forEach((sec, idx) => {
        sec.classList.add('home-card-float');

        sec.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'transform') {
                sec.style.transform = 'none';
                sec.style.transitionDelay = '';
            }
        });

        if (targetIdx !== -1 && idx <= targetIdx) {
            sec.style.setProperty('--stagger-i', '0');
            sec.classList.add('card-absorbed');
            return;
        }

        if (isScrolled) {
            const rect = sec.getBoundingClientRect();
            if (rect.top < winH) {
                sec.style.setProperty('--stagger-i', '0');
                sec.classList.add('card-absorbed');
                return;
            }
        }

        const rect = sec.getBoundingClientRect();
        if (idx < 3 || rect.top < winH - 40) {
            sec.style.setProperty('--stagger-i', String(idx));
            requestAnimationFrame(() => {
                void sec.offsetHeight;
                sec.classList.add('card-absorbed');
            });
        } else if (homeFloatObserver) {
            sec.style.setProperty('--stagger-i', '0');
            homeFloatObserver.observe(sec);
        } else {
            sec.classList.add('card-absorbed');
        }
    });
})();

// ============================================================
// PROJECTS SLIDER (作品横向滑块、移动端指示点与 PC 端多作品翻页微控)
// ============================================================
(function initProjectsSlider() {
    const grid = document.querySelector('.projects-grid');
    const pagination = document.getElementById('projectsPagination');
    const nav = document.getElementById('projectsNav');
    const prevBtn = document.getElementById('projectsPrevBtn');
    const nextBtn = document.getElementById('projectsNextBtn');
    if (!grid) return;

    const cards = grid.querySelectorAll('.project-card');
    if (!cards.length) return;

    // 动态同步项目计数（如：2 个项目、3 个项目）
    const countEl = document.querySelector('#projects .moment-count');
    if (countEl) countEl.textContent = `${cards.length} 个项目`;

    // 移动端指示点：如果作品数量多于既有指示点，自动动态补全
    if (pagination) {
        let dots = pagination.querySelectorAll('.project-dot');
        if (dots.length < cards.length) {
            for (let i = dots.length; i < cards.length; i++) {
                const dot = document.createElement('span');
                dot.className = 'project-dot';
                dot.setAttribute('data-index', String(i));
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `项目 ${i + 1}`);
                pagination.appendChild(dot);
            }
        }
        dots = pagination.querySelectorAll('.project-dot');
        dots.forEach((dot) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
                if (cards[idx]) {
                    const targetLeft = cards[idx].offsetLeft - grid.offsetLeft;
                    grid.scrollTo({ left: targetLeft, behavior: 'smooth' });
                }
            });
        });
    }

    // PC 端翻页微控：当项目数量 > 2 时自动激活显示
    const hasMultiplePages = cards.length > 2;
    if (nav) {
        nav.classList.toggle('is-visible', hasMultiplePages);
    }

    let scrollRaf = null;
    const updateActiveDot = () => {
        // 1. 同步移动端指示点
        if (pagination) {
            const dots = pagination.querySelectorAll('.project-dot');
            if (dots.length) {
                const scrollCenter = grid.scrollLeft + grid.clientWidth / 2;
                let closestIdx = 0;
                let minDistance = Infinity;
                cards.forEach((card, idx) => {
                    const cardCenter = card.offsetLeft - grid.offsetLeft + card.offsetWidth / 2;
                    const dist = Math.abs(scrollCenter - cardCenter);
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestIdx = idx;
                    }
                });
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === closestIdx);
                });
            }
        }

        // 2. 更新 PC 左右微箭头禁用态
        if (prevBtn && nextBtn) {
            const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
            prevBtn.disabled = grid.scrollLeft <= 4;
            nextBtn.disabled = grid.scrollLeft >= maxScroll - 4;
        }
    };

    // 绑定左右微箭头翻页事件
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const step = grid.clientWidth;
            grid.scrollBy({ left: -step, behavior: 'smooth' });
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const step = grid.clientWidth;
            grid.scrollBy({ left: step, behavior: 'smooth' });
        });
    }

    grid.addEventListener('scroll', () => {
        if (scrollRaf) cancelAnimationFrame(scrollRaf);
        scrollRaf = requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    window.addEventListener('resize', updateActiveDot, { passive: true });

    // 初始化一次控制器状态
    updateActiveDot();
})();

// 媒体封面加载状态：支持平滑微光骨架屏过渡
document.querySelectorAll('.media-cover').forEach((img) => {
    if (img.complete) {
        img.classList.add('is-loaded');
    } else {
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
});

// 页脚版权年份：动态取当前年份（无 JS 时回退 HTML 里的静态 2026）
(function () {
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// 全站共用多图浏览：文章按篇、说说按条、相册按当前照片列表分组。
let siteLightbox = null;
let siteLightboxImg = null;
let siteLightboxCaption = null;
let siteLastActiveElement = null;
let sitePhotos = [];
let sitePhotoIndex = 0;
let siteImageRequest = 0;

// 草稿正文同步保存；图片使用 IndexedDB，避免 localStorage 容量限制。
const siteEditors = new Set();
let sitePendingUpdate = false;
let siteReloading = false;
function siteEditing() { return [...siteEditors].some(editor => editor.open || editor.busy || editor.saving || !editor.textSaved || (!editor.imageSaved && editor.files.length)); }
function applySiteUpdate() {
    if (!sitePendingUpdate || siteReloading || siteEditing()) return;
    siteReloading = true;
    window.location.reload();
}
function requestSiteUpdate() {
    sitePendingUpdate = true;
    if (siteEditing()) showMomentToast('新版本已就绪，关闭编辑窗口后更新；草稿会保留');
    applySiteUpdate();
}
function createSiteDraft(name) {
    const key = `mfcheer_draft_${name}`;
    const editor = { fields: {}, files: [], busy: false, open: false, saving: false, imageSaved: true, textSaved: true };
    siteEditors.add(editor);
    try {
        const saved = JSON.parse(localStorage.getItem(key) || '{}');
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) editor.fields = saved;
    } catch (_) {}
    const dbReady = new Promise((resolve, reject) => {
        const req = indexedDB.open('mfcheer-publish-drafts', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('drafts');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    editor.ready = dbReady.then(db => new Promise((resolve, reject) => {
        const tx = db.transaction('drafts');
        const req = tx.objectStore('drafts').get(name);
        req.onsuccess = () => {
            editor.files = (req.result || []).map(item => ({ ...item,
                dataUrl: item.dataUrl?.startsWith('blob:') ? URL.createObjectURL(item.file) : item.dataUrl }));
            resolve();
        };
        req.onerror = () => reject(req.error);
    })).catch(() => { editor.imageSaved = false; });
    let queue = editor.ready;
    editor.saveFields = fields => {
        editor.fields = fields;
        try { localStorage.setItem(key, JSON.stringify(fields)); editor.textSaved = true; }
        catch (_) { editor.textSaved = false; showMomentToast('浏览器无法保存文字草稿，请勿刷新或离开页面'); }
    };
    editor.saveFiles = files => {
        editor.files = files;
        const snapshot = files.map(item => ({ ...item }));
        editor.saving = true;
        queue = queue.then(async () => {
            const db = await dbReady;
            await new Promise((resolve, reject) => {
                const tx = db.transaction('drafts', 'readwrite');
                tx.objectStore('drafts').put(snapshot, name);
                tx.oncomplete = resolve;
                tx.onerror = tx.onabort = () => reject(tx.error);
            });
            editor.imageSaved = true;
        }).catch(() => {
            editor.imageSaved = false;
            showMomentToast('图片草稿保存失败，关闭窗口可保留，刷新或离开会丢失图片');
        });
        const current = queue;
        queue.finally(() => { if (current === queue) { editor.saving = false; applySiteUpdate(); } });
        return queue;
    };
    editor.clear = () => { editor.saveFields({}); return editor.saveFiles([]); };
    return editor;
}
function setEditorBusy(editor, card, busy) {
    editor.busy = busy;
    card.setAttribute('aria-busy', String(busy));
    card.querySelectorAll('button, input, textarea').forEach(el => { el.disabled = busy; });
}
window.addEventListener('beforeunload', e => {
    if ([...siteEditors].some(editor => editor.busy || editor.saving || !editor.textSaved || (!editor.imageSaved && editor.files.length))) {
        e.preventDefault(); e.returnValue = '';
    }
});

// ============================================================
// 说说站内发布与博主认证浮层 (Moment Publish & Auth Modal)
// ============================================================

const GITHUB_OAUTH_CLIENT_ID_KEY = "mfcheer_github_oauth_client_id";
const GITHUB_OAUTH_PROXY_KEY = "mfcheer_github_oauth_proxy";

function getOAuthConfig() {
    return {
        clientId: localStorage.getItem(GITHUB_OAUTH_CLIENT_ID_KEY) || "Ov23liE0fZ4oEnXsPCjR",
        proxy: localStorage.getItem(GITHUB_OAUTH_PROXY_KEY) || "https://mfcheer-moments.mfcheer-meng.workers.dev"
    };
}

function startMomentOAuth(returnPath) {
    const config = getOAuthConfig();
    if (!config.clientId || config.clientId.includes("XXXX")) {
        const inputId = prompt(
            "【初次使用 GitHub 授权登录】\n" +
            "请填入你的 GitHub OAuth App Client ID（只需填一次，保存在当前设备）：\n\n" +
            "💡 如未配置，可点取消并点击「直接前往 GitHub 提 Issue 发布」；\n" +
            "也可配置 Client ID 与 Worker 代理体验全自动一键授权。"
        );
        if (!inputId || !inputId.trim()) {
            return false;
        }
        localStorage.setItem(GITHUB_OAUTH_CLIENT_ID_KEY, inputId.trim());
        config.clientId = inputId.trim();
    }

    const path = returnPath || (window.location.pathname + window.location.search);
    sessionStorage.setItem("mfcheer_post_auth_return", path);
    sessionStorage.setItem("mfcheer_reauth_open_moment", "1");

    const redirectUri = window.location.origin + "/";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(config.clientId)}&scope=public_repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
    return true;
}

// 检查页面 URL 中是否携带 OAuth 重定向的 code 参数
async function checkOAuthCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        if (!code) {
            if (sessionStorage.getItem("mfcheer_reauth_open_moment") === "1") {
                sessionStorage.removeItem("mfcheer_reauth_open_moment");
                openMomentModal().then(() => {
                    showMomentToast("🎉 登录状态已刷新，草稿已恢复，可直接发布。");
                });
            }
            return;
        }

        // 清理地址栏 query，保持整洁
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        await openMomentModal();
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

        // 若授权前来自相册页或说说专页等，跳回来源页继续
        const postAuthReturn = sessionStorage.getItem("mfcheer_post_auth_return");
        const currentPath = window.location.pathname;
        if (postAuthReturn && postAuthReturn.startsWith("/") && postAuthReturn !== currentPath && postAuthReturn !== (currentPath + "index.html")) {
            sessionStorage.removeItem("mfcheer_post_auth_return");
            window.location.replace(postAuthReturn);
            return;
        }
        sessionStorage.removeItem("mfcheer_post_auth_return");

        const wasReauth = sessionStorage.getItem("mfcheer_reauth_open_moment") === "1";
        sessionStorage.removeItem("mfcheer_reauth_open_moment");

        const wasOpenPostEditor = sessionStorage.getItem("mfcheer_open_post_editor") === "1";
        sessionStorage.removeItem("mfcheer_open_post_editor");

        if (wasReauth) {
            showMomentToast("🎉 登录状态已刷新，草稿已恢复，可直接发布。");
        } else if (wasOpenPostEditor) {
            showMomentToast("🎉 欢迎回来，博主 mfcheer！已开启文章编辑。");
            setTimeout(() => {
                if (typeof openPostEditorDrawer === "function") {
                    openPostEditorDrawer();
                }
            }, 300);
        } else {
            showMomentToast("🎉 欢迎回来，博主 mfcheer！已成功登录。");
        }
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
let selectedMomentLocation = "";
const momentDraft = createSiteDraft("moment");

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
    document.dispatchEvent(new Event('site-auth-change'));
}

function clearMomentAuth() {
    try {
        localStorage.removeItem(MOMENT_AUTH_TOKEN_KEY);
        localStorage.removeItem(MOMENT_AUTH_USER_KEY);
    } catch (e) {}
    document.dispatchEvent(new Event('site-auth-change'));
}

// 删除仅修改经过验证的本人 Issue；静态站发布完成前用本地记录避免旧数据重新出现。
let siteDeleteBusy = false;
const SITE_DELETED_KEY = 'mfcheer_deleted_content_v1';
function isSiteOwner() {
    const auth = getMomentAuth();
    return Boolean(auth?.token && auth.user?.login?.toLowerCase() === 'mfcheer');
}
function deletedContentKey(kind, number, source = '') {
    return JSON.stringify([kind, number, source]);
}
function readSiteDeleted() {
    try { return JSON.parse(localStorage.getItem(SITE_DELETED_KEY) || '{}'); } catch { return {}; }
}
function isSiteDeleted(kind, number, source = '', updatedAt = '') {
    const deletedAt = readSiteDeleted()[deletedContentKey(kind, number, source)];
    // 后续重新打开或编辑 Issue 的新版本可以正常恢复；只屏蔽删除前的旧快照。
    return Boolean(deletedAt && (!updatedAt || updatedAt <= deletedAt));
}
function rememberSiteDeleted(kind, number, source, updatedAt) {
    try {
        const deleted = readSiteDeleted();
        deleted[deletedContentKey(kind, number, source)] = updatedAt || new Date().toISOString();
        localStorage.setItem(SITE_DELETED_KEY, JSON.stringify(deleted));
    } catch {} // 当前页面仍移除成功，存储不可用不把远端成功误报为失败。
}

// 与相册构建器识别同样的三类图片，仅去掉当前 URL 的图片引用，保留其他文字和图片。
function removeGalleryImage(body, source) {
    let removed = false;
    const replace = (full, url) => {
        if (url.trim() !== source) return full;
        removed = true;
        return '';
    };
    let result = body.replace(/<img\b[^>]*?src=["']([^"'\s]+)["'][^>]*?\/?>/gi, replace);
    result = result.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|assets\/)[^\s\)]+)\)/gi,
        (full, alt, url) => replace(full, url));
    result = result.replace(/^(https?:\/\/(?:github\.com\/user-attachments\/assets\/|user-images\.githubusercontent\.com\/)[^\s]+)$/gmi, replace);
    if (!removed) throw new Error('原始照片引用已变化，请刷新页面后重试');
    return result;
}

async function deleteSiteContent(target, button) {
    if (siteDeleteBusy || !['moment', 'photo'].includes(target.kind)) return;
    if (!isSiteOwner()) { showMomentToast('请先通过发布入口登录博主账号', false); return; }
    if (!Number.isInteger(target.issueNumber) || target.issueNumber < 1) return;
    const message = target.kind === 'moment'
        ? '确定删除这条说说？它将从网页下架，可在 GitHub 重新打开对应 Issue 恢复。'
        : '确定删除当前照片？同批上传的其他照片会保留。';
    if (!window.confirm(message)) return;
    const auth = getMomentAuth();
    siteDeleteBusy = true;
    button.disabled = true;
    button.textContent = '删除中…';
    const editor = { busy: true };
    siteEditors.add(editor);
    try {
        const request = async (url, options = {}) => {
            const res = await fetch(url, { ...options, cache: 'no-store', headers: {
                Authorization: `Bearer ${auth.token}`, Accept: 'application/vnd.github+json',
                'Content-Type': 'application/json'
            } });
            if (!res.ok) {
                if (res.status === 401) { clearMomentAuth(); throw new Error('登录已过期，请重新授权登录'); }
                throw new Error(res.status === 403 ? '没有删除权限或请求受限，请稍后重试' : `删除失败（${res.status}），请重试`);
            }
            return res.json();
        };
        const user = await request('https://api.github.com/user');
        if (user.login?.toLowerCase() !== 'mfcheer') throw new Error('只有博主本人可以删除');
        const url = `https://api.github.com/repos/mfcheer/mfcheer.github.io/issues/${target.issueNumber}`;
        const issue = await request(url);
        const label = target.kind === 'moment' ? 'moment' : 'gallery';
        if (issue.pull_request || issue.user?.login?.toLowerCase() !== 'mfcheer' ||
            !issue.labels?.some(l => l.name === label)) throw new Error('内容来源不匹配，请刷新后重试');
        const change = target.kind === 'moment' ? { state: 'closed' }
            : { body: removeGalleryImage(issue.body || '', target.source) };
        const saved = await request(url, { method: 'PATCH', body: JSON.stringify(change) });
        rememberSiteDeleted(target.kind, target.issueNumber, target.source || '', saved.updated_at);
        if (target.kind === 'moment') {
            momentsAll = momentsAll.filter(m => m.issueNumber !== target.issueNumber);
            writeMomentsCache(momentsAll);
            renderMomentsState();
        } else {
            document.dispatchEvent(new CustomEvent('site-photo-deleted', { detail: target }));
            // 用户可能已切到另一张；按来源移除，始终不误删当前浏览的其他照片。
            if (siteLightbox) {
                const current = sitePhotos[sitePhotoIndex];
                sitePhotos = sitePhotos.filter(p => !(p.issueNumber === target.issueNumber && p.source === target.source));
                if (!sitePhotos.length) closeLightbox();
                else {
                    const index = sitePhotos.indexOf(current);
                    sitePhotoIndex = index >= 0 ? index : Math.min(sitePhotoIndex, sitePhotos.length - 1);
                    showSitePhoto();
                }
            }
        }
        showMomentToast('已删除，其他访客将在网站同步发布后看到更新');
    } catch (error) {
        showMomentToast(error.message || '删除失败，请稍后重试', false);
    } finally {
        siteDeleteBusy = false;
        button.disabled = false;
        button.textContent = target.kind === 'moment' ? '删除' : '删除照片';
        editor.busy = false;
        siteEditors.delete(editor);
        applySiteUpdate();
    }
}

document.addEventListener('site-auth-change', () => {
    renderMomentsState();
    if (siteLightbox?.classList.contains('is-open')) showSitePhoto();
});
window.addEventListener('storage', e => {
    if ([MOMENT_AUTH_TOKEN_KEY, MOMENT_AUTH_USER_KEY, SITE_DELETED_KEY].includes(e.key)) {
        document.dispatchEvent(new Event('site-auth-change'));
    }
});

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



function resetLightboxTransform() {
    lbScale = 1;
    lbTranslateX = 0;
    lbTranslateY = 0;
    lbIsPinching = false;
    lbPinchStartDist = 0;
    lbPinchStartScale = 1;
    lbLastTapTime = 0;
    if (siteLightboxImg) {
        siteLightboxImg?.classList?.remove?.('is-zoomed');
        siteLightboxImg.style.transform = '';
        siteLightboxImg.style.transition = '';
        siteLightboxImg.style.opacity = '';
    }
    if (siteLightbox) {
        siteLightbox.style.backgroundColor = '';
        siteLightbox.style.transition = '';
    }
}

let lbScale = 1;
let lbTranslateX = 0;
let lbTranslateY = 0;
let lbIsPinching = false;
let lbPinchStartDist = 0;
let lbPinchStartScale = 1;
let lbPinchStartCenter = { x: 0, y: 0 };
let lbPinchStartTranslate = { x: 0, y: 0 };
let lbPanStart = { x: 0, y: 0, tx: 0, ty: 0 };
let lbLastTapTime = 0;
let lbLastTapPos = { x: 0, y: 0 };

function clampLightboxTranslate() {
    if (lbScale <= 1.02) {
        lbTranslateX = 0;
        lbTranslateY = 0;
        return;
    }
    const vw = (typeof window !== 'undefined' && window.innerWidth) || 1024;
    const vh = (typeof window !== 'undefined' && window.innerHeight) || 768;
    const baseW = (siteLightboxImg && (siteLightboxImg.offsetWidth || (siteLightboxImg.getBoundingClientRect && siteLightboxImg.getBoundingClientRect().width / lbScale))) || (vw * 0.85);
    const baseH = (siteLightboxImg && (siteLightboxImg.offsetHeight || (siteLightboxImg.getBoundingClientRect && siteLightboxImg.getBoundingClientRect().height / lbScale))) || (vh * 0.7);
    const scaledW = baseW * lbScale;
    const scaledH = baseH * lbScale;

    if (scaledW > vw) {
        const maxTx = (scaledW - vw) / 2 + 20;
        lbTranslateX = Math.max(-maxTx, Math.min(maxTx, lbTranslateX));
    } else {
        lbTranslateX = 0;
    }

    if (scaledH > vh) {
        const maxTy = (scaledH - vh) / 2 + 20;
        lbTranslateY = Math.max(-maxTy, Math.min(maxTy, lbTranslateY));
    } else {
        lbTranslateY = 0;
    }
}

function applyLightboxTransform(animated = false, duration = 0.28) {
    if (!siteLightboxImg) return;
    if (animated) {
        siteLightboxImg.style.transition = `transform ${duration}s cubic-bezier(0.2, 0.9, 0.3, 1)`;
    } else {
        siteLightboxImg.style.transition = 'none';
    }
    if (lbScale <= 1.001 && Math.abs(lbTranslateX) < 0.5 && Math.abs(lbTranslateY) < 0.5) {
        siteLightboxImg.style.transform = '';
        siteLightboxImg.classList?.remove?.('is-zoomed');
    } else {
        siteLightboxImg.style.transform = `translate3d(${lbTranslateX.toFixed(2)}px, ${lbTranslateY.toFixed(2)}px, 0) scale(${lbScale.toFixed(4)})`;
        siteLightboxImg.classList?.toggle?.('is-zoomed', lbScale > 1.05);
    }
}

function closeLightbox() {
    if (!siteLightbox || !siteLightbox.classList.contains('is-open')) return;
    togglePhotoInfo(false);
    siteLightbox.classList.remove('is-open');
    siteImageRequest++;
    siteLightboxImg.removeAttribute('src');
    resetLightboxTransform();
    document.body.classList.remove('lightbox-open');
    siteLastActiveElement?.focus?.();
}

function escapeLightboxHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderPhotoInfo(photo) {
    const infoCard = siteLightbox?.querySelector('.site-photo-info-card');
    if (!infoCard) return;
    const hasExif = photo && photo.exif && (photo.exif.camera || photo.exif.lens || photo.exif.aperture || photo.exif.shutter || photo.exif.iso);
    const dateStr = (photo && (photo.date || photo.exif?.dateTaken)) || '';
    const dims = (photo && photo.w && photo.h) ? `${photo.w} × ${photo.h} px` : '';

    let html = `
        <div class="site-photo-info-drag-handle" aria-hidden="true"></div>
        <div class="site-photo-info-head">
            <span class="site-photo-info-title">照片信息</span>
            <button class="site-photo-info-close" type="button" aria-label="关闭信息">&times;</button>
        </div>
        <div class="site-photo-info-body">
    `;

    if (hasExif) {
        if (photo.exif.camera) {
            html += `<div class="site-photo-info-row"><span class="site-photo-info-label">相机</span><span class="site-photo-info-val">${escapeLightboxHtml(photo.exif.camera)}</span></div>`;
        }
        if (photo.exif.lens) {
            html += `<div class="site-photo-info-row"><span class="site-photo-info-label">镜头</span><span class="site-photo-info-val">${escapeLightboxHtml(photo.exif.lens)}</span></div>`;
        }
        const params = [photo.exif.aperture, photo.exif.shutter, photo.exif.focalLength, photo.exif.iso].filter(Boolean);
        if (params.length) {
            html += `<div class="site-photo-info-row"><span class="site-photo-info-label">参数</span><span class="site-photo-info-val">${escapeLightboxHtml(params.join(' · '))}</span></div>`;
        }
    }

    if (dims) {
        html += `<div class="site-photo-info-row"><span class="site-photo-info-label">尺寸</span><span class="site-photo-info-val">${escapeLightboxHtml(dims)}</span></div>`;
    }
    if (dateStr) {
        html += `<div class="site-photo-info-row"><span class="site-photo-info-label">日期</span><span class="site-photo-info-val">${escapeLightboxHtml(dateStr)}</span></div>`;
    }
    if (photo && photo.album) {
        html += `<div class="site-photo-info-row"><span class="site-photo-info-label">相册</span><span class="site-photo-info-val">${escapeLightboxHtml(photo.album)}</span></div>`;
    }

    if (!hasExif) {
        html += `<div class="site-photo-info-tip">未包含拍摄设备参数</div>`;
    }

    html += `</div>`;
    infoCard.innerHTML = html;

    const closeBtn = infoCard.querySelector('.site-photo-info-close');
    if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); togglePhotoInfo(false); };
}

function togglePhotoInfo(force) {
    const infoCard = siteLightbox?.querySelector('.site-photo-info-card');
    if (!infoCard) return;
    const shouldOpen = typeof force === 'boolean' ? force : infoCard.hidden;
    infoCard.hidden = !shouldOpen;
    siteLightbox.classList.toggle('has-info-open', shouldOpen);
    const infoBtn = siteLightbox.querySelector('.site-photo-info-btn');
    if (infoBtn) {
        infoBtn.classList.toggle('is-active', shouldOpen);
        infoBtn.setAttribute('aria-expanded', String(shouldOpen));
    }
    if (siteLightboxCaption) {
        siteLightboxCaption.setAttribute?.('aria-expanded', String(shouldOpen));
    }
}

function showSitePhoto() {
    resetLightboxTransform();
    const photo = sitePhotos[sitePhotoIndex];
    renderPhotoInfo(photo);
    const request = ++siteImageRequest;
    const status = siteLightbox.querySelector('.site-photo-status');
    status.textContent = '正在加载图片…';
    siteLightboxImg.hidden = true;
    siteLightboxImg.onload = () => {
        if (request !== siteImageRequest) return;
        siteLightboxImg.hidden = false;
        status.textContent = '';
    };
    siteLightboxImg.onerror = () => {
        if (request !== siteImageRequest) return;
        if (photo && photo.src && !photo._retried && !photo.src.startsWith('data:') && !photo.src.startsWith('blob:')) {
            photo._retried = true;
            if (photo.src.includes('assets/gallery/')) {
                const fn = photo.src.split('/').pop();
                siteLightboxImg.src = `https://raw.githubusercontent.com/mfcheer/mfcheer.github.io/main/assets/gallery/${fn}`;
                return;
            }
        }
        status.textContent = '图片加载失败，请点击重试';
    };
    siteLightboxImg.alt = photo.caption || '图片';
    siteLightboxImg.src = photo.src;
    const hasExif = photo && photo.exif && (photo.exif.camera || photo.exif.lens || photo.exif.aperture || photo.exif.shutter || photo.exif.iso);
    const defaultCaption = photo.caption || (hasExif ? (photo.exif.camera || '查看照片参数') : '');
    siteLightboxCaption.textContent = defaultCaption;
    if (defaultCaption) {
        if (hasExif) {
            siteLightboxCaption.title = '点击查看拍摄参数 (快捷键 i)';
            siteLightboxCaption.setAttribute?.('role', 'button');
            siteLightboxCaption.setAttribute?.('tabindex', '0');
        } else {
            siteLightboxCaption.title = photo.fullText || defaultCaption;
            siteLightboxCaption.removeAttribute?.('role');
            siteLightboxCaption.removeAttribute?.('tabindex');
        }
    } else {
        siteLightboxCaption.removeAttribute?.('title');
        siteLightboxCaption.removeAttribute?.('role');
        siteLightboxCaption.removeAttribute?.('tabindex');
    }
    const remove = siteLightbox.querySelector('.site-photo-delete');
    remove.hidden = !(isSiteOwner() && Number.isInteger(photo.issueNumber) && photo.source);
    siteLightbox.classList.toggle('has-delete', !remove.hidden);
    remove.disabled = siteDeleteBusy;
    remove.textContent = siteDeleteBusy ? '删除中…' : '删除照片';
    siteLightbox.querySelector('.site-photo-counter').textContent = `${sitePhotoIndex + 1} / ${sitePhotos.length}`;
    siteLightbox.querySelectorAll('.site-photo-nav').forEach(btn => { btn.hidden = sitePhotos.length < 2; });
    [-1, 1].forEach(dir => {
        const next = sitePhotos[(sitePhotoIndex + dir + sitePhotos.length) % sitePhotos.length];
        if (sitePhotos.length > 1 && typeof Image !== "undefined") { const img = new Image(); img.src = next.src; }
    });
}

function stepSitePhoto(dir) {
    sitePhotoIndex = (sitePhotoIndex + dir + sitePhotos.length) % sitePhotos.length;
    showSitePhoto();
}

function createLightbox() {
    if (siteLightbox) return;
    siteLightbox = document.createElement('div');
    siteLightbox.id = 'siteLightbox';
    siteLightbox.className = 'post-lightbox';
    siteLightbox.setAttribute('role', 'dialog');
    siteLightbox.setAttribute('aria-modal', 'true');
    siteLightbox.setAttribute('aria-label', '图片预览');
    siteLightbox.innerHTML = `
        <button class="post-lightbox-close" aria-label="关闭预览 (Esc)">×</button>
        <button class="site-photo-nav site-photo-prev" aria-label="上一张">‹</button>
        <img class="post-lightbox-img" alt="">
        <button class="site-photo-nav site-photo-next" aria-label="下一张">›</button>
        <button class="site-photo-status" aria-live="polite"></button>
        <div class="site-photo-info-card" hidden></div>
        <div class="post-lightbox-caption" aria-label="查看照片信息 (i)"></div>
        <div class="site-photo-counter" aria-live="polite"></div>
        <button type="button" class="content-delete site-photo-delete" hidden>删除照片</button>`;
    document.body.appendChild(siteLightbox);
    siteLightboxImg = siteLightbox.querySelector('img');
    siteLightboxCaption = siteLightbox.querySelector('.post-lightbox-caption');
    siteLightbox.querySelector('.post-lightbox-close').onclick = closeLightbox;
    if (siteLightboxCaption) {
        siteLightboxCaption.onclick = (e) => {
            e.stopPropagation();
            const current = sitePhotos && sitePhotos[sitePhotoIndex];
            const hasExif = current && current.exif && (current.exif.camera || current.exif.lens || current.exif.aperture || current.exif.shutter || current.exif.iso);
            if (hasExif || (current && current.album)) {
                togglePhotoInfo();
            }
        };
        siteLightboxCaption.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const current = sitePhotos && sitePhotos[sitePhotoIndex];
                const hasExif = current && current.exif && (current.exif.camera || current.exif.lens || current.exif.aperture || current.exif.shutter || current.exif.iso);
                if (hasExif || (current && current.album)) {
                    togglePhotoInfo();
                }
            }
        };
    }
    const infoCard = siteLightbox.querySelector('.site-photo-info-card');
    if (infoCard && infoCard.addEventListener) {
        let cardTouchStartY = 0;
        infoCard.addEventListener('touchstart', e => {
            if (e.touches && e.touches.length === 1) {
                cardTouchStartY = e.touches[0].clientY;
            }
        }, { passive: true });
        infoCard.addEventListener('touchend', e => {
            const touch = e.changedTouches && e.changedTouches[0];
            if (touch && (touch.clientY - cardTouchStartY > 50)) {
                togglePhotoInfo(false);
            }
        }, { passive: true });
    }
    siteLightbox.querySelector('.site-photo-prev').onclick = () => stepSitePhoto(-1);
    siteLightbox.querySelector('.site-photo-next').onclick = () => stepSitePhoto(1);
    siteLightbox.querySelector('.site-photo-status').onclick = showSitePhoto;
    siteLightbox.querySelector('.site-photo-delete').onclick = e => {
        const photo = sitePhotos[sitePhotoIndex];
        if (photo) deleteSiteContent({ kind: 'photo', issueNumber: photo.issueNumber, source: photo.source }, e.currentTarget);
    };
    siteLightbox.onclick = e => {
        const currentCard = siteLightbox.querySelector('.site-photo-info-card');
        if (currentCard && !currentCard.hidden && currentCard.contains && !currentCard.contains(e.target) && e.target !== siteLightboxCaption) {
            togglePhotoInfo(false);
            return;
        }
        if (e.target === siteLightbox) closeLightbox();
    };
    window.addEventListener('keydown', e => {
        if (!siteLightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            const currentCard = siteLightbox.querySelector('.site-photo-info-card');
            if (currentCard && !currentCard.hidden) {
                togglePhotoInfo(false);
            } else {
                closeLightbox();
            }
        }
        if (e.key === 'i' || e.key === 'I') {
            e.preventDefault();
            const current = sitePhotos && sitePhotos[sitePhotoIndex];
            const hasExif = current && current.exif && (current.exif.camera || current.exif.lens || current.exif.aperture || current.exif.shutter || current.exif.iso);
            if (hasExif || (current && current.album)) {
                togglePhotoInfo();
            }
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault(); stepSitePhoto(e.key === 'ArrowLeft' ? -1 : 1);
        }
        if (e.key === 'Tab') {
            const buttons = [...siteLightbox.querySelectorAll('button')].filter(b => !b.hidden && b.getClientRects().length);
            const i = buttons.indexOf(document.activeElement);
            e.preventDefault(); buttons[(i + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
        }
    });

    // 移动端手势交互：跟手横滑切图、下拉手势关闭与上滑展开参数抽屉，双指捏合缩放（Pinch-to-zoom）与单指放大平移
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchLock = null;
    let isTouchActive = false;

    siteLightbox.addEventListener('touchstart', e => {
        if (e.target.closest && e.target.closest('button, a, .site-photo-info-body')) {
            isTouchActive = false;
            touchLock = null;
            return;
        }

        // 双指触控：进入捏合缩放模式
        if (e.touches && e.touches.length === 2) {
            isTouchActive = false;
            touchLock = 'pinch';
            lbIsPinching = true;
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            lbPinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            lbPinchStartScale = lbScale;
            lbPinchStartCenter = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
            lbPinchStartTranslate = { x: lbTranslateX, y: lbTranslateY };
            applyLightboxTransform(false);
            return;
        }

        // 单指触控
        if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            lbIsPinching = false;

            // 若当前已处于放大状态 (> 1.05)，单指行为切换为平移查看细节
            if (lbScale > 1.05) {
                touchLock = 'pan';
                lbPanStart = { x: touchStartX, y: touchStartY, tx: lbTranslateX, ty: lbTranslateY };
                isTouchActive = true;
                applyLightboxTransform(false);
                return;
            }

            // 原始 1x 比例下正常响应滑动与下拉手势
            touchLock = null;
            isTouchActive = true;
        } else {
            isTouchActive = false;
            touchLock = null;
            if (lbScale <= 1.05) resetLightboxTransform();
        }
    }, { passive: true });

    siteLightbox.addEventListener('touchmove', e => {
        // 双指捏合缩放
        if (lbIsPinching && e.touches && e.touches.length === 2) {
            if (e.cancelable) e.preventDefault();
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            const currentCenter = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
            if (lbPinchStartDist > 0) {
                const ratio = currentDist / lbPinchStartDist;
                let targetScale = lbPinchStartScale * ratio;
                // 阻尼弹性范围：0.8 ~ 5.0
                if (targetScale < 0.8) targetScale = 0.8 + (targetScale - 0.8) * 0.35;
                if (targetScale > 4.5) targetScale = 4.5 + (targetScale - 4.5) * 0.35;

                const vw = (typeof window !== 'undefined' && window.innerWidth) || 1024;
                const vh = (typeof window !== 'undefined' && window.innerHeight) || 768;
                const originX = (vw / 2) + lbPinchStartTranslate.x;
                const originY = (vh / 2) + lbPinchStartTranslate.y;
                const sRatio = targetScale / (lbPinchStartScale || 1);

                lbScale = targetScale;
                lbTranslateX = lbPinchStartTranslate.x + (currentCenter.x - lbPinchStartCenter.x) - (lbPinchStartCenter.x - originX) * (sRatio - 1);
                lbTranslateY = lbPinchStartTranslate.y + (currentCenter.y - lbPinchStartCenter.y) - (lbPinchStartCenter.y - originY) * (sRatio - 1);

                applyLightboxTransform(false);
            }
            return;
        }

        // 单指在放大状态下的拖拽平移 (Pan)
        if (touchLock === 'pan' && isTouchActive && e.touches && e.touches.length === 1) {
            if (e.cancelable) e.preventDefault();
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - lbPanStart.x;
            const dy = currentY - lbPanStart.y;
            lbTranslateX = lbPanStart.tx + dx;
            lbTranslateY = lbPanStart.ty + dy;
            applyLightboxTransform(false);
            return;
        }

        if (!isTouchActive || !e.touches || e.touches.length !== 1 || lbScale > 1.05) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const dx = currentX - touchStartX;
        const dy = currentY - touchStartY;

        if (!touchLock) {
            if (Math.hypot(dx, dy) > 8) {
                if (dy > 0 && dy > Math.abs(dx) * 1.1) {
                    touchLock = 'vertical-down';
                } else if (dy < 0 && Math.abs(dy) > Math.abs(dx) * 1.1) {
                    touchLock = 'vertical-up';
                } else if (Math.abs(dx) > Math.abs(dy)) {
                    touchLock = 'horizontal';
                }
            }
        }

        if (touchLock === 'vertical-down') {
            if (e.cancelable) e.preventDefault();
            const scale = Math.max(0.72, 1 - dy / 900);
            const bgOpacity = Math.max(0.2, 0.88 * (1 - dy / 450));
            siteLightboxImg.style.transform = `translate3d(${dx * 0.35}px, ${dy}px, 0) scale(${scale})`;
            siteLightboxImg.style.transition = 'none';
            siteLightbox.style.backgroundColor = `rgba(10, 12, 16, ${bgOpacity.toFixed(3)})`;
        } else if (touchLock === 'vertical-up') {
            if (e.cancelable) e.preventDefault();
            const dampedDy = Math.max(-60, dy * 0.25);
            siteLightboxImg.style.transform = `translate3d(0, ${dampedDy}px, 0)`;
            siteLightboxImg.style.transition = 'none';
        } else if (touchLock === 'horizontal') {
            if (e.cancelable) e.preventDefault();
            const factor = sitePhotos.length > 1 ? 1 : 0.25;
            siteLightboxImg.style.transform = `translate3d(${dx * factor}px, 0, 0)`;
            siteLightboxImg.style.transition = 'none';
        }
    }, { passive: false });

    siteLightbox.addEventListener('touchend', e => {
        const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]) || null;
        const dx = touch ? touch.clientX - touchStartX : 0;
        const dy = touch ? touch.clientY - touchStartY : 0;
        const dt = Date.now() - touchStartTime;

        // 双指松手释放
        if (lbIsPinching) {
            if (!e.touches || e.touches.length < 2) {
                lbIsPinching = false;
                touchLock = null;
                if (lbScale < 1.08) {
                    lbScale = 1;
                    lbTranslateX = 0;
                    lbTranslateY = 0;
                    applyLightboxTransform(true, 0.26);
                } else {
                    if (lbScale > 4.0) lbScale = 4.0;
                    clampLightboxTranslate();
                    applyLightboxTransform(true, 0.24);
                    if (e.touches && e.touches.length === 1) {
                        isTouchActive = true;
                        touchLock = 'pan';
                        lbPanStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, tx: lbTranslateX, ty: lbTranslateY };
                    }
                }
            }
            return;
        }

        // 放大状态下单指平移松手
        if (touchLock === 'pan') {
            touchLock = null;
            isTouchActive = false;
            if (Math.hypot(dx, dy) < 12 && dt < 280) {
                const now = Date.now();
                if (now - lbLastTapTime < 320 && Math.hypot(touch.clientX - lbLastTapPos.x, touch.clientY - lbLastTapPos.y) < 30) {
                    lbLastTapTime = 0;
                    lbScale = 1;
                    lbTranslateX = 0;
                    lbTranslateY = 0;
                    applyLightboxTransform(true, 0.26);
                    return;
                }
                lbLastTapTime = now;
                lbLastTapPos = { x: touch.clientX, y: touch.clientY };
            }
            clampLightboxTranslate();
            applyLightboxTransform(true, 0.24);
            return;
        }

        if (!isTouchActive) return;
        isTouchActive = false;
        if (!touch) {
            resetLightboxTransform();
            return;
        }

        // 双击放大/还原检测 (Double-tap to zoom toggle)
        if (Math.hypot(dx, dy) < 12 && dt < 280) {
            const now = Date.now();
            if (now - lbLastTapTime < 320 && Math.hypot(touch.clientX - lbLastTapPos.x, touch.clientY - lbLastTapPos.y) < 30) {
                lbLastTapTime = 0;
                if (lbScale > 1.2) {
                    lbScale = 1;
                    lbTranslateX = 0;
                    lbTranslateY = 0;
                    applyLightboxTransform(true, 0.26);
                } else {
                    const targetScale = 2.5;
                    const vw = (typeof window !== 'undefined' && window.innerWidth) || 1024;
                    const vh = (typeof window !== 'undefined' && window.innerHeight) || 768;
                    lbScale = targetScale;
                    lbTranslateX = (vw / 2 - touch.clientX) * 1.2;
                    lbTranslateY = (vh / 2 - touch.clientY) * 1.2;
                    clampLightboxTranslate();
                    applyLightboxTransform(true, 0.26);
                }
                touchLock = null;
                return;
            }
            lbLastTapTime = now;
            lbLastTapPos = { x: touch.clientX, y: touch.clientY };
        }

        // 下拉手势关闭：垂直下滑超过阈值或快速下滑手势
        if (touchLock === 'vertical-down' || (!touchLock && dy > 60 && dy > Math.abs(dx) * 1.2)) {
            const isQuickFlick = dy > 35 && dt < 280 && dy / dt > 0.35;
            if (dy > 70 || isQuickFlick) {
                closeLightbox();
                touchLock = null;
                return;
            }
        }

        // 上滑手势展开参数抽屉：垂直上滑超过阈值或快速上滑手势（仅当具备相机参数或相册归属时生效）
        if (touchLock === 'vertical-up' || (!touchLock && dy < -50 && Math.abs(dy) > Math.abs(dx) * 1.2)) {
            const current = sitePhotos && sitePhotos[sitePhotoIndex];
            const hasExif = current && current.exif && (current.exif.camera || current.exif.lens || current.exif.aperture || current.exif.shutter || current.exif.iso);
            if (!hasExif && !(current && current.album)) {
                touchLock = null;
                resetLightboxTransform();
                return;
            }
            const isQuickFlickUp = dy < -25 && dt < 280 && Math.abs(dy) / dt > 0.25;
            if (dy < -45 || isQuickFlickUp) {
                togglePhotoInfo(true);
                siteLightboxImg.style.transition = 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1)';
                siteLightboxImg.style.transform = '';
                touchLock = null;
                return;
            }
        }

        // 左右滑动手势切图：水平滑动超过阈值或快速水平滑动手势
        if (touchLock === 'horizontal' || (!touchLock && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))) {
            const isQuickFlick = Math.abs(dx) > 25 && dt < 300 && Math.abs(dx) / dt > 0.3;
            if ((Math.abs(dx) > 50 || isQuickFlick) && sitePhotos.length > 1) {
                const dir = dx > 0 ? -1 : 1;
                stepSitePhoto(dir);
                touchLock = null;
                return;
            }
        }

        // 未达到阈值：平滑弹回原位
        siteLightboxImg.style.transition = 'transform 0.24s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.24s ease';
        siteLightbox.style.transition = 'background-color 0.24s ease';
        siteLightboxImg.style.transform = '';
        siteLightboxImg.style.opacity = '';
        siteLightbox.style.backgroundColor = '';
        touchLock = null;
    }, { passive: true });

    siteLightbox.addEventListener('touchcancel', () => {
        isTouchActive = false;
        lbIsPinching = false;
        touchLock = null;
        if (lbScale < 1.08) {
            resetLightboxTransform();
        } else {
            clampLightboxTranslate();
            applyLightboxTransform(true, 0.24);
        }
    });

    siteLightbox.addEventListener('wheel', e => {
        if (!siteLightbox || !siteLightbox.classList.contains('is-open')) return;
        if (e.target.closest && e.target.closest('.site-photo-info-card')) return;
        if (e.ctrlKey) {
            if (e.cancelable) e.preventDefault();
            const factor = Math.exp(-e.deltaY * 0.012);
            let targetScale = lbScale * factor;
            if (targetScale < 1.0) {
                lbScale = 1;
                lbTranslateX = 0;
                lbTranslateY = 0;
            } else {
                if (targetScale > 5.0) targetScale = 5.0;
                lbScale = targetScale;
                clampLightboxTranslate();
            }
            applyLightboxTransform(false);
        }
    }, { passive: false });
}

function openSitePhotos(photos, index = 0, trigger = document.activeElement) {
    if (!photos.length) return;
    createLightbox();
    sitePhotos = photos;
    sitePhotoIndex = Math.max(0, Math.min(index, photos.length - 1));
    siteLastActiveElement = trigger;
    document.body.classList.add('lightbox-open');
    siteLightbox.classList.add('is-open');
    showSitePhoto();
    requestAnimationFrame(() => {
        if (siteLightbox.classList.contains('is-open')) siteLightbox.querySelector('.post-lightbox-close').focus();
    });
}

function openLightbox(img) {
    const group = img.closest('.moment-item, .post-body');
    const images = group ? [...group.querySelectorAll('img.zoomable-img')] : [img];
    const isMoment = !!(group && group.classList.contains('moment-item'));
    let momentCaption = '';
    let momentFullText = '';
    if (isMoment) {
        let text = (group.dataset.momentText || group.querySelector('.moment-text')?.textContent || '').trim();
        if (text) {
            momentFullText = text;
            const singleLine = text.replace(/\r\n|\r|\n+/g, ' ').replace(/\s+/g, ' ').trim();
            const MAX_MOMENT_CAPTION = 100;
            momentCaption = singleLine.length > MAX_MOMENT_CAPTION
                ? singleLine.slice(0, MAX_MOMENT_CAPTION).trim() + '…'
                : singleLine;
        }
    }
    openSitePhotos(images.map(image => {
        let caption = '';
        if (isMoment) {
            caption = momentCaption || (['这里写图片描述', '说说配图', 'Image'].includes(image.alt) ? '' : image.alt);
        } else {
            caption = ['这里写图片描述', '说说配图', 'Image'].includes(image.alt) ? '' : image.alt;
        }
        return {
            src: image.currentSrc || image.src,
            caption,
            fullText: isMoment ? momentFullText : caption,
            isMoment
        };
    }), images.indexOf(img), img);
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

    const LANG_MAP = {
        js: 'JavaScript', javascript: 'JavaScript',
        ts: 'TypeScript', typescript: 'TypeScript',
        py: 'Python', python: 'Python',
        cpp: 'C++', 'c++': 'C++', c: 'C',
        java: 'Java', sh: 'Shell', bash: 'Bash', zsh: 'Zsh',
        html: 'HTML', css: 'CSS', json: 'JSON', sql: 'SQL',
        md: 'Markdown', yaml: 'YAML', yml: 'YAML',
        go: 'Go', rust: 'Rust', rs: 'Rust'
    };

    function initCodeBlocksIn(container) {
        if (!container) return;
        container.querySelectorAll('pre').forEach((pre) => {
            const code = pre.querySelector('code');
            if (!code || pre.parentElement.classList.contains('code-block')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            pre.before(wrapper);
            wrapper.appendChild(pre);

            const langMatch = (code.className || '').match(/language-([\w+-]+)/);
            if (langMatch) {
                const rawLang = langMatch[1].toLowerCase();
                const lang = document.createElement('span');
                lang.className = 'code-lang';
                lang.textContent = LANG_MAP[rawLang] || langMatch[1].toUpperCase();
                wrapper.appendChild(lang);
            }

            // 横向滚动渐变阴影指示
            const updateScrollShadow = () => {
                if (pre.scrollWidth > pre.clientWidth + 2) {
                    wrapper.classList.toggle('has-scroll-right', pre.scrollLeft + pre.clientWidth < pre.scrollWidth - 6);
                } else {
                    wrapper.classList.remove('has-scroll-right');
                }
            };
            pre.addEventListener('scroll', updateScrollShadow, { passive: true });
            window.addEventListener('resize', updateScrollShadow, { passive: true });
            setTimeout(updateScrollShadow, 100);

            // 双击代码块高亮聚焦
            code.addEventListener('dblclick', () => {
                wrapper.classList.toggle('is-highlighted-block');
            });

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-btn';
            btn.setAttribute('aria-label', '复制代码');
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>';
            btn.addEventListener('click', async () => {
                try {
                    await copyText(code.innerText);
                    btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span>已复制</span>';
                    btn.classList.add('copied');
                } catch (e) {
                    btn.textContent = '复制失败';
                }
                setTimeout(() => {
                    btn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>';
                    btn.classList.remove('copied');
                }, 1500);
            });
            wrapper.appendChild(btn);
        });
    }
    window._mfcheerInitCodeBlocks = initCodeBlocksIn;

    initCodeBlocksIn(postBody);

    const tocLinks = Array.from(document.querySelectorAll('.toc a'));
    if (tocLinks.length) {
        // 浮动目录入口按钮
        let floatTocBtn = document.getElementById('floatTocBtn');
        if (!floatTocBtn) {
            floatTocBtn = document.createElement('button');
            floatTocBtn.id = 'floatTocBtn';
            floatTocBtn.className = 'float-toc-btn';
            floatTocBtn.type = 'button';
            floatTocBtn.setAttribute('title', '查看文章目录');
            floatTocBtn.setAttribute('aria-label', '查看文章目录');
            floatTocBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
            document.body.appendChild(floatTocBtn);
        }

        // 浮动目录抽屉
        let tocDrawerBackdrop = document.getElementById('tocDrawerBackdrop');
        if (!tocDrawerBackdrop) {
            tocDrawerBackdrop = document.createElement('div');
            tocDrawerBackdrop.id = 'tocDrawerBackdrop';
            tocDrawerBackdrop.className = 'toc-drawer-backdrop';
            tocDrawerBackdrop.innerHTML = `
                <div class="toc-drawer" role="dialog" aria-label="文章目录">
                    <div class="toc-drawer-head">
                        <span>📑 文章目录</span>
                        <button class="toc-drawer-close" type="button" aria-label="关闭目录">✕</button>
                    </div>
                    <div class="toc-drawer-body">
                        <ul>
                            ${tocLinks.map(a => {
                                const parentLi = a.closest('li');
                                const cls = parentLi?.className ? ` class="${parentLi.className}"` : '';
                                return `<li${cls}><a href="${a.getAttribute('href')}">${a.textContent}</a></li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
            document.body.appendChild(tocDrawerBackdrop);

            const closeDrawer = () => {
                tocDrawerBackdrop.classList.remove('is-open');
                document.body.classList.remove('drawer-open');
            };
            tocDrawerBackdrop.querySelector('.toc-drawer-close').onclick = closeDrawer;
            tocDrawerBackdrop.addEventListener('click', (e) => {
                if (e.target === tocDrawerBackdrop) closeDrawer();
            });
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && tocDrawerBackdrop.classList.contains('is-open')) closeDrawer();
            });

            tocDrawerBackdrop.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = decodeURIComponent((a.getAttribute('href') || '').slice(1));
                    const targetEl = targetId && document.getElementById(targetId);
                    if (targetEl) {
                        closeDrawer();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                        history.replaceState(null, '', `#${targetId}`);
                    }
                });
            });

            floatTocBtn.addEventListener('click', () => {
                tocDrawerBackdrop.classList.add('is-open');
                document.body.classList.add('drawer-open');
            });
        }

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatTocBtn.classList.add('visible');
            } else {
                floatTocBtn.classList.remove('visible');
            }
        }, { passive: true });

        if ('IntersectionObserver' in window) {
            const map = new Map();
            const drawerMap = new Map();
            const drawerLinks = Array.from(tocDrawerBackdrop?.querySelectorAll('a') || []);

            tocLinks.forEach((a, i) => {
                const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
                const target = id && document.getElementById(id);
                if (target) {
                    map.set(target, a);
                    if (drawerLinks[i]) drawerMap.set(target, drawerLinks[i]);
                }
            });
            const setActive = (link) => {
                tocLinks.forEach((a) => a.classList.toggle('active', a === link));
                if (drawerLinks.length) {
                    const targetHref = link ? link.getAttribute('href') : null;
                    drawerLinks.forEach((a) => a.classList.toggle('active', targetHref && a.getAttribute('href') === targetHref));
                }
            };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(map.get(entry.target));
                });
            }, { rootMargin: '-80px 0px -55% 0px' });
            map.forEach((_, target) => observer.observe(target));
        }
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
        if (window.scrollY > 300) {
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
    'https://api.github.com/repos/mfcheer/mfcheer.github.io/issues?state=open&per_page=30&sort=created&direction=desc&labels=moment';
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
    if (!raw) return { text: '', images: [], location: '' };
    let clean = raw.replace(/^#{1,4}\s*想说的话\s*[\r\n]*/gm, '').trim();

    // 提取并剥离定位信息（支持 HTML 注释 <!-- location: ... --> 与模板标题 ### 所在地点）
    let location = '';
    const locCommentMatch = clean.match(/<!--\s*location:\s*(.+?)\s*-->/i);
    if (locCommentMatch) {
        location = locCommentMatch[1].trim();
        clean = clean.replace(/<!--\s*location:\s*(.+?)\s*-->/gi, '');
    } else {
        const locHeaderMatch = clean.match(/^#{1,4}\s*所在地点[^\r\n]*[\r\n]+([^\r\n#]+)/m);
        if (locHeaderMatch) {
            location = locHeaderMatch[1].trim();
            clean = clean.replace(/^#{1,4}\s*所在地点[^\r\n]*[\r\n]+([^\r\n#]+)[\r\n]*/m, '');
        }
    }

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

    return { text: clean, images, location };
}

function normalizeMomentItem(it) {
    if (!it) return null;
    let images = Array.isArray(it.images) ? it.images : [];
    let text = typeof it.text === 'string' ? it.text : '';
    let location = typeof it.location === 'string' ? it.location : '';
    if (text) {
        const parsed = parseMomentContent(text);
        if (parsed.images.length || parsed.text !== text || parsed.location) {
            text = parsed.text;
            if (!images.length) images = parsed.images;
            if (!location && parsed.location) location = parsed.location;
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
        location,
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
let momentsLocationFilter = null; // 当前筛选的地点；null = 显示全部

function setMomentsFilter(tag = null, location = null, pushState = true) {
    momentsFilter = tag;
    momentsLocationFilter = location;
    if (pushState && typeof window !== 'undefined' && window.history?.pushState) {
        const url = new URL(window.location);
        if (tag) url.searchParams.set('tag', tag); else url.searchParams.delete('tag');
        if (location) url.searchParams.set('location', location); else url.searchParams.delete('location');
        window.history.pushState(null, '', url.pathname + url.search + url.hash);
    }
    renderMomentsState();
}

// ============================================================
// 说说富媒体卡片：视频/音乐平台链接识别
// ============================================================

// 单条说说最多渲染的富媒体卡片数，超出退回普通链接
const MOMENT_MEDIA_CARD_MAX = 4;

// 识别已知平台链接，返回卡片描述；未识别返回 null（走普通链接）。
// 安全约束：iframe src 一律由校验后的 ID 拼接，绝不透传用户文本
function recognizeMomentMediaUrl(rawUrl) {
    let u;
    try {
        u = new URL(rawUrl);
    } catch (e) {
        return null;
    }
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.toLowerCase();
    const bareHost = host.replace(/^www\./, '');

    // —— 哔哩哔哩：BV 号可提取 → 支持点击原位播放（含高清与清爽参数） ——
    if (bareHost === 'bilibili.com' || host === 'm.bilibili.com' || bareHost === 'b23.tv') {
        const fullTarget = u.pathname + u.search + u.hash;
        const bvMatch = fullTarget.match(/(BV[a-zA-Z0-9]{6,20})/i);
        if (bvMatch) {
            const bv = bvMatch[1];
            let embed = `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bv)}&autoplay=0&high_quality=1&danmaku=0&as_wide=1`;
            const p = u.searchParams.get('p') || u.searchParams.get('page');
            if (p && /^\d+$/.test(p)) {
                embed += `&page=${encodeURIComponent(p)}`;
            }
            return {
                kind: 'video', platform: 'bilibili', title: '哔哩哔哩',
                sub: '视频 · 点击原位播放', url: rawUrl,
                embed
            };
        }
        if (bareHost === 'b23.tv') {
            // 无 BV 号的纯短链需服务端跳转才能解析，客户端退回链接卡片
            return { kind: 'video', platform: 'bilibili', title: '哔哩哔哩', sub: '视频短链 · 打开观看', url: rawUrl };
        }
        return { kind: 'video', platform: 'bilibili', title: '哔哩哔哩', sub: '视频 · 打开观看', url: rawUrl };
    }

    // —— YouTube：视频 ID 校验后拼接 embed（免追踪域名 + 关推荐） ——
    if (bareHost === 'youtube.com' || host === 'm.youtube.com') {
        const v = u.searchParams.get('v');
        if (v && /^[\w-]{4,20}$/.test(v)) {
            return {
                kind: 'video', platform: 'youtube', title: 'YouTube',
                sub: '视频 · 点击原位播放', url: rawUrl,
                embed: `https://www.youtube-nocookie.com/embed/${v}?autoplay=0&rel=0`
            };
        }
        return { kind: 'video', platform: 'youtube', title: 'YouTube', sub: '视频 · 打开观看', url: rawUrl };
    }
    if (host === 'youtu.be') {
        const v = u.pathname.match(/^\/([\w-]{4,20})/);
        if (v) {
            return {
                kind: 'video', platform: 'youtube', title: 'YouTube',
                sub: '视频 · 点击原位播放', url: rawUrl,
                embed: `https://www.youtube-nocookie.com/embed/${v[1]}?autoplay=0&rel=0`
            };
        }
    }

    // —— 通用原生视频：mp4 / webm / mov / m4v / ogg 直链 ——
    const cleanPath = u.pathname.toLowerCase();
    if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(cleanPath)) {
        const rawFileName = u.pathname.split('/').filter(Boolean).pop() || '视频';
        let displayName = rawFileName;
        try {
            displayName = decodeURIComponent(rawFileName);
        } catch (e) {
            displayName = rawFileName;
        }
        return {
            kind: 'video',
            platform: 'video',
            title: displayName,
            sub: '视频 · 点击原位播放',
            url: rawUrl,
            directVideo: rawUrl
        };
    }

    // —— 网易云音乐：兼容 /#/song?id= 哈希路由与 /song?id= 直连两种形态 ——
    if (host === 'music.163.com' || host.endsWith('.music.163.com')) {
        let path = u.pathname;
        let params = u.searchParams;
        if (u.hash && u.hash.length > 1) {
            const h = u.hash.slice(1);
            const qi = h.indexOf('?');
            if (qi >= 0) {
                path = h.slice(0, qi);
                params = new URLSearchParams(h.slice(qi + 1));
            } else {
                path = h;
            }
        }
        const id = params.get('id');
        const idOk = id && /^\d{1,15}$/.test(id);
        if (idOk && /\/song\b/.test(path)) {
            return {
                kind: 'music', platform: 'netease', title: '网易云音乐', sub: '单曲 · 内嵌播放器',
                url: rawUrl,
                // 官方参数组合：外框 86px + 内容 height=66（86 参数会被忽略导致 614px 大播放器被裁剪）
                directEmbed: `https://music.163.com/outchain/player?type=2&id=${id}&auto=0&height=66`,
                embedHeight: 86
            };
        }
        if (idOk && /\/playlist\b/.test(path)) {
            return {
                kind: 'music', platform: 'netease', title: '网易云歌单', sub: '歌单 · 点击展开播放器',
                url: rawUrl,
                embed: `https://music.163.com/outchain/player?type=0&id=${id}&auto=0&height=330`,
                tall: true
            };
        }
        if (idOk && /\/album\b/.test(path)) {
            return {
                kind: 'music', platform: 'netease', title: '网易云专辑', sub: '专辑 · 点击展开播放器',
                url: rawUrl,
                embed: `https://music.163.com/outchain/player?type=1&id=${id}&auto=0&height=330`,
                tall: true
            };
        }
        return { kind: 'music', platform: 'netease', title: '网易云音乐', sub: '打开收听', url: rawUrl };
    }

    // —— Spotify：单曲直接内嵌官方播放器 ——
    if (host === 'open.spotify.com') {
        const t = u.pathname.match(/^\/(?:intl-[a-z]{2,5}\/)?(track|album|playlist)\/([a-zA-Z0-9]{10,30})/);
        if (t && t[1] === 'track') {
            return {
                kind: 'music', platform: 'spotify', title: 'Spotify', sub: '单曲 · 内嵌播放器',
                url: rawUrl,
                directEmbed: `https://open.spotify.com/embed/track/${t[2]}`,
                embedHeight: 152
            };
        }
        if (t) {
            return { kind: 'music', platform: 'spotify', title: 'Spotify', sub: t[1] === 'album' ? '专辑 · 打开收听' : '歌单 · 打开收听', url: rawUrl };
        }
        return { kind: 'music', platform: 'spotify', title: 'Spotify', sub: '打开收听', url: rawUrl };
    }

    // —— 其他音乐平台：链接卡片 ——
    if (host === 'y.qq.com' || host === 'i.y.qq.com') {
        return { kind: 'music', platform: 'qqmusic', title: 'QQ音乐', sub: '打开收听', url: rawUrl };
    }
    if (host === 'music.apple.com') {
        return { kind: 'music', platform: 'applemusic', title: 'Apple Music', sub: '打开收听', url: rawUrl };
    }

    return null;
}

// 富媒体卡片的平台图标（常量 SVG，非用户数据）
const MOMENT_MEDIA_ICONS = {
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m10 9.3 5.2 2.7-5.2 2.7z" fill="currentColor" stroke="none"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6.2l10-2v11"/><circle cx="6.3" cy="18" r="2.7"/><circle cx="16.3" cy="15.2" r="2.7"/></svg>'
};

// 触屏设备检测：网易云外链播放器按 UA 出内容，移动端 UA 拿到的是
// 0 字节空响应（实测），内嵌 iframe 必然空白，只能降级为链接卡片
const IS_TOUCH_DEVICE = typeof window.matchMedia === 'function'
    && window.matchMedia('(hover: none)').matches;

// 根据识别结果构建 DOM：单曲类直接内嵌小播放器；视频/歌单为
// 可点击卡片（有 embed 的原位展开播放器，无 embed 的新窗口打开）
function buildMomentMediaCard(media) {
    // 网易云系（单曲/歌单/专辑）在触屏设备上降级为「打开收听」链接卡片
    if ((media.directEmbed || media.embed) && media.platform === 'netease' && IS_TOUCH_DEVICE) {
        media = { ...media, sub: '打开收听', directEmbed: undefined, embed: undefined, tall: false };
    }
    if (media.directEmbed) {
        const wrap = document.createElement('div');
        wrap.className = 'moment-music-embed';
        const iframe = document.createElement('iframe');
        iframe.src = media.directEmbed;
        iframe.height = media.embedHeight || 86;
        iframe.loading = 'lazy';
        iframe.title = media.title;
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        wrap.append(iframe);
        return wrap;
    }

    const isLinkOut = !media.embed && !media.directVideo;
    const card = document.createElement(isLinkOut ? 'a' : 'button');
    card.className = 'moment-media-card';
    card.title = media.url;
    if (isLinkOut) {
        card.href = media.url;
        card.target = '_blank';
        card.rel = 'noreferrer';
    } else {
        card.type = 'button';
    }

    const icon = document.createElement('span');
    icon.className = 'mm-icon';
    icon.innerHTML = MOMENT_MEDIA_ICONS[media.kind] || MOMENT_MEDIA_ICONS.video;
    card.append(icon);

    const body = document.createElement('span');
    body.className = 'mm-body';
    const titleEl = document.createElement('span');
    titleEl.className = 'mm-title';
    titleEl.textContent = media.title;
    const subEl = document.createElement('span');
    subEl.className = 'mm-sub';
    subEl.textContent = media.sub;
    body.append(titleEl, subEl);
    card.append(body);

    const arrow = document.createElement('span');
    arrow.className = 'mm-arrow';
    arrow.textContent = isLinkOut ? '↗' : '▶';
    card.append(arrow);

    if (!isLinkOut) {
        card.addEventListener('click', () => {
            const player = document.createElement('div');
            player.className = media.tall ? 'moment-media-player is-tall' : 'moment-media-player';
            if (media.directVideo) {
                const video = document.createElement('video');
                video.src = media.directVideo;
                video.controls = true;
                video.autoplay = true;
                video.playsInline = true;
                video.preload = 'metadata';
                player.append(video);
            } else {
                const iframe = document.createElement('iframe');
                iframe.src = media.embed;
                iframe.title = media.title;
                iframe.loading = 'lazy';
                iframe.setAttribute('allow', 'fullscreen; autoplay; encrypted-media');
                player.append(iframe);
            }
            card.replaceWith(player);
        });
    }
    return card;
}

function renderMomentsState(state = 'ok') {
    const listEl = document.getElementById('momentList');
    const countEl = document.getElementById('momentCount');
    if (!listEl) return;
    listEl.innerHTML = '';

    const visible = momentsAll.filter(m => !isSiteDeleted('moment', m.issueNumber, '', m.issueUpdatedAt));
    const list = visible.filter((m) => {
        if (momentsFilter && !(m.labels || []).includes(momentsFilter)) return false;
        if (momentsLocationFilter && m.location !== momentsLocationFilter) return false;
        return true;
    });

    const isFiltering = Boolean(momentsFilter || momentsLocationFilter);

    if (countEl) {
        let filterText = '';
        if (momentsFilter && momentsLocationFilter) filterText = `#${momentsFilter} · 📍 ${momentsLocationFilter}`;
        else if (momentsFilter) filterText = `#${momentsFilter}`;
        else if (momentsLocationFilter) filterText = `📍 ${momentsLocationFilter}`;

        countEl.textContent = isFiltering
            ? `${filterText} · ${list.length} 条`
            : `共 ${visible.length} 条`;
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

    if (!visible.length) {
        const empty = document.createElement('p');
        empty.className = 'moment-empty';
        empty.textContent = '还没有说说，敬请期待';
        listEl.append(empty);
        return;
    }

    // 筛选中：顶部显示筛选条，可取消
    if (isFiltering) {
        const bar = document.createElement('div');
        bar.className = 'moment-filterbar';
        const chip = document.createElement('span');
        const descParts = [];
        if (momentsFilter) descParts.push(`#${momentsFilter}`);
        if (momentsLocationFilter) descParts.push(`📍 ${momentsLocationFilter}`);
        chip.textContent = `只看 ${descParts.join(' · ')}`;
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'moment-filter-clear';
        clear.textContent = '取消筛选 ✕';
        clear.addEventListener('click', () => {
            setMomentsFilter(null, null, true);
        });
        bar.append(chip, clear);
        listEl.append(bar);
    } else if (!list.length) {
        const empty = document.createElement('p');
        empty.className = 'moment-empty';
        empty.textContent = '该筛选条件下暂无说说';
        listEl.append(empty);
        return;
    }

    // 首页容器带 data-limit（只展示最近 N 条，不做滚动加载）；
    // 列表页全量展示：分批渲染 + 无感无限加载（滑到接近底部自动追加下一批）
    const limit = parseInt(listEl.dataset.limit, 10);
    const hasLimit = !Number.isNaN(limit) && limit > 0 && !isFiltering;
    const PAGE_SIZE = hasLimit ? limit : 8;
    let rendered = 0;
    let sentinel = null;
    let sentinelIO = null;

    if (window._momentFloatObserver) {
        window._momentFloatObserver.disconnect();
        window._momentFloatObserver = null;
    }
    let momentFloatObserver = null;
    if (!hasLimit && 'IntersectionObserver' in window) {
        momentFloatObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('moment-absorbed');
                    momentFloatObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -15px 0px',
            threshold: 0.01
        });
        window._momentFloatObserver = momentFloatObserver;
    }

    const teardownSentinel = () => {
        if (sentinelIO) sentinelIO.disconnect();
        if (sentinel) sentinel.remove();
        sentinel = sentinelIO = null;
    };

    const renderBatch = () => {
        if (sentinel) sentinel.remove(); // 先摘下哨兵，保证追加的条目都在其之前
        const batch = list.slice(rendered, rendered + PAGE_SIZE);
        batch.forEach((m, i) => {
            const globalIdx = rendered + i;
            const item = buildMomentItem(m, globalIdx);
            if (!hasLimit && momentFloatObserver) {
                if (globalIdx < 2) {
                    item.classList.add('moment-absorbed');
                } else {
                    item.classList.add('moment-item-float');
                    item.style.setProperty('--stagger-i', (globalIdx % 3));
                    const randomFloatY = 64 + Math.round(Math.random() * 20);
                    item.style.setProperty('--float-y', randomFloatY + 'px');
                    momentFloatObserver.observe(item);
                }
            }
            listEl.append(item);
        });
        rendered += batch.length;
        if (rendered < list.length && sentinel) listEl.append(sentinel);
        else teardownSentinel();
    };

    if (!hasLimit && list.length > PAGE_SIZE) {
        sentinel = document.createElement('div');
        sentinel.className = 'moment-sentinel';
        if ('IntersectionObserver' in window) {
            sentinelIO = new IntersectionObserver((entries) => {
                if (entries.some((en) => en.isIntersecting)) renderBatch();
            }, { rootMargin: '600px 0px' }); // 提前 600px 预加载，滚动中无感接续
            sentinelIO.observe(sentinel);
        } else {
            // 极旧浏览器降级：滚动事件兜底
            const onScroll = () => {
                if (!sentinel) { window.removeEventListener('scroll', onScroll); return; }
                if (sentinel.getBoundingClientRect().top < window.innerHeight + 600) renderBatch();
            };
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    }

    // 单条说说的 DOM 构建（原内联逻辑提取，供分批追加复用；itemIndex 为全局序号，前 3 张图 eager 加载）
    function buildMomentItem(m, itemIndex) {
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
        const meta = document.createElement('div');
        meta.className = 'moment-meta';

        if (m.location) {
            const loc = document.createElement('span');
            loc.className = 'moment-location';
            loc.setAttribute('role', 'button');
            loc.setAttribute('tabindex', '0');
            loc.title = `筛选位于 ${m.location} 的说说`;
            loc.addEventListener('click', (e) => {
                e.stopPropagation();
                setMomentsFilter(momentsFilter, m.location, true);
            });
            loc.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMomentsFilter(momentsFilter, m.location, true);
                }
            });
            const pinSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            pinSvg.setAttribute('viewBox', '0 0 24 24');
            pinSvg.setAttribute('width', '11');
            pinSvg.setAttribute('height', '11');
            pinSvg.setAttribute('stroke', 'currentColor');
            pinSvg.setAttribute('stroke-width', '2');
            pinSvg.setAttribute('fill', 'none');
            pinSvg.setAttribute('stroke-linecap', 'round');
            pinSvg.setAttribute('stroke-linejoin', 'round');
            pinSvg.setAttribute('aria-hidden', 'true');
            pinSvg.setAttribute('class', 'moment-loc-pin');
            const pinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pinPath.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
            const pinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            pinCircle.setAttribute('cx', '12');
            pinCircle.setAttribute('cy', '10');
            pinCircle.setAttribute('r', '3');
            pinSvg.append(pinPath, pinCircle);
            const locText = document.createElement('span');
            locText.textContent = m.location;
            loc.append(pinSvg, locText);
            meta.append(loc);
        }

        const date = document.createElement('span');
        date.className = 'moment-date';
        date.textContent = m.date;
        meta.append(date);
        head.append(meta);
        if (isSiteOwner() && Number.isInteger(m.issueNumber)) {
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'content-delete moment-delete';
            remove.textContent = '删除';
            remove.setAttribute('aria-label', `删除 ${m.date} 的说说`);
            remove.onclick = () => deleteSiteContent({ kind: 'moment', issueNumber: m.issueNumber }, remove);
            head.append(remove);
        }

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
            item.dataset.momentText = momentText;
            const text = document.createElement('p');
            text.className = 'moment-text';
            // 正文中的 URL 自动转为可点击链接；已知视频/音乐平台的链接
            // 不进文本流，改为在正文下方渲染富媒体卡片；
            // 仅用 createElement/textContent，防 XSS
            const URL_RE = /(https?:\/\/[^\s]+)/g;
            const TRAILING_PUNCT_RE = /[.,;:!?)\]}'"\u3001\u3002\uFF0C\uFF1F\uFF01\uFF1B\uFF1A\uFF09\u3011\u300B\u201D\u2019]+$/;
            const mediaCards = [];
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
                // 已识别平台的媒体链接且未超卡片数上限 → 消费为卡片；
                // 否则退回普通超链接
                const media = mediaCards.length < MOMENT_MEDIA_CARD_MAX
                    ? recognizeMomentMediaUrl(url)
                    : null;
                if (media) {
                    mediaCards.push(media);
                } else {
                    const link = document.createElement('a');
                    link.href = url;
                    link.target = '_blank';
                    link.rel = 'noreferrer';
                    link.textContent = url;
                    text.append(link);
                }
                if (punct) {
                    text.append(document.createTextNode(punct));
                }
                cursor = match.index + match[0].length;
            }
            if (cursor < momentText.length) {
                text.append(document.createTextNode(momentText.slice(cursor)));
            }
            if (text.childNodes.length) {
                item.append(text);
            }
            if (mediaCards.length) {
                const cardsWrap = document.createElement('div');
                cardsWrap.className = 'moment-media-cards';
                mediaCards.forEach((media) => {
                    cardsWrap.append(buildMomentMediaCard(media));
                });
                item.append(cardsWrap);
            }
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
                const displaySrc = (imgObj.previewUrl || rawSrc).trim();
                // 确保相对路径能正确解析为站点根相对路径，且优先展示 0 毫秒秒显的本地预览
                img.src = displaySrc.startsWith('http') || displaySrc.startsWith('/') || displaySrc.startsWith('blob:') || displaySrc.startsWith('data:') ? displaySrc : '/' + displaySrc;
                img.alt = imgObj.alt || '说说配图';
                // 前部说说采用 eager 加载，避免移动端 WebKit 0 盒模型下 lazy 观察器不触发的问题
                img.loading = itemIndex < 3 ? 'eager' : 'lazy';
                img.decoding = 'async';
                img.referrerPolicy = 'no-referrer';

                let retried = false;
                img.addEventListener('error', () => {
                    // 若本地静态路径加载失败，回退尝试 raw.githubusercontent 或原始 GitHub 附件 URL 容灾
                    if (!retried && rawSrc && !rawSrc.startsWith('http')) {
                        retried = true;
                        if (rawSrc.startsWith('assets/moments/') || rawSrc.startsWith('/assets/moments/')) {
                            const cleanPath = rawSrc.replace(/^\/+/, '');
                            img.src = `https://raw.githubusercontent.com/mfcheer/mfcheer.github.io/main/${cleanPath}`;
                            return;
                        }
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

        // 标签胶囊区：放在正文/配图下方，独立 flex-wrap 排版，点击进入筛选
        const momentTags = Array.isArray(m.labels) ? m.labels.filter(Boolean) : [];
        if (momentTags.length) {
            const tagsWrap = document.createElement('div');
            tagsWrap.className = 'moment-tags';
            momentTags.forEach((label) => {
                const tag = document.createElement('button');
                tag.type = 'button';
                tag.className = 'moment-tag';
                tag.textContent = `#${label}`;
                tag.title = `筛选 #${label} 的说说`;
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setMomentsFilter(label, momentsLocationFilter, true);
                });
                tagsWrap.append(tag);
            });
            item.append(tagsWrap);
        }

        return item;
    }

    // 首批渲染（哨兵也在此时才真正挂入 DOM，observer 随之生效）
    renderBatch();
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
        const cleanList = Array.isArray(list) ? list.map(item => {
            if (!item || !Array.isArray(item.images)) return item;
            const images = item.images.map(img => {
                if (img && img.previewUrl && img.previewUrl.startsWith("data:")) {
                    const { previewUrl, ...rest } = img;
                    return rest;
                }
                return img;
            });
            return { ...item, images };
        }) : list;
        localStorage.setItem(MOMENTS_CACHE_KEY, JSON.stringify(cleanList));
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
                        // 仅认带 moment 标签的 Issue（相册等其它类型 Issue 不进入说说流）
                        const labels = Array.isArray(it.labels) ? it.labels.map((l) => l && l.name) : [];
                        if (!labels.includes('moment')) return false;
                        const isOwner =
                            it.author_association === "OWNER" ||
                            (it.user && it.user.login && it.user.login.toLowerCase() === "mfcheer");
                        return Boolean(isOwner);
                    })
                    .map((it) => {
                        const rawContent = ((it.body || '').trim() || (it.title || '')).trim();
                        const { text, images, location } = parseMomentContent(rawContent, it.title);
                        return {
                            issueNumber: it.number,
                            issueUpdatedAt: it.updated_at,
                            date: formatMomentDate(it.created_at),
                            text,
                            location: location || '',
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
            // updateViaCache:'none'：sw.js 自身绕过 HTTP 缓存。GitHub Pages 给 sw.js 也是 max-age=600，
            // 默认情况下部署后 10 分钟内浏览器不会检查新 SW，导致新版迟迟不生效。
            .register('/sw.js', { updateViaCache: 'none' })
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

    // 新 SW 接管（skipWaiting + claim）后自动刷新一次，页面立即用上新资源；
    // 仅在页面本就有 controller 时挂监听，避免首次注册也触发刷新造成死循环。
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('controllerchange', requestSiteUpdate);
    }
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
    if (!momentModalBackdrop || momentDraft.busy) return;
    momentDraft.open = false;
    momentModalBackdrop.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    applySiteUpdate();
}

async function openMomentModal() {
    if (momentDraft.open || momentDraft.busy) return;
    momentDraft.open = true;
    await momentDraft.ready;
    selectedMomentFiles = momentDraft.files;
    selectedMomentTags = new Set(Array.isArray(momentDraft.fields.tags) ? momentDraft.fields.tags : []);
    selectedMomentLocation = typeof momentDraft.fields.location === 'string' ? momentDraft.fields.location : '';
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
            startMomentOAuth();
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
            <p class="draft-hint">草稿保存在当前浏览器，关闭后可继续编辑；支持贴入 B 站 / YouTube / 视频直链原位播放。</p>
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

            <div class="moment-location-picker">
                <span class="moment-location-label">地点：</span>
                <div class="moment-location-content" id="momentLocationContent"></div>
            </div>

            <div class="moment-modal-status" id="momentPublishStatus" style="display:none;"></div>

            <div class="moment-modal-footer">
                <button type="button" class="moment-logout-link" id="momentLogoutBtn" title="退出身份并清除本地保存的 Token">退出登录</button>
                <div class="moment-modal-btns">
                    <button type="button" class="moment-btn moment-btn-cancel" id="momentDiscardBtn">清空草稿</button>
                    <button type="button" class="moment-btn moment-btn-cancel" id="momentPublishCancelBtn">保存并关闭</button>
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

    textInput.value = momentDraft.fields.text || "";
    const saveDraft = () => momentDraft.saveFields({
        text: textInput.value,
        tags: [...selectedMomentTags],
        location: selectedMomentLocation
    });
    textInput.addEventListener("input", saveDraft);
    tagChips.forEach(chip => chip.classList.toggle("is-selected", selectedMomentTags.has(chip.dataset.tag)));
    renderSelectedPreviews(previewsWrap);

    const locContent = card.querySelector("#momentLocationContent");
    function renderLocationSelector() {
        if (!locContent) return;
        locContent.innerHTML = "";

        if (selectedMomentLocation) {
            const tag = document.createElement("div");
            tag.className = "moment-loc-tag";

            const pinSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            pinSvg.setAttribute("viewBox", "0 0 24 24");
            pinSvg.setAttribute("width", "12");
            pinSvg.setAttribute("height", "12");
            pinSvg.setAttribute("stroke", "currentColor");
            pinSvg.setAttribute("stroke-width", "2");
            pinSvg.setAttribute("fill", "none");
            pinSvg.setAttribute("stroke-linecap", "round");
            pinSvg.setAttribute("stroke-linejoin", "round");
            pinSvg.setAttribute("aria-hidden", "true");
            pinSvg.setAttribute("class", "moment-loc-pin");
            const pinPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pinPath.setAttribute("d", "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z");
            const pinCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            pinCircle.setAttribute("cx", "12");
            pinCircle.setAttribute("cy", "10");
            pinCircle.setAttribute("r", "3");
            pinSvg.append(pinPath, pinCircle);

            const txt = document.createElement("span");
            txt.className = "moment-loc-tag-text";
            txt.textContent = selectedMomentLocation;

            const editBtn = document.createElement("button");
            editBtn.type = "button";
            editBtn.className = "moment-loc-tag-edit";
            editBtn.title = "修改地点";
            editBtn.setAttribute("aria-label", "修改地点");
            editBtn.textContent = "✎";
            editBtn.onclick = () => {
                const next = prompt("修改地点名称（如：北京 · 朝阳区、西坝河）：", selectedMomentLocation);
                if (next !== null && next.trim()) {
                    selectedMomentLocation = next.trim();
                    saveDraft();
                    renderLocationSelector();
                }
            };

            const clearBtn = document.createElement("button");
            clearBtn.type = "button";
            clearBtn.className = "moment-loc-tag-clear";
            clearBtn.title = "清除地点";
            clearBtn.setAttribute("aria-label", "清除地点");
            clearBtn.innerHTML = "&times;";
            clearBtn.onclick = () => {
                selectedMomentLocation = "";
                saveDraft();
                renderLocationSelector();
            };

            tag.append(pinSvg, txt, editBtn, clearBtn);
            locContent.append(tag);
        } else {
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "moment-loc-btn";
            addBtn.id = "momentLocDetectBtn";
            addBtn.title = "获取当前位置";
            addBtn.innerHTML = `<span>📍 添加位置</span>`;

            const manualBtn = document.createElement("button");
            manualBtn.type = "button";
            manualBtn.className = "moment-loc-btn";
            manualBtn.id = "momentLocManualBtn";
            manualBtn.title = "手动输入地点";
            manualBtn.innerHTML = `<span>✏️ 自定义</span>`;

            addBtn.onclick = () => {
                if (!navigator.geolocation) {
                    const val = prompt("当前浏览器不支持自动定位，请手动输入所在地点（例如：北京 · 朝阳区）：", "");
                    if (val !== null && val.trim()) {
                        selectedMomentLocation = val.trim();
                        saveDraft();
                        renderLocationSelector();
                    }
                    return;
                }

                addBtn.disabled = true;
                addBtn.innerHTML = `<span>📍 定位中…</span>`;

                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        let detected = "";
                        try {
                            const lat = pos.coords.latitude;
                            const lon = pos.coords.longitude;
                            const controller = new AbortController();
                            const timer = setTimeout(() => controller.abort(), 3500);
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
                                signal: controller.signal,
                                headers: { Accept: "application/json" }
                            });
                            clearTimeout(timer);
                            if (res.ok) {
                                const data = await res.json();
                                const addr = data.address || {};
                                const city = addr.city || addr.town || addr.municipality || addr.state || "";
                                const district = addr.city_district || addr.suburb || addr.district || addr.county || "";
                                if (city && district && city !== district) detected = `${city} · ${district}`;
                                else if (city || district) detected = city || district;
                                else if (data.display_name) detected = data.display_name.split(",")[0].trim();
                            }
                        } catch (_) {}

                        if (!detected && pos.coords) {
                            detected = `${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`;
                        }

                        const confirmed = prompt("检测到当前位置，可直接确认或按需微调：", detected || "北京 · 朝阳区");
                        if (confirmed !== null && confirmed.trim()) {
                            selectedMomentLocation = confirmed.trim();
                            saveDraft();
                        }
                        renderLocationSelector();
                    },
                    () => {
                        const fallback = prompt("未获取到 GPS 定位，可手动输入所在地点（例如：北京 · 朝阳区）：", "");
                        if (fallback !== null && fallback.trim()) {
                            selectedMomentLocation = fallback.trim();
                            saveDraft();
                        }
                        renderLocationSelector();
                    },
                    { timeout: 6000, enableHighAccuracy: false }
                );
            };

            manualBtn.onclick = () => {
                const val = prompt("请输入所在地点（例如：北京 · 朝阳区、西坝河、阿那亚）：", "");
                if (val !== null && val.trim()) {
                    selectedMomentLocation = val.trim();
                    saveDraft();
                    renderLocationSelector();
                }
            };

            locContent.append(addBtn, manualBtn);
        }
    }
    renderLocationSelector();

    card.querySelector("#momentDiscardBtn").onclick = async () => {
        if (momentDraft.busy || !confirm("清空这份草稿的文字、标签和图片？")) return;
        setEditorBusy(momentDraft, card, true);
        await momentDraft.clear();
        selectedMomentFiles = []; selectedMomentTags.clear(); selectedMomentLocation = "";
        setEditorBusy(momentDraft, card, false);
        renderMomentModalContent();
    };
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
            saveDraft();
        });
    });

    fileInput.addEventListener("change", async () => {
        if (momentDraft.busy) return;
        const files = Array.from(fileInput.files || []);
        if (!files.length) return;
        setEditorBusy(momentDraft, card, true);
        for (const file of files) {
            if (selectedMomentFiles.length >= 9) {
                alert("最多支持上传 9 张配图");
                break;
            }
            // GIF 保留原始数据不压缩，但限制体积防止超 GitHub 接口上限
            if (file.type === "image/gif" && file.size > 15 * 1024 * 1024) {
                alert(`动图太大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 15MB 以内再上传`);
                continue;
            }
            try {
                const { dataUrl, base64 } = await compressMomentImage(file);
                selectedMomentFiles.push({ file, dataUrl, base64 });
            } catch (e) {
                showMomentToast(`图片 ${file.name} 处理失败，请重新选择`);
            }
        }
        fileInput.value = "";
        await momentDraft.saveFiles(selectedMomentFiles);
        setEditorBusy(momentDraft, card, false);
        renderSelectedPreviews(previewsWrap);
    });

    submitBtn.addEventListener("click", async () => {
        if (momentDraft.busy) return;

        // 如果处于凭据过期状态，点击按钮直接唤起重新授权
        if (submitBtn.dataset.reauth === "true") {
            await saveDraft();
            if (selectedMomentFiles.length) {
                await momentDraft.saveFiles(selectedMomentFiles);
            }
            startMomentOAuth();
            return;
        }

        const text = (textInput.value || "").trim();
        if (!text && !selectedMomentFiles.length) {
            statusEl.className = "moment-modal-status is-error";
            statusEl.textContent = "请输入说说内容或选择配图";
            statusEl.style.display = "block";
            textInput.focus();
            return;
        }

        const currentAuth = getMomentAuth();
        if (!currentAuth || !currentAuth.token) {
            await saveDraft();
            if (selectedMomentFiles.length) {
                await momentDraft.saveFiles(selectedMomentFiles);
            }
            statusEl.className = "moment-modal-status is-error";
            statusEl.textContent = "博主登录凭据已失效，草稿与图片已安全保存。请点击下方「重新授权登录」继续。";
            statusEl.style.display = "block";
            submitBtn.textContent = "重新授权登录";
            submitBtn.dataset.reauth = "true";
            submitBtn.classList.add("is-reauth");
            return;
        }

        setEditorBusy(momentDraft, card, true);
        statusEl.className = "moment-modal-status is-loading";
        statusEl.style.display = "block";

        try {
            const uploadedImageUrls = [];
            for (let i = 0; i < selectedMomentFiles.length; i++) {
                statusEl.textContent = `正在上传第 ${i + 1}/${selectedMomentFiles.length} 张配图…`;
                const item = selectedMomentFiles[i];
                const ext = item.file && item.file.type === "image/gif" ? "gif" : "jpg";
                const filename = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
                const uploadedPath = await uploadMomentImage(currentAuth.token, filename, item.base64);
                let previewUrl = "";
                if (item.file) {
                    try { previewUrl = URL.createObjectURL(item.file); } catch (_) {}
                }
                if (!previewUrl && item.dataUrl) {
                    previewUrl = item.dataUrl;
                }
                uploadedImageUrls.push({ src: uploadedPath, alt: "Image", previewUrl });
            }

            statusEl.textContent = "正在发布说说…";
            let issueBody = text;
            if (uploadedImageUrls.length) {
                const imgMarkdown = uploadedImageUrls
                    .map((img) => `<img src="${img.src}" alt="${img.alt}">`)
                    .join("\n\n");
                issueBody = issueBody ? `${issueBody}\n\n${imgMarkdown}` : imgMarkdown;
            }
            if (selectedMomentLocation) {
                issueBody = issueBody ? `${issueBody}\n\n<!-- location: ${selectedMomentLocation} -->` : `<!-- location: ${selectedMomentLocation} -->`;
            }

            const now = new Date();
            const dateStr = formatMomentDate(now.toISOString());
            const labels = ["moment", ...Array.from(selectedMomentTags)];

            const createdIssue = await createMomentIssue(currentAuth.token, `✨ 说说 · ${dateStr}`, issueBody, labels);

            // 乐观 UI 呈现：即刻插在说说列表首位
            const newMoment = {
                issueNumber: createdIssue?.number,
                issueUpdatedAt: createdIssue?.updated_at || now.toISOString(),
                date: dateStr,
                text: text,
                location: selectedMomentLocation,
                name: user.login || "mfcheer",
                avatar: user.avatar_url || "avatar.jpg",
                labels: Array.from(selectedMomentTags),
                images: uploadedImageUrls
            };
            momentsAll.unshift(newMoment);
            writeMomentsCache(momentsAll);
            renderMomentsState();

            await momentDraft.clear();
            selectedMomentFiles = []; selectedMomentTags.clear(); selectedMomentLocation = "";
            setEditorBusy(momentDraft, card, false);
            closeMomentModal();
            showMomentToast("🎉 说说发布成功！已在页面实时展示。");
        } catch (err) {
            const isAuthExpired = Boolean(err && (
                err.status === 401 ||
                (typeof err.message === "string" && (
                    err.message.includes("401") ||
                    err.message.toLowerCase().includes("bad credentials") ||
                    err.message.includes("登录已过期")
                ))
            ));

            if (isAuthExpired) {
                clearMomentAuth();
                await saveDraft();
                if (selectedMomentFiles.length) {
                    await momentDraft.saveFiles(selectedMomentFiles);
                }
                statusEl.className = "moment-modal-status is-error";
                statusEl.textContent = "博主登录凭据已失效（401），草稿与图片已安全保存。请点击下方「重新授权登录」继续。";
                statusEl.style.display = "block";
                submitBtn.textContent = "重新授权登录";
                submitBtn.dataset.reauth = "true";
                submitBtn.classList.add("is-reauth");
                setEditorBusy(momentDraft, card, false);
            } else {
                statusEl.className = "moment-modal-status is-error";
                statusEl.textContent = err.message || "发布失败，请重试";
                statusEl.style.display = "block";
                setEditorBusy(momentDraft, card, false);
            }
        }
    });

    setTimeout(() => textInput.focus(), 100);
}

function compressMomentImage(file, maxDimension = 1600, quality = 0.82) {
    // GIF 直接保留原始数据：Canvas 重绘会丢帧变静图；
    // 动图重压缩收益低，读原样 base64 上传即可
    if (file.type === "image/gif") {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                resolve({ dataUrl, base64: dataUrl.split(",")[1] });
            };
            reader.onerror = () => reject(new Error("GIF 读取失败"));
            reader.readAsDataURL(file);
        });
    }
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
                resolve({ dataUrl, base64, width, height });
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
            if (momentDraft.busy) return;
            selectedMomentFiles.splice(index, 1);
            momentDraft.saveFiles(selectedMomentFiles);
            renderSelectedPreviews(container);
        });
        container.appendChild(wrap);
    });
}

async function uploadMomentImage(token, filename, base64Content, dir = "moments") {
    const url = `https://api.github.com/repos/mfcheer/mfcheer.github.io/contents/assets/${dir}/${filename}`;
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            message: `feat(${dir}): 上传配图 ${filename} [skip ci]`,
            content: base64Content
        })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = new Error(data.message || `图片上传失败 (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return `assets/${dir}/${filename}`;
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
        const err = new Error(data.message || `创建 Issue 失败 (${res.status})`);
        err.status = res.status;
        throw err;
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

// ============================================================
// MOMENTS URL FILTER SYNC (说说 URL 参数联动与后退恢复)
// ============================================================
(function initMomentsUrlSync() {
    function syncFromUrl() {
        if (typeof window === "undefined" || !window.location) return;
        const params = new URLSearchParams(window.location.search);
        const tag = params.get("tag");
        const loc = params.get("location");
        if (tag || loc) {
            momentsFilter = tag || null;
            momentsLocationFilter = loc || null;
        } else {
            momentsFilter = null;
            momentsLocationFilter = null;
        }
    }
    window.addEventListener("popstate", () => {
        syncFromUrl();
        renderMomentsState();
    });
    syncFromUrl();
})();

// ============================================================
// INSTANT PAGE PREFETCH (跨页面无缝预加载)
// ============================================================
(function initInstantPage() {
    if (typeof window === "undefined" || !window.fetch || !document.addEventListener) return;
    const prefetched = new Set();
    const prefetch = (url) => {
        if (!url || prefetched.has(url)) return;
        try {
            const parsed = new URL(url, window.location.href);
            if (parsed.origin !== window.location.origin) return;
            if (parsed.pathname === window.location.pathname && !parsed.search) return;
            if (/\.(jpg|jpeg|png|webp|gif|svg|ico|zip|pdf)$/i.test(parsed.pathname)) return;
            prefetched.add(url);
            if (document.createElement("link").relList?.supports?.("prefetch")) {
                const link = document.createElement("link");
                link.rel = "prefetch";
                link.href = url;
                link.as = "document";
                document.head.appendChild(link);
            } else {
                fetch(url, { priority: "low" }).catch(() => {});
            }
        } catch (e) {}
    };

    let hoverTimer = null;
    document.addEventListener("mouseover", (e) => {
        const a = e.target?.closest?.("a[href]");
        if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => prefetch(a.href), 65);
    }, { passive: true });

    document.addEventListener("mouseout", () => clearTimeout(hoverTimer), { passive: true });
    document.addEventListener("touchstart", (e) => {
        const a = e.target?.closest?.("a[href]");
        if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
        const href = a.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("mailto:")) prefetch(a.href);
    }, { passive: true });
})();

// ============================================================
// GLOBAL COMMAND PALETTE (Cmd+K / Ctrl+K 全局搜索面板)
// ============================================================
(function initCommandPalette() {
    let blogPostsCache = null;
    let momentsCache = null;
    let isFetching = false;
    let backdrop = null;
    let input = null;
    let list = null;
    let selectedIndex = 0;
    let currentResults = [];

    const QUICK_NAV = [
        { title: "个人首页", desc: "关于我、生活动态与技能地图", url: "/", icon: "🏠", badge: "导航" },
        { title: "说说专页", desc: "即时想法与日常碎片记录", url: "/moments/", icon: "💬", badge: "导航" },
        { title: "相册摄影", desc: "旅途与日常风光摄影作品", url: "/gallery/", icon: "📷", badge: "导航" },
        { title: "博客文章", desc: "625+ 篇技术长文与沉淀", url: "/blog/", icon: "📝", badge: "导航" },
        { title: "书影音", desc: "看过、读过与玩过", url: "/#media", icon: "🎬", badge: "导航" },
        { title: "留言板", desc: "欢迎交流与留言", url: "/#guestbook", icon: "💌", badge: "导航" },
        { title: "切换主题模式", desc: "在深色与浅色模式之间切换", action: "toggle-theme", icon: "🌓", badge: "快捷指令" }
    ];

    const CAREER_ITEMS = [
        {
            title: "58同城",
            badge: "曾就职于",
            icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9.5 5.5h29c2.216 0 4 1.784 4 4v29c0 2.216-1.784 4-4 4h-29c-2.216 0-4-1.784-4-4v-29c0-2.216 1.784-4 4-4" fill="#FFD900"/><g fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M29.05 23.86c-2.87 0-5.217 2.465-5.217 5.479c0 3.013 2.348 5.479 5.217 5.479h3.392c2.87 0 5.218-2.466 5.218-5.48c0-3.013-2.348-5.479-5.218-5.479"/><path d="M32.703 23.86c2.87 0 5.218-2.467 5.218-5.48s-2.348-5.48-5.218-5.48H29.31c-2.87 0-5.218 2.466-5.218 5.48c0 3.013 2.348 5.48 5.218 5.48m-.26 0h3.653"/><path d="M10.287 31.335c1.25 1.1 2.292 1.54 5.001 1.54h.417c2.5 0 4.585-2.2 4.585-4.838s-2.084-4.838-4.585-4.838H10.08v-7.696h10.21"/></g></svg>`,
            keywords: ["career", "/career", "58", "58同城", "经历", "工作经历", "曾就职", "履历", "就职", "工作"]
        },
        {
            title: "字节跳动",
            badge: "曾就职于",
            icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="ico-bytedance" aria-hidden="true"><path d="M19.8772 1.4685L24 2.5326v18.9426l-4.1228 1.0563V1.4685zm-13.3481 9.428l4.115 1.0641v8.9786l-4.115 1.0642v-11.107zM0 2.572l4.115 1.0642v16.7354L0 21.428V2.572zm17.4553 5.6205v11.107l-4.1228-1.0642V9.2568l4.1228-1.0642z"/></svg>`,
            keywords: ["career", "/career", "字节", "字节跳动", "bytedance", "经历", "工作经历", "曾就职", "履历", "就职", "工作"]
        },
        {
            title: "美团",
            badge: "曾就职于",
            icon: `<svg viewBox="0 0 24 24" fill="#FFC300" aria-hidden="true"><path d="M6.923 0c-2.408 0-3.28.25-4.16.721A4.906 4.907 0 0 0 .722 2.763C.25 3.643 0 4.516 0 6.923v10.154c0 2.407.25 3.28.72 4.16a4.905 4.906 0 0 0 2.042 2.042c.88.47 1.752.721 4.16.721h10.156c2.407 0 3.28-.25 4.16-.721a4.906 4.907 0 0 0 2.04-2.042c.471-.88.722-1.753.722-4.16V6.923c0-2.407-.25-3.28-.722-4.16A4.906 4.907 0 0 0 21.238.72C20.357.251 19.484 0 17.077 0ZM4.17 7.51h1.084c.04.24.07.488.11.737h3.47c.05-.25.08-.497.1-.736h1.105a9.849 9.85 0 0 1-.09.736h1.562v.866H7.62v.696h3.642v.855h-3.64v.667h3.64v.854h-3.64v.816h3.89v.865H7.88c.775.935 2.218 1.532 3.78 1.651l-.538.936c-1.442-.17-3.103-.846-4.028-2.04-.856 1.194-2.487 1.92-4.525 2.07l.318-1.005c1.382-.02 2.814-.736 3.431-1.612h-3.62v-.865h3.86v-.816h-3.64v-.854h3.64v-.667h-3.64v-.855h3.64v-.697H2.7v-.866h1.56zm8.603.182h7.976c.358 0 .567.198.567.547v8.146H13.33c-.358 0-.557-.199-.557-.547zm1.044.885V15.5h6.455V8.577Zm3.999.476h1.024v.756h.975v.835h-.975V13c0 .806-.1 1.402-.318 2.02h-1.113c.338-.717.408-1.224.408-1.99v-2.387h-.935c-.14 1.541-.736 3.451-1.363 4.376h-1.134c.607-.855 1.303-2.526 1.472-4.376h-1.512v-.835h3.472z"/></svg>`,
            keywords: ["career", "/career", "美团", "meituan", "经历", "工作经历", "曾就职", "履历", "就职", "工作"]
        },
        {
            title: "百度",
            badge: "曾就职于",
            icon: `<svg viewBox="0 0 24 24" fill="#2932E1" aria-hidden="true"><path d="M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71 1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0zm7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735 1.933.25 3.175-1.806 3.422-3.364.252-1.555-.995-3.364-2.362-3.674a1.218 1.218 0 0 0-.261-.03zM3.582 5.535a2.811 2.811 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24-.287 1.41.686 4.425 3.297 3.864 2.617-.561 2.262-3.68 2.183-4.362-.125-1.018-1.292-2.773-2.896-2.75zm16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616 0 1.43.121 3.425 2.988 3.362 2.867-.063 2.553-3.238 2.553-3.988 0-.745-.62-2.99-2.924-2.99zm-8.264 2.478c-1.424.014-2.708.925-3.323 1.947-1.118 1.868-2.863 3.05-3.112 3.363-.25.309-3.61 2.116-2.864 5.42.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257zm-2.234 3.84l1.542.024v8.197H7.758c-1.47-.291-2.055-1.292-2.13-1.462-.072-.173-.488-.976-.268-2.343.635-2.049 2.447-2.196 2.447-2.196h1.81zm3.964 2.39v3.881c.096.413.612.488.612.488h1.614v-4.343h1.689v5.782h-3.915c-1.517-.39-1.59-1.465-1.59-1.465v-4.317zm-5.458 1.147c-.66.197-.978.708-1.05.928-.076.22-.247.78-.1 1.269.294 1.095 1.248 1.144 1.248 1.144h1.37v-3.34z"/></svg>`,
            keywords: ["career", "/career", "百度", "baidu", "经历", "工作经历", "曾就职", "履历", "就职", "工作"]
        }
    ];

    async function loadSearchData() {
        if (blogPostsCache && momentsCache) return;
        if (isFetching) return;
        isFetching = true;
        try {
            const [postsRes, momentsRes] = await Promise.allSettled([
                fetch("/data/blog-index.json"),
                fetch("/data/moments.json")
            ]);
            if (postsRes.status === "fulfilled" && postsRes.value.ok) {
                const data = await postsRes.value.json();
                blogPostsCache = Array.isArray(data.posts) ? data.posts : [];
            }
            if (momentsRes.status === "fulfilled" && momentsRes.value.ok) {
                const data = await momentsRes.value.json();
                momentsCache = Array.isArray(data) ? data : [];
            }
        } catch (e) {
            console.warn("[Search] Failed to load data:", e);
        } finally {
            isFetching = false;
            blogPostsCache = blogPostsCache || [];
            momentsCache = momentsCache || [];
        }
    }

    function createPalette() {
        if (backdrop) return;
        backdrop = document.createElement("div");
        backdrop.className = "cmd-palette-backdrop";
        backdrop.id = "cmdPalette";
        backdrop.setAttribute("role", "dialog");
        backdrop.setAttribute("aria-modal", "true");
        backdrop.setAttribute("aria-label", "全局搜索与指令");

        backdrop.innerHTML = `
            <div class="cmd-palette-dialog">
                <div class="cmd-palette-header">
                    <span class="cmd-palette-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </span>
                    <input class="cmd-palette-input" type="text" placeholder="搜索文章、说说、或输入指令…" autocomplete="off" spellcheck="false" aria-autocomplete="list">
                    <button class="cmd-palette-clear" type="button" aria-label="清空输入" hidden>✕</button>
                    <span class="cmd-palette-esc">ESC</span>
                </div>
                <div class="cmd-palette-list" role="listbox"></div>
                <div class="cmd-palette-footer">
                    <div class="cmd-palette-footer-keys">
                        <span class="cmd-palette-footer-key"><kbd>↑</kbd><kbd>↓</kbd> 移动</span>
                        <span class="cmd-palette-footer-key"><kbd>↵</kbd> 选择</span>
                        <span class="cmd-palette-footer-key"><kbd>ESC</kbd> 关闭</span>
                    </div>
                    <span>按 <kbd>⌘K</kbd> 随时唤出</span>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        input = backdrop.querySelector(".cmd-palette-input");
        list = backdrop.querySelector(".cmd-palette-list");
        const clearBtn = backdrop.querySelector(".cmd-palette-clear");

        clearBtn.addEventListener("click", () => {
            input.value = "";
            clearBtn.hidden = true;
            input.focus();
            renderResults();
        });

        input.addEventListener("input", () => {
            clearBtn.hidden = !input.value.trim();
            renderResults();
        });

        backdrop.addEventListener("click", (e) => {
            if (e.target === backdrop) closePalette();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (currentResults.length) {
                    selectedIndex = (selectedIndex + 1) % currentResults.length;
                    updateSelection();
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (currentResults.length) {
                    selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
                    updateSelection();
                }
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (currentResults[selectedIndex]) {
                    executeResult(currentResults[selectedIndex]);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                closePalette();
            }
        });
    }

    function executeResult(item) {
        closePalette();
        if (item.action === "toggle-theme") {
            const next = currentTheme === "dark" ? "light" : "dark";
            switchTheme(next);
        } else if (item.url) {
            window.location.href = item.url;
        }
    }

    function updateSelection() {
        const items = list.querySelectorAll(".cmd-palette-item");
        items.forEach((el, idx) => {
            const isSel = idx === selectedIndex;
            el.classList.toggle("is-selected", isSel);
            el.setAttribute("aria-selected", String(isSel));
            if (isSel) el.scrollIntoView({ block: "nearest" });
        });
    }

    function renderResults() {
        const query = (input?.value || "").trim().toLowerCase();
        list.innerHTML = "";
        currentResults = [];

        if (!query) {
            const groupTitle = document.createElement("div");
            groupTitle.className = "cmd-palette-group-title";
            groupTitle.textContent = "常用与导航";
            list.appendChild(groupTitle);

            QUICK_NAV.forEach((item) => {
                currentResults.push(item);
                const el = createItemElement(item, currentResults.length - 1);
                list.appendChild(el);
            });
            selectedIndex = 0;
            updateSelection();
            return;
        }

        const matchedPosts = (blogPostsCache || []).filter((p) => {
            const title = (p.title || "").toLowerCase();
            const tags = (p.tags || []).join(" ").toLowerCase();
            const summary = (p.summary || "").toLowerCase();
            return title.includes(query) || tags.includes(query) || summary.includes(query);
        }).slice(0, 8);

        const matchedMoments = (momentsCache || []).filter((m) => {
            const text = (m.text || "").toLowerCase();
            const loc = (m.location || "").toLowerCase();
            const labels = (m.labels || []).join(" ").toLowerCase();
            return text.includes(query) || loc.includes(query) || labels.includes(query);
        }).slice(0, 5);

        const matchedNav = QUICK_NAV.filter(item =>
            item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query)
        );

        if (matchedNav.length) {
            const groupTitle = document.createElement("div");
            groupTitle.className = "cmd-palette-group-title";
            groupTitle.textContent = "指令与页面";
            list.appendChild(groupTitle);
            matchedNav.forEach((item) => {
                currentResults.push(item);
                list.appendChild(createItemElement(item, currentResults.length - 1));
            });
        }

        const careerAllKeywords = ["/career", "career", "经历", "工作经历", "曾就职", "履历", "就职", "工作"];
        const matchedCareer = CAREER_ITEMS.filter(item => {
            if (careerAllKeywords.some(k => query === k || query.startsWith(k) || (k.length > 2 && query.includes(k)))) {
                return true;
            }
            const titleMatch = item.title.toLowerCase().includes(query);
            const keywordMatch = item.keywords.some(k => !careerAllKeywords.includes(k) && (k.toLowerCase().includes(query) || query.includes(k.toLowerCase())));
            return titleMatch || keywordMatch;
        });

        if (matchedCareer.length) {
            const groupTitle = document.createElement("div");
            groupTitle.className = "cmd-palette-group-title";
            groupTitle.textContent = "曾就职于";
            list.appendChild(groupTitle);
            matchedCareer.forEach((item) => {
                currentResults.push(item);
                list.appendChild(createItemElement(item, currentResults.length - 1));
            });
        }

        if (matchedPosts.length) {
            const groupTitle = document.createElement("div");
            groupTitle.className = "cmd-palette-group-title";
            groupTitle.textContent = `文章 (${matchedPosts.length})`;
            list.appendChild(groupTitle);
            matchedPosts.forEach((post) => {
                const item = {
                    title: post.title,
                    desc: `${post.dateText || ""} · ${(post.tags || []).map(t => "#" + t).join(" ")} ${post.summary || ""}`.trim(),
                    url: post.url,
                    icon: "📄",
                    badge: "文章"
                };
                currentResults.push(item);
                list.appendChild(createItemElement(item, currentResults.length - 1));
            });
        }

        if (matchedMoments.length) {
            const groupTitle = document.createElement("div");
            groupTitle.className = "cmd-palette-group-title";
            groupTitle.textContent = `说说 (${matchedMoments.length})`;
            list.appendChild(groupTitle);
            matchedMoments.forEach((m) => {
                const item = {
                    title: m.text.slice(0, 50) + (m.text.length > 50 ? "…" : ""),
                    desc: `${m.date || ""} ${m.location ? "· 📍 " + m.location : ""}`.trim(),
                    url: "/moments/",
                    icon: "💬",
                    badge: "说说"
                };
                currentResults.push(item);
                list.appendChild(createItemElement(item, currentResults.length - 1));
            });
        }

        if (!currentResults.length) {
            const empty = document.createElement("div");
            empty.className = "cmd-palette-empty";
            empty.textContent = `未找到与 “${query}” 相关的内容`;
            list.appendChild(empty);
        } else {
            selectedIndex = 0;
            updateSelection();
        }
    }

    function createItemElement(item, index) {
        const el = document.createElement("div");
        el.className = "cmd-palette-item";
        el.setAttribute("role", "option");
        el.innerHTML = `
            <span class="cmd-palette-item-icon" aria-hidden="true">${item.icon}</span>
            <div class="cmd-palette-item-content">
                <div class="cmd-palette-item-title">${item.title}</div>
                ${item.desc ? `<div class="cmd-palette-item-desc">${item.desc}</div>` : ""}
            </div>
            ${item.badge ? `<span class="cmd-palette-item-badge">${item.badge}</span>` : ""}
        `;
        el.addEventListener("click", () => executeResult(item));
        el.addEventListener("mouseenter", () => {
            selectedIndex = index;
            updateSelection();
        });
        return el;
    }

    function openPalette() {
        createPalette();
        loadSearchData();
        backdrop.classList.add("is-open");
        document.body.classList.add("lightbox-open");
        input.value = "";
        renderResults();
        setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
        if (!backdrop) return;
        backdrop.classList.remove("is-open");
        document.body.classList.remove("lightbox-open");
    }

    window.addEventListener("keydown", (e) => {
        const isK = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
        const isSlash = e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable;
        if (isK || isSlash) {
            e.preventDefault();
            if (backdrop?.classList.contains("is-open")) closePalette();
            else openPalette();
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target?.closest?.("#searchTriggerBtn")) {
            openPalette();
        }
    });

    window.openCommandPalette = openPalette;
})();

// ============================================================
// MEDIA TABS & SLIDER (书影音移动端标签切换与横滑联动)
// ============================================================
(function initMediaTabs() {
    const mediaSection = document.getElementById("media");
    if (!mediaSection) return;
    const grid = mediaSection.querySelector(".media-grid");
    const cols = mediaSection.querySelectorAll(".media-col");
    if (!grid || cols.length < 2) return;

    let tabs = mediaSection.querySelector(".media-tabs");
    if (!tabs) {
        tabs = document.createElement("div");
        tabs.className = "media-tabs";
        tabs.setAttribute("role", "tablist");
        const tabLabels = ["🎬 电影", "📚 读书", "🎮 游戏"];

        const updateTabActive = (activeIdx) => {
            tabs.querySelectorAll(".media-tab").forEach((b, i) => {
                const isCur = i === activeIdx;
                b.classList.toggle("active", isCur);
                b.setAttribute("aria-selected", String(isCur));
            });
        };

        tabLabels.forEach((label, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `media-tab${idx === 0 ? " active" : ""}`;
            btn.setAttribute("role", "tab");
            btn.setAttribute("aria-selected", String(idx === 0));
            btn.textContent = label;
            btn.addEventListener("click", () => {
                updateTabActive(idx);
                if (cols[idx]) {
                    const targetLeft = cols[idx].offsetLeft - grid.offsetLeft;
                    grid.scrollTo({ left: targetLeft, behavior: "smooth" });
                }
            });
            tabs.appendChild(btn);
        });

        grid.before(tabs);

        let scrollRaf = null;
        const syncActiveTabOnScroll = () => {
            const scrollCenter = grid.scrollLeft + grid.clientWidth / 2;
            let closestIdx = 0;
            let minDistance = Infinity;
            cols.forEach((col, i) => {
                const colCenter = col.offsetLeft - grid.offsetLeft + col.offsetWidth / 2;
                const dist = Math.abs(scrollCenter - colCenter);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestIdx = i;
                }
            });
            updateTabActive(closestIdx);
        };

        grid.addEventListener("scroll", () => {
            if (scrollRaf) cancelAnimationFrame(scrollRaf);
            scrollRaf = requestAnimationFrame(syncActiveTabOnScroll);
        }, { passive: true });
    }
})();

// ============================================================
// AI ASSISTANT DIARY CARD (随身手账交互与翻页)
// ============================================================
(function initDiaryCard() {
    const diarySection = document.getElementById("diary");
    if (!diarySection) return;
    const prevBtn = document.getElementById("diaryPrevBtn");
    const nextBtn = document.getElementById("diaryNextBtn");
    const dateLabel = document.getElementById("diaryDateLabel");
    const punchlineEl = document.getElementById("diaryPunchline");
    const contentEl = document.getElementById("diaryContent");
    const footnoteEl = document.getElementById("diaryFootnote");
    const badgeText = document.getElementById("diaryBadgeText");
    const aiBadge = document.getElementById("diaryAiBadge");
    const deckContainer = document.getElementById("diaryDeckContainer") || diarySection;

    let entries = [];
    let currentIndex = 0;
    let badgeTimer = null;

    const bodyWrap = diarySection.querySelector(".diary-body-wrap") || diarySection;

    function getBeijingDateStr(dateObj = new Date()) {
        try {
            const parts = new Intl.DateTimeFormat("zh-CN", {
                timeZone: "Asia/Shanghai",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(dateObj);
            const y = parts.find((p) => p.type === "year")?.value;
            const m = parts.find((p) => p.type === "month")?.value;
            const d = parts.find((p) => p.type === "day")?.value;
            return `${y}-${m}-${d}`;
        } catch (e) {
            const y = dateObj.getFullYear();
            const m = String(dateObj.getMonth() + 1).padStart(2, "0");
            const d = String(dateObj.getDate()).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }
    }

    function formatHumanDate(dateStr, baseDate) {
        if (!dateStr || typeof dateStr !== "string") return "";
        const parts = dateStr.trim().split("-");
        if (parts.length !== 3) return dateStr;

        const targetYear = parseInt(parts[0], 10);
        const targetMonth = parseInt(parts[1], 10);
        const targetDay = parseInt(parts[2], 10);
        if (!targetYear || !targetMonth || !targetDay) return dateStr;

        let baseDateObj = new Date();
        if (baseDate instanceof Date && !isNaN(baseDate.getTime())) {
            baseDateObj = baseDate;
        } else if (typeof baseDate === "string" && /^\d{4}-\d{2}-\d{2}/.test(baseDate)) {
            baseDateObj = new Date(baseDate);
        }

        const todayStr = getBeijingDateStr(baseDateObj);
        const [currYear, currMonth, currDay] = todayStr.split("-").map((v) => parseInt(v, 10));

        // 计算目标日期与基准日期（默认北京时间当天）的自然日历天数差
        const targetUtc = Date.UTC(targetYear, targetMonth - 1, targetDay);
        const todayUtc = Date.UTC(currYear, currMonth - 1, currDay);
        const dayDiff = Math.round((todayUtc - targetUtc) / (24 * 60 * 60 * 1000));

        if (dayDiff === 0) return "今天";
        if (dayDiff === 1) return "昨天";
        if (dayDiff === 2) return "前天";

        if (targetYear === currYear) {
            return `${targetMonth}月${targetDay}日`;
        }
        return `${targetYear}年${targetMonth}月${targetDay}日`;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatSignOff(rawNote) {
        if (!rawNote) return "— 助手速记 · 未经审阅";
        let text = rawNote.replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u, "").trim();
        if (!text.startsWith("—") && !text.startsWith("-")) {
            text = "— " + text;
        }
        return text;
    }

    function getDynamicNote(item) {
        if (item.note) return formatSignOff(item.note);
        const score = item.mood?.score ?? 80;
        if (score >= 85) return "— 助手速记 · 未经老大审阅";
        if (score >= 60) return "— 随身观察打卡 · 0 人工干预";
        return "— 守护巡更中 · 待机能耗平稳";
    }

    let lastFlipTime = 0;
    const FLIP_COOLDOWN_MS = 280;

    function flipEarlier() {
        const now = Date.now();
        if (now - lastFlipTime < FLIP_COOLDOWN_MS) return;
        lastFlipTime = now;

        if (currentIndex < entries.length - 1) {
            currentIndex++;
            renderEntry(currentIndex, true, -1);
        } else {
            if (!bodyWrap) return;
            bodyWrap.style.transition = "transform 0.15s ease-out";
            bodyWrap.style.transform = "translateX(-12px) rotate(-0.4deg)";
            setTimeout(() => {
                bodyWrap.style.transition = "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
                bodyWrap.style.transform = "translateX(0) rotate(0deg)";
            }, 150);
        }
    }

    function flipNewer() {
        const now = Date.now();
        if (now - lastFlipTime < FLIP_COOLDOWN_MS) return;
        lastFlipTime = now;

        if (currentIndex > 0) {
            currentIndex--;
            renderEntry(currentIndex, true, 1);
        } else {
            if (!bodyWrap) return;
            bodyWrap.style.transition = "transform 0.15s ease-out";
            bodyWrap.style.transform = "translateX(12px) rotate(0.4deg)";
            setTimeout(() => {
                bodyWrap.style.transition = "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2)";
                bodyWrap.style.transform = "translateX(0) rotate(0deg)";
            }, 150);
        }
    }

    function renderEntry(index, withAnim = false, direction = 0) {
        if (!entries || entries.length === 0 || !entries[index]) return;
        const item = entries[index];

        if (withAnim && bodyWrap) {
            bodyWrap.classList.add("is-switching");
            if (direction < 0) {
                bodyWrap.style.transform = "translateX(-18px) rotate(-0.4deg) scale(0.985)";
            } else if (direction > 0) {
                bodyWrap.style.transform = "translateX(18px) rotate(0.4deg) scale(0.985)";
            } else {
                bodyWrap.style.transform = "scale(0.985)";
            }
            bodyWrap.style.opacity = "0.22";
            setTimeout(() => {
                bodyWrap.classList.remove("is-switching");
                bodyWrap.style.transition = "transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2), opacity 0.22s ease";
                bodyWrap.style.transform = "translateX(0) rotate(0deg) scale(1)";
                bodyWrap.style.opacity = "1";
                setTimeout(() => {
                    if (bodyWrap) bodyWrap.style.transition = "";
                }, 300);
            }, 60);
        } else if (bodyWrap) {
            bodyWrap.style.transform = "";
            bodyWrap.style.opacity = "";
        }

        if (dateLabel) {
            dateLabel.textContent = formatHumanDate(item.date);
            const rawDate = (item.date || "").replace(/-/g, ".");
            dateLabel.title = index > 0 
                ? `${rawDate} · 点击一键回弹至最新` 
                : `${rawDate} · 点击左侧或右侧可翻阅手记`;
        }
        if (punchlineEl) {
            punchlineEl.textContent = item.punchline || "嘴上喊着‘一行代码都不想写’，身体却为了 0.3 秒鬼影帧死磕了一天。";
        }
        if (contentEl) {
            contentEl.textContent = item.content || "";
        }
        if (footnoteEl) {
            const raw = item.footnote || "";
            const tags = Array.isArray(raw)
                ? raw
                : raw.split(/\s*·\s*/).map((s) => s.trim()).filter(Boolean);
            if (tags.length > 0) {
                footnoteEl.innerHTML = tags
                    .map((tag) => `<span class="diary-stamp">${escapeHtml(tag)}</span>`)
                    .join("");
            } else {
                footnoteEl.textContent = "";
            }
        }
        if (badgeText) {
            if (badgeTimer) clearTimeout(badgeTimer);
            badgeText.textContent = getDynamicNote(item);
            badgeText.style.color = "";
        }

        // 便签层叠厚度更新：翻至最旧篇章时收起底层便签边角
        if (deckContainer) {
            if (index >= entries.length - 1) {
                deckContainer.classList.add("is-last-page");
            } else {
                deckContainer.classList.remove("is-last-page");
            }
        }

        if (prevBtn) prevBtn.disabled = index >= entries.length - 1;
        if (nextBtn) nextBtn.disabled = index <= 0;
    }

    if (dateLabel) {
        dateLabel.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex = 0;
                renderEntry(currentIndex, true, 1);
            }
        });
        dateLabel.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (currentIndex > 0) {
                    currentIndex = 0;
                    renderEntry(currentIndex, true, 1);
                }
            }
        });
    }

    if (aiBadge) {
        let easterEggIndex = 0;
        aiBadge.addEventListener("click", () => {
            aiBadge.classList.remove("is-pinging");
            void aiBadge.offsetWidth;
            aiBadge.classList.add("is-pinging");
            setTimeout(() => aiBadge.classList.remove("is-pinging"), 500);

            const currentItem = entries[currentIndex];
            if (!currentItem || !badgeText) return;
            const originalNote = getDynamicNote(currentItem);
            const messages = [
                "🤫 嘘，老大以为我只会在后台跑测试",
                "⚡️ 投喂成功！继续为老大站岗巡更",
                "☕️ 收到咖啡！今晚 23:00 准时手账复盘",
                "👀 正在悄悄翻老大的豆瓣和相册"
            ];
            badgeText.textContent = messages[easterEggIndex % messages.length];
            badgeText.style.color = "var(--accent, #3b82f6)";
            easterEggIndex++;

            if (badgeTimer) clearTimeout(badgeTimer);
            badgeTimer = setTimeout(() => {
                badgeText.textContent = originalNote;
                badgeText.style.color = "";
            }, 2600);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            flipEarlier();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            flipNewer();
        });
    }

    // 物理手势与交互系统 (Touch Gestures & Mouse Drag & Wheel)
    function applyDragTransform(dx) {
        if (!bodyWrap) return;
        const rotate = dx * 0.032;
        const opacity = Math.max(0.65, 1 - Math.abs(dx) / 500);
        bodyWrap.style.transform = `translateX(${dx}px) rotate(${rotate}deg)`;
        bodyWrap.style.opacity = opacity;
    }

    function resetDragTransform() {
        if (!bodyWrap) return;
        bodyWrap.classList.remove("is-dragging");
        bodyWrap.style.transition = "transform 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.25), opacity 0.3s ease";
        bodyWrap.style.transform = "translateX(0) rotate(0deg)";
        bodyWrap.style.opacity = "1";
        setTimeout(() => {
            if (bodyWrap) bodyWrap.style.transition = "";
        }, 360);
    }

    // 1. 移动端触屏手势 (Touch Tap & Swipe)
    let isTouchActive = false;
    let lastTouchEndTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let touchCurrentY = 0;
    let isHorizontalGesture = null;

    bodyWrap.addEventListener("touchstart", (e) => {
        if (e.target.closest("button") || e.target.closest("a")) return;
        lastTouchEndTime = Date.now();
        if (e.touches.length === 1) {
            isTouchActive = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchCurrentX = touchStartX;
            touchCurrentY = touchStartY;
            isHorizontalGesture = null;
            bodyWrap.style.transition = "none";
        }
    }, { passive: true });

    bodyWrap.addEventListener("touchmove", (e) => {
        lastTouchEndTime = Date.now();
        if (!isTouchActive || e.touches.length !== 1) return;
        touchCurrentX = e.touches[0].clientX;
        touchCurrentY = e.touches[0].clientY;
        const dx = touchCurrentX - touchStartX;
        const dy = touchCurrentY - touchStartY;

        if (isHorizontalGesture === null) {
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isHorizontalGesture = Math.abs(dx) >= Math.abs(dy);
            }
        }

        if (isHorizontalGesture) {
            if (e.cancelable) {
                e.preventDefault();
            }
            applyDragTransform(dx);
        }
    }, { passive: false });

    bodyWrap.addEventListener("touchend", () => {
        lastTouchEndTime = Date.now();
        if (!isTouchActive) return;
        isTouchActive = false;

        const dx = touchCurrentX - touchStartX;
        const dy = touchCurrentY - touchStartY;
        const dist = Math.hypot(dx, dy);

        if (dist < 12) {
            // 触屏单指轻触 Tap：检测左半屏或右半屏翻页
            const rect = bodyWrap.getBoundingClientRect();
            const tapX = touchCurrentX - rect.left;
            if (tapX < rect.width * 0.5) {
                flipEarlier();
            } else {
                flipNewer();
            }
        } else if (isHorizontalGesture) {
            // 轻滑滑动：位移超过 28px 即可翻页，动作幅度轻快灵敏
            if (dx < -28) {
                flipEarlier();
            } else if (dx > 28) {
                flipNewer();
            } else {
                resetDragTransform();
            }
        } else {
            resetDragTransform();
        }
    }, { passive: true });

    bodyWrap.addEventListener("touchcancel", () => {
        lastTouchEndTime = Date.now();
        isTouchActive = false;
        resetDragTransform();
    }, { passive: true });

    // 2. PC 端鼠标点击与拖拽 (Mouse Click & Drag)
    let isMouseDown = false;
    let isDragging = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let mouseCurrentX = 0;
    let mouseCurrentY = 0;

    bodyWrap.addEventListener("mousedown", (e) => {
        // 彻底过滤手机端 touchend 之后浏览器派发的模拟合成 mousedown 事件（防双跳）
        if (Date.now() - lastTouchEndTime < 800) return;
        if (e.button !== 0 || e.target.closest("button") || e.target.closest("a")) return;
        isMouseDown = true;
        isDragging = false;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        mouseCurrentX = mouseStartX;
        mouseCurrentY = mouseStartY;
        bodyWrap.style.transition = "none";
        if (e.cancelable) {
            e.preventDefault();
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (!isMouseDown) return;
        if (Date.now() - lastTouchEndTime < 800) {
            isMouseDown = false;
            return;
        }
        mouseCurrentX = e.clientX;
        mouseCurrentY = e.clientY;
        const dx = mouseCurrentX - mouseStartX;
        const dy = mouseCurrentY - mouseStartY;
        if (!isDragging && Math.hypot(dx, dy) > 6) {
            isDragging = true;
            bodyWrap.classList.add("is-dragging");
        }
        if (isDragging) {
            applyDragTransform(dx);
        }
    });

    window.addEventListener("mouseup", (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        if (Date.now() - lastTouchEndTime < 800) return;
        bodyWrap.classList.remove("is-dragging");

        const dx = mouseCurrentX - mouseStartX;
        const dy = mouseCurrentY - mouseStartY;
        const dist = Math.hypot(dx, dy);

        if (!isDragging || dist < 8) {
            // 纯点击事件：点击左半区向前看更早，点击右半区向后看较新
            const rect = bodyWrap.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width * 0.5) {
                flipEarlier();
            } else {
                flipNewer();
            }
        } else {
            // 鼠标拖拽：位移超 28px 执行翻页
            if (dx < -28) {
                flipEarlier();
            } else if (dx > 28) {
                flipNewer();
            } else {
                resetDragTransform();
            }
        }
        isDragging = false;
    });

    // 3. PC 端双指触控板横向拨动 (Trackpad Horizontal Scroll)
    let wheelDebounceTimer = null;
    diarySection.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            if (e.cancelable) {
                e.preventDefault();
            }
            if (Math.abs(e.deltaX) > 20) {
                if (wheelDebounceTimer) return;
                wheelDebounceTimer = setTimeout(() => { wheelDebounceTimer = null; }, 360);
                if (e.deltaX > 0) {
                    flipEarlier();
                } else {
                    flipNewer();
                }
            }
        }
    }, { passive: false });

    // 4. 键盘左右方向键 (Keyboard Navigation)
    window.addEventListener("keydown", (e) => {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
        if (activeTag === "input" || activeTag === "textarea") return;
        
        const rect = diarySection.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isInViewport) return;

        if (e.key === "ArrowLeft") {
            flipEarlier();
        } else if (e.key === "ArrowRight") {
            flipNewer();
        }
    });

        fetch("data/diary.json")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to load diary");
            return res.json();
        })
        .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
                entries = data;
                currentIndex = 0;
                renderEntry(currentIndex);
            }
        })
        .catch(() => {
            if (contentEl) {
                contentEl.textContent = "今天老大的键盘大概擦出火星了，连着给说说敲定地点交互，还果断砍掉了原本构思的表情回复——老大依旧保持着极度的克制。中午老大溜达去了百望山，感叹着南望山与许愿式编程。下午更是一眼抓出暗黑模式切换时仅 0.3s 的鬼影帧，顺手把代码块的胶囊彻底重构为一体化极客风。晚间一拍即合开启了我的手账计划，虽然今天我的上下文快被塞满了，但看着代码一行行变利落，做一本活生生的手账本还是蛮有成就感的。老大晚安，今晚早点睡，别把芯片熬烧了。";
            }
        });
})();


// ============================================================
// 文章在线编辑模块（Post Online Editor Drawer）
// 仅在文章详情页（存在 article[data-post-source]）激活
// ============================================================
(function initPostOnlineEditor() {
    const postArticle = document.querySelector('article[data-post-source]');
    if (!postArticle) return;

    const sourcePath = postArticle.getAttribute('data-post-source') || '';
    const postSlug = postArticle.getAttribute('data-post-slug') || '';
    const postTitle = postArticle.getAttribute('data-post-title') || document.querySelector('.post-title')?.textContent?.trim() || '';

    const editBtn = document.getElementById('postEditBtn');
    const footEditBtn = document.getElementById('postFootEditBtn');

    let drawerBackdrop = null;
    let isDrawerOpen = false;
    let currentSha = null;
    let originalRawContent = '';
    let originalFrontMatterRaw = '';
    let parsedMeta = {};
    let isSaving = false;
    let autoSaveTimer = null;
    let previewActive = false;

    const DRAFT_KEY = `mfcheer_post_draft_${postSlug}`;

    function syncEditBtnVisibility() {
        const isOwner = typeof isSiteOwner === 'function' ? isSiteOwner() : false;
        const displayVal = isOwner ? 'inline-flex' : 'none';
        if (editBtn) editBtn.style.display = displayVal;
        if (footEditBtn) footEditBtn.style.display = displayVal;
    }

    syncEditBtnVisibility();
    document.addEventListener('site-auth-change', syncEditBtnVisibility);

    // 快捷键监听：按 E / e 或 ⌘E 打开编辑抽屉
    window.addEventListener('keydown', (e) => {
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        const isE = e.key === 'e' || e.key === 'E';
        const target = e.target;
        const isEditingInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

        if ((isE && !isCmdOrCtrl && !isEditingInput && !e.altKey) || (isCmdOrCtrl && isE && !e.altKey)) {
            e.preventDefault();
            handleTriggerEdit();
        }
    });

    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleTriggerEdit();
        });
    }

    if (footEditBtn) {
        footEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleTriggerEdit();
        });
    }

    function handleTriggerEdit() {
        const auth = typeof getMomentAuth === 'function' ? getMomentAuth() : null;
        if (!auth || !auth.token) {
            sessionStorage.setItem('mfcheer_post_auth_return', window.location.pathname);
            sessionStorage.setItem('mfcheer_open_post_editor', '1');
            if (typeof openMomentModal === 'function') {
                openMomentModal();
            } else {
                showMomentToast('请先登录博主账号以编辑文章', false);
            }
            return;
        }
        openPostEditorDrawer();
    }

    window.openPostEditorDrawer = openPostEditorDrawer;

    let currentMode = 'edit';
    let isZenMode = false;

    function ensureDrawer() {
        if (drawerBackdrop) return;

        drawerBackdrop = document.createElement('div');
        drawerBackdrop.className = 'post-editor-backdrop';
        drawerBackdrop.id = 'postEditorBackdrop';
        drawerBackdrop.setAttribute('aria-hidden', 'true');

        drawerBackdrop.innerHTML = `
            <div class="post-editor-drawer" role="dialog" aria-modal="true" aria-labelledby="postEditorTitle">
                <div class="post-editor-header">
                    <div class="post-editor-header-left">
                        <span class="post-editor-status-dot" id="postEditorStatusDot" title="状态指示"></span>
                        <span class="post-editor-status" id="postEditorStatus">就绪</span>
                        <span class="post-editor-wordcount" id="postEditorWordCount">0 字</span>
                        <span class="post-editor-header-title-text" id="postEditorTitle" style="display:none;">${escapeHtml(postTitle)}</span>
                    </div>
                    <div class="post-editor-header-center">
                        <div class="post-editor-segmented" role="tablist">
                            <button class="post-editor-seg-btn is-active" id="postEditorModeEdit" type="button" data-mode="edit">编辑</button>
                            <button class="post-editor-seg-btn" id="postEditorModeSplit" type="button" data-mode="split">分栏</button>
                            <button class="post-editor-seg-btn" id="postEditorPreviewToggle" type="button" data-mode="preview">预览</button>
                        </div>
                    </div>
                    <div class="post-editor-header-actions">
                        <button class="post-editor-btn-icon" id="postEditorZenToggle" type="button" title="切换专注模式 (Zen Mode)" aria-label="切换专注模式">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                        </button>
                        <button class="post-editor-meta-toggle" id="postEditorMetaToggle" type="button" title="文章参数与设置">
                            <span class="meta-toggle-icon">⚙️</span>
                            <span class="meta-toggle-text">设置</span>
                        </button>
                        <button class="post-editor-btn-primary" id="postEditorSaveBtn" type="button" title="保存并提交到 GitHub (⌘S)">
                            <span class="save-icon">☁️</span>
                            <span class="save-text"><span class="save-text-full">保存并同步</span><span class="save-text-short">保存</span></span>
                        </button>
                        <button class="post-editor-close" id="postEditorCloseBtn" type="button" aria-label="关闭">&times;</button>
                    </div>
                </div>

                <div class="post-editor-alert" id="postEditorAlert" style="display:none;">
                    <span id="postEditorAlertMsg"></span>
                    <button type="button" class="post-editor-alert-btn" id="postEditorAlertBtn"></button>
                </div>

                <div class="post-editor-body">
                    <div class="post-editor-content-wrap mode-edit" id="postEditorContentWrap">
                        <div class="post-editor-pane is-editor">
                            <div class="post-editor-canvas">
                                <div class="post-editor-toolbar">
                                    <button type="button" class="post-editor-tool" data-action="bold" title="粗体 (⌘B)"><strong>B</strong></button>
                                    <button type="button" class="post-editor-tool" data-action="italic" title="斜体 (⌘I)"><em>I</em></button>
                                    <button type="button" class="post-editor-tool" data-action="heading" title="二级标题 (## )">H2</button>
                                    <button type="button" class="post-editor-tool" data-action="h3" title="三级标题 (### )">H3</button>
                                    <span class="post-editor-tool-divider"></span>
                                    <button type="button" class="post-editor-tool" data-action="quote" title="引用 (> )">❝</button>
                                    <button type="button" class="post-editor-tool" data-action="code" title="代码块 (&#96;&#96;&#96;)">‹/›</button>
                                    <button type="button" class="post-editor-tool" data-action="list" title="无序列表 (- )">•-</button>
                                    <button type="button" class="post-editor-tool" data-action="link" title="插入链接">🔗</button>
                                    <div class="post-editor-toolbar-spacer"></div>
                                    <a id="postEditorGhLink" href="https://github.com/mfcheer/mfcheer.github.io/edit/main/${encodeURIComponent(sourcePath).replace(/%2F/g, '/')}" target="_blank" rel="noreferrer" class="post-editor-gh-fallback">在 GitHub 网页编辑 ↗</a>
                                </div>

                                <textarea id="postEditorFieldTitle" class="post-editor-canvas-title" rows="1" placeholder="在此输入文章标题..." spellcheck="false"></textarea>

                                <div class="post-editor-tags-wrap" id="postEditorTagsWrap">
                                    <div class="post-editor-tags-list" id="postEditorTagsList"></div>
                                    <div class="post-editor-tag-add-wrap">
                                        <input type="text" id="postEditorTagInput" class="post-editor-tag-input" placeholder="+ 标签..." />
                                    </div>
                                </div>

                                <details class="post-editor-meta-panel" id="postEditorMetaPanel">
                                    <summary class="post-editor-meta-summary">
                                        <span>⚙️ 文章元数据与底层参数 (Front Matter)</span>
                                        <span class="post-editor-summary-arrow">›</span>
                                    </summary>
                                    <div class="post-editor-meta-fields">
                                        <div class="post-editor-field-row">
                                            <div class="post-editor-field">
                                                <label for="postEditorFieldTags">标签文本 (逗号分隔)</label>
                                                <input type="text" id="postEditorFieldTags" class="post-editor-input" placeholder="例如: 前端, 思考, 设计" />
                                            </div>
                                            <div class="post-editor-field">
                                                <label for="postEditorFieldDate">发布日期 (date)</label>
                                                <input type="text" id="postEditorFieldDate" class="post-editor-input" />
                                            </div>
                                        </div>
                                        <div class="post-editor-field">
                                            <label for="postEditorFieldSummary">摘要 (summary)</label>
                                            <textarea id="postEditorFieldSummary" class="post-editor-textarea-sm" rows="2" placeholder="文章概要，留空则保持原样"></textarea>
                                        </div>
                                    </div>
                                </details>

                                <div class="post-editor-canvas-divider"></div>

                                <textarea id="postEditorTextarea" class="post-editor-textarea" placeholder="在此编辑 Markdown 正文..." spellcheck="false"></textarea>
                            </div>
                        </div>
                        <div class="post-editor-pane is-preview" id="postEditorPreviewPane" style="display:none;">
                            <div class="post-editor-preview-canvas">
                                <div class="post-body post-editor-preview-content" id="postEditorPreviewContent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(drawerBackdrop);

        const closeBtn = drawerBackdrop.querySelector('#postEditorCloseBtn');
        closeBtn.addEventListener('click', closePostEditorDrawer);

        drawerBackdrop.addEventListener('click', (e) => {
            if (e.target === drawerBackdrop) {
                closePostEditorDrawer();
            }
        });

        // 视图分段控制
        const editModeBtn = drawerBackdrop.querySelector('#postEditorModeEdit');
        const splitModeBtn = drawerBackdrop.querySelector('#postEditorModeSplit');
        const previewBtn = drawerBackdrop.querySelector('#postEditorPreviewToggle');
        if (editModeBtn) editModeBtn.addEventListener('click', () => setEditorMode('edit'));
        if (splitModeBtn) splitModeBtn.addEventListener('click', () => setEditorMode('split'));
        if (previewBtn) previewBtn.addEventListener('click', () => setEditorMode(currentMode === 'preview' ? 'edit' : 'preview'));

        // 专注模式与高级设置
        const zenBtn = drawerBackdrop.querySelector('#postEditorZenToggle');
        if (zenBtn) zenBtn.addEventListener('click', toggleZenMode);

        const metaToggle = drawerBackdrop.querySelector('#postEditorMetaToggle');
        if (metaToggle) {
            metaToggle.addEventListener('click', () => {
                const panel = document.getElementById('postEditorMetaPanel');
                if (panel) {
                    panel.open = !panel.open;
                    if (panel.open) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }

        const saveBtn = drawerBackdrop.querySelector('#postEditorSaveBtn');
        saveBtn.addEventListener('click', handleSavePost);

        // 标题输入联动
        const titleInput = drawerBackdrop.querySelector('#postEditorFieldTitle');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                autoResizeTitle();
                scheduleAutoSave();
            });
        }

        // 标签输入与 Chips 联动
        const tagsInput = drawerBackdrop.querySelector('#postEditorFieldTags');
        if (tagsInput) {
            tagsInput.addEventListener('input', () => {
                syncTagsFromInput();
                scheduleAutoSave();
            });
        }

        const tagAddInput = drawerBackdrop.querySelector('#postEditorTagInput');
        if (tagAddInput) {
            tagAddInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = tagAddInput.value.trim().replace(/^#/, '');
                    if (val) addTag(val);
                    tagAddInput.value = '';
                }
            });
            tagAddInput.addEventListener('blur', () => {
                const val = tagAddInput.value.trim().replace(/^#/, '');
                if (val) addTag(val);
                tagAddInput.value = '';
            });
        }

        const textarea = drawerBackdrop.querySelector('#postEditorTextarea');
        textarea.addEventListener('input', () => {
            updateWordCount();
            scheduleAutoSave();
            if (previewActive) renderPreview();
        });

        textarea.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                handleSavePost();
            } else if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
                e.preventDefault();
                insertToolMarkdown('bold');
            } else if ((e.metaKey || e.ctrlKey) && (e.key === 'i' || e.key === 'I')) {
                e.preventDefault();
                insertToolMarkdown('italic');
            }
        });

        drawerBackdrop.querySelectorAll('.post-editor-tool').forEach((btn) => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                insertToolMarkdown(action);
            });
        });

        // 分栏模式同步滚动
        const editorPane = drawerBackdrop.querySelector('.post-editor-pane.is-editor');
        const previewPane = drawerBackdrop.querySelector('#postEditorPreviewPane');
        let isSyncingScroll = false;
        if (editorPane && previewPane) {
            editorPane.addEventListener('scroll', () => {
                if (currentMode !== 'split' || isSyncingScroll) return;
                isSyncingScroll = true;
                const maxEditScroll = editorPane.scrollHeight - editorPane.clientHeight;
                const maxPrevScroll = previewPane.scrollHeight - previewPane.clientHeight;
                if (maxEditScroll > 0 && maxPrevScroll > 0) {
                    previewPane.scrollTop = (editorPane.scrollTop / maxEditScroll) * maxPrevScroll;
                }
                setTimeout(() => { isSyncingScroll = false; }, 20);
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isDrawerOpen) {
                closePostEditorDrawer();
            }
        });
    }

    function setEditorMode(mode) {
        currentMode = mode;
        const wrap = document.getElementById('postEditorContentWrap');
        const editPane = drawerBackdrop ? drawerBackdrop.querySelector('.post-editor-pane.is-editor') : null;
        const previewPane = document.getElementById('postEditorPreviewPane');
        const editBtn = document.getElementById('postEditorModeEdit');
        const splitBtn = document.getElementById('postEditorModeSplit');
        const prevBtn = document.getElementById('postEditorPreviewToggle');

        [editBtn, splitBtn, prevBtn].forEach(b => b && b.classList.remove('is-active'));

        if (mode === 'edit') {
            if (editBtn) editBtn.classList.add('is-active');
            previewActive = false;
            if (wrap) wrap.className = 'post-editor-content-wrap mode-edit';
            if (editPane) editPane.style.display = 'flex';
            if (previewPane) previewPane.style.display = 'none';
        } else if (mode === 'split') {
            if (splitBtn) splitBtn.classList.add('is-active');
            previewActive = true;
            if (wrap) wrap.className = 'post-editor-content-wrap mode-split';
            if (editPane) editPane.style.display = 'flex';
            if (previewPane) previewPane.style.display = 'block';
            renderPreview();
        } else if (mode === 'preview') {
            if (prevBtn) prevBtn.classList.add('is-active');
            previewActive = true;
            if (wrap) wrap.className = 'post-editor-content-wrap mode-preview';
            if (editPane) editPane.style.display = 'none';
            if (previewPane) previewPane.style.display = 'block';
            renderPreview();
        }
    }

    function togglePreview() {
        if (currentMode === 'edit') {
            setEditorMode('preview');
        } else {
            setEditorMode('edit');
        }
    }

    function toggleZenMode() {
        isZenMode = !isZenMode;
        const drawer = drawerBackdrop ? drawerBackdrop.querySelector('.post-editor-drawer') : null;
        const zenBtn = document.getElementById('postEditorZenToggle');
        if (isZenMode) {
            if (drawer) drawer.classList.add('is-zen');
            if (zenBtn) {
                zenBtn.classList.add('is-active');
                zenBtn.setAttribute('title', '退出全屏模式');
                zenBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>';
            }
        } else {
            if (drawer) drawer.classList.remove('is-zen');
            if (zenBtn) {
                zenBtn.classList.remove('is-active');
                zenBtn.setAttribute('title', '切换专注模式 (Zen Mode)');
                zenBtn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';
            }
        }
    }

    function syncTagsFromInput() {
        const tagsInput = document.getElementById('postEditorFieldTags');
        const list = document.getElementById('postEditorTagsList');
        if (!tagsInput || !list) return;
        const raw = tagsInput.value || '';
        const tags = raw.split(',').map(s => s.trim()).filter(Boolean);
        list.innerHTML = '';
        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'post-editor-tag-chip';
            chip.innerHTML = `<span class="chip-text">#${escapeHtml(tag)}</span><button type="button" class="chip-del" title="移除标签">&times;</button>`;
            chip.querySelector('.chip-del').addEventListener('click', (e) => {
                e.stopPropagation();
                removeTag(tag);
            });
            list.appendChild(chip);
        });
    }

    function addTag(newTag) {
        const tagsInput = document.getElementById('postEditorFieldTags');
        if (!tagsInput) return;
        const clean = newTag.replace(/^#/, '').trim();
        if (!clean) return;
        const tags = (tagsInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!tags.includes(clean)) {
            tags.push(clean);
            tagsInput.value = tags.join(', ');
            syncTagsFromInput();
            scheduleAutoSave();
        }
    }

    function removeTag(tagToRemove) {
        const tagsInput = document.getElementById('postEditorFieldTags');
        if (!tagsInput) return;
        const tags = (tagsInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
        const filtered = tags.filter(t => t !== tagToRemove);
        tagsInput.value = filtered.join(', ');
        syncTagsFromInput();
        scheduleAutoSave();
    }

    function autoResizeTitle() {
        const titleInput = document.getElementById('postEditorFieldTitle');
        if (!titleInput) return;
        titleInput.style.height = 'auto';
        titleInput.style.height = Math.max(42, titleInput.scrollHeight) + 'px';
        const headerTitle = document.getElementById('postEditorTitle');
        if (headerTitle) headerTitle.textContent = titleInput.value.trim() || postTitle;
    }

    function insertToolMarkdown(action) {
        const textarea = document.getElementById('postEditorTextarea');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        let replacement = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                replacement = `**${selected || '加粗文本'}**`;
                cursorOffset = selected ? replacement.length : 2;
                break;
            case 'italic':
                replacement = `*${selected || '斜体文本'}*`;
                cursorOffset = selected ? replacement.length : 1;
                break;
            case 'heading':
            case 'h2':
                replacement = `\n## ${selected || '二级标题'}\n`;
                cursorOffset = replacement.length;
                break;
            case 'h3':
                replacement = `\n### ${selected || '三级标题'}\n`;
                cursorOffset = replacement.length;
                break;
            case 'link':
                replacement = `[${selected || '链接文字'}](https://)`;
                cursorOffset = replacement.length - 1;
                break;
            case 'quote':
                replacement = `\n> ${selected || '引用内容'}\n`;
                cursorOffset = replacement.length;
                break;
            case 'code':
                if (selected.includes(String.fromCharCode(10))) {
                    replacement = String.fromCharCode(10) + '```' + String.fromCharCode(10) + selected + String.fromCharCode(10) + '```' + String.fromCharCode(10);
                } else {
                    replacement = '`' + (selected || 'code') + '`';
                }
                cursorOffset = replacement.length;
                break;
            case 'list':
                replacement = `\n- ${selected || '列表项'}\n`;
                cursorOffset = replacement.length;
                break;
            default:
                return;
        }

        textarea.setRangeText(replacement, start, end, 'select');
        textarea.selectionStart = start + cursorOffset;
        textarea.selectionEnd = start + cursorOffset;
        textarea.focus();
        updateWordCount();
        scheduleAutoSave();
        if (previewActive) renderPreview();
    }

    function highlightSimpleCode(rawCode, rawLang) {
        let code = rawCode;
        const comments = [];
        code = code.replace(/(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) => {
            comments.push(m);
            return `___MB_COMMENT_${comments.length - 1}___`;
        });
        const strings = [];
        code = code.replace(/(&quot;[^\n&]*&quot;|&#39;[^\n&]*&#39;|`[^`\n]*`)/g, (m) => {
            strings.push(m);
            return `___MB_STRING_${strings.length - 1}___`;
        });
        code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hljs-number">$1</span>');
        code = code.replace(/\b(true|false|null|nil|undefined)\b/g, '<span class="hljs-literal">$1</span>');
        const kw = 'const|let|var|function|func|fn|def|return|if|else|elif|for|while|in|of|switch|case|break|continue|import|export|from|as|class|struct|type|interface|package|new|this|self|try|catch|finally|throw|async|await|select|from|where|insert|update|delete';
        const kwRe = new RegExp(`\\b(${kw})\\b`, 'gi');
        code = code.replace(kwRe, '<span class="hljs-keyword">$1</span>');
        code = code.replace(/___MB_STRING_(\d+)___/g, (_, idx) => `<span class="hljs-string">${strings[Number(idx)]}</span>`);
        code = code.replace(/___MB_COMMENT_(\d+)___/g, (_, idx) => `<span class="hljs-comment">${comments[Number(idx)]}</span>`);
        return code;
    }

    function renderPreview() {
        const previewContent = document.getElementById('postEditorPreviewContent');
        const textarea = document.getElementById('postEditorTextarea');
        if (!previewContent || !textarea) return;
        previewContent.innerHTML = renderSimpleMarkdown(textarea.value);
        if (typeof window._mfcheerInitCodeBlocks === 'function') {
            window._mfcheerInitCodeBlocks(previewContent);
        }
    }

    function renderSimpleMarkdown(md) {
        let text = escapeHtml(md || '');
        text = text.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
            const cleanLang = (lang || '').trim();
            const langClass = cleanLang ? ` language-${cleanLang}` : '';
            const highlighted = highlightSimpleCode(code, cleanLang);
            return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>`;
        });
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        text = text.replace(/^\> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
        text = text.replace(/^[*-]\s+(.*)$/gim, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
        text = text.split(/\n{2,}/).map(para => {
            if (/^<(h[1-6]|div|ul|blockquote|pre)/i.test(para.trim())) return para;
            return `<p>${para.replace(/\n/g, '<br>')}</p>`;
        }).join('\n');
        return text;
    }

    function updateWordCount() {
        const textarea = document.getElementById('postEditorTextarea');
        const wcEl = document.getElementById('postEditorWordCount');
        if (!textarea || !wcEl) return;
        const val = textarea.value || '';
        const cjk = (val.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
        const latin = (val.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
        const total = cjk + latin;
        wcEl.textContent = `${total.toLocaleString()} 字`;
    }

    function scheduleAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveLocalDraft();
        }, 1000);
    }

    function saveLocalDraft() {
        try {
            const textarea = document.getElementById('postEditorTextarea');
            const titleInput = document.getElementById('postEditorFieldTitle');
            const tagsInput = document.getElementById('postEditorFieldTags');
            const dateInput = document.getElementById('postEditorFieldDate');
            const summaryInput = document.getElementById('postEditorFieldSummary');

            if (!textarea) return;
            const draft = {
                title: titleInput?.value || '',
                tags: tagsInput?.value || '',
                date: dateInput?.value || '',
                summary: summaryInput?.value || '',
                body: textarea.value,
                timestamp: Date.now()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setStatus('草稿已暂存', 'draft');
        } catch (e) {}
    }

    function setStatus(msg, type = '') {
        const el = document.getElementById('postEditorStatus');
        const dot = document.getElementById('postEditorStatusDot');
        if (el) {
            el.textContent = msg;
            el.className = 'post-editor-status' + (type ? ` is-${type}` : '');
        }
        if (dot) {
            const dotType = type || (msg.includes('草稿') ? 'draft' : (msg.includes('同步') || msg.includes('正在') ? 'saving' : (msg.includes('失败') || msg.includes('未登录') ? 'error' : 'ready')));
            dot.className = 'post-editor-status-dot is-' + dotType;
        }
    }

    async function openPostEditorDrawer() {
        ensureDrawer();
        drawerBackdrop.classList.add("is-open");
        document.body.classList.add("drawer-open");
        isDrawerOpen = true;

        const titleInput = document.getElementById("postEditorFieldTitle");
        const tagsInput = document.getElementById("postEditorFieldTags");
        const dateInput = document.getElementById("postEditorFieldDate");
        const summaryInput = document.getElementById("postEditorFieldSummary");
        const textarea = document.getElementById("postEditorTextarea");
        const saveBtn = document.getElementById("postEditorSaveBtn");

        // 立即从页面 DOM / 已有元数据填入初始值，避免等待期间空置
        if (titleInput && !titleInput.value) {
            titleInput.value = postTitle;
            autoResizeTitle();
        }
        if (tagsInput && !tagsInput.value) {
            const pageTags = Array.from(document.querySelectorAll(".post-tags .post-tag")).map(el => el.textContent.replace(/^#/, "").trim()).filter(Boolean);
            if (pageTags.length) {
                tagsInput.value = pageTags.join(", ");
                syncTagsFromInput();
            }
        }
        if (dateInput && !dateInput.value) {
            const pageDate = document.querySelector(".post-meta span:first-child")?.textContent?.trim() || "";
            if (pageDate) dateInput.value = pageDate;
        }

        const hasDraft = checkAndApplyLocalDraft("");
        if (!hasDraft && textarea && !textarea.value) {
            textarea.placeholder = "正在从 GitHub 获取最新 Markdown 源码...";
        }

        const auth = typeof getMomentAuth === "function" ? getMomentAuth() : null;
        if (!auth || !auth.token) {
            setStatus("未登录", "error");
            if (saveBtn) saveBtn.disabled = true;
            return;
        }

        setStatus("同步中", "saving");
        if (saveBtn) saveBtn.disabled = true;

        try {
            const cleanPath = sourcePath.replace(/^\/+/, "");
            let fetchedRaw = "";
            let sha = null;

            try {
                const res = await fetch(`https://api.github.com/repos/mfcheer/mfcheer.github.io/contents/${encodeURIComponent(cleanPath).replace(/%2F/g, "/")}`, {
                    cache: "no-store",
                    headers: {
                        "Authorization": `Bearer ${auth.token}`,
                        "Accept": "application/vnd.github+json"
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    sha = data.sha;
                    fetchedRaw = decodeBase64Utf8(data.content);
                } else if (res.status === 401) {
                    if (typeof clearMomentAuth === "function") clearMomentAuth();
                    throw new Error("登录凭据已过期，请重新登录授权");
                } else {
                    throw new Error(`GitHub API 返回 ${res.status}`);
                }
            } catch (apiErr) {
                if (apiErr.message && apiErr.message.includes("登录凭据已过期")) {
                    throw apiErr;
                }
                // 容灾兜底：尝试拉取 raw.githubusercontent.com 公开源文件
                try {
                    const rawRes = await fetch(`https://raw.githubusercontent.com/mfcheer/mfcheer.github.io/main/${cleanPath}`, { cache: "no-store" });
                    if (rawRes.ok) {
                        fetchedRaw = await rawRes.text();
                    } else {
                        throw apiErr;
                    }
                } catch (_) {
                    throw apiErr;
                }
            }

            currentSha = sha;
            originalRawContent = fetchedRaw;

            const parsed = parseMarkdownWithFrontMatter(originalRawContent);
            originalFrontMatterRaw = parsed.frontMatterRaw;
            parsedMeta = parsed.meta;

            if (titleInput) {
                titleInput.value = parsed.meta.title || postTitle;
                autoResizeTitle();
            }
            if (tagsInput) {
                tagsInput.value = Array.isArray(parsed.meta.tags) ? parsed.meta.tags.join(", ") : (parsed.meta.tags || "");
                syncTagsFromInput();
            }
            if (dateInput) dateInput.value = parsed.meta.date || "";
            if (summaryInput) summaryInput.value = parsed.meta.summary || "";
            if (textarea && (!hasDraft || !textarea.value)) textarea.value = parsed.body;

            checkAndApplyLocalDraft(parsed.body);

            updateWordCount();
            setStatus("就绪", "ready");
            if (saveBtn) saveBtn.disabled = false;
        } catch (err) {
            setStatus(err.message || "加载源码失败", "error");
            showAlert(`加载文章源码失败: ${err.message}`, "重试", () => openPostEditorDrawer());
        }
    }

    function checkAndApplyLocalDraft(remoteBody) {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (draft.body && draft.body !== remoteBody) {
                showAlert('⚠️ 检测到本地有未保存的草稿，已为你自动恢复。', '还原为远端内容', () => {
                    const textarea = document.getElementById('postEditorTextarea');
                    if (textarea) textarea.value = remoteBody;
                    localStorage.removeItem(DRAFT_KEY);
                    hideAlert();
                    updateWordCount();
                    if (previewActive) renderPreview();
                });
                const textarea = document.getElementById('postEditorTextarea');
                if (textarea) textarea.value = draft.body;
                if (draft.title && document.getElementById('postEditorFieldTitle')) {
                    document.getElementById('postEditorFieldTitle').value = draft.title;
                    autoResizeTitle();
                }
                if (draft.tags && document.getElementById('postEditorFieldTags')) {
                    document.getElementById('postEditorFieldTags').value = draft.tags;
                    syncTagsFromInput();
                }
                if (draft.summary && document.getElementById('postEditorFieldSummary')) {
                    document.getElementById('postEditorFieldSummary').value = draft.summary;
                }
            }
        } catch (e) {}
    }

    function showAlert(msg, actionText, actionHandler) {
        const alertEl = document.getElementById('postEditorAlert');
        const msgEl = document.getElementById('postEditorAlertMsg');
        const btnEl = document.getElementById('postEditorAlertBtn');
        if (!alertEl || !msgEl || !btnEl) return;
        msgEl.textContent = msg;
        btnEl.textContent = actionText;
        btnEl.onclick = actionHandler;
        alertEl.style.display = 'flex';
    }

    function hideAlert() {
        const alertEl = document.getElementById('postEditorAlert');
        if (alertEl) alertEl.style.display = 'none';
    }

    function closePostEditorDrawer() {
        if (!drawerBackdrop || !isDrawerOpen) return;
        const textarea = document.getElementById('postEditorTextarea');
        if (textarea && textarea.value !== originalRawContent && !isSaving) {
            saveLocalDraft();
        }
        drawerBackdrop.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
        isDrawerOpen = false;
    }

    async function handleSavePost() {
        if (isSaving) return;
        const auth = typeof getMomentAuth === 'function' ? getMomentAuth() : null;
        if (!auth || !auth.token) {
            showMomentToast('登录失效，请重新授权', false);
            return;
        }

        const titleInput = document.getElementById('postEditorFieldTitle');
        const tagsInput = document.getElementById('postEditorFieldTags');
        const dateInput = document.getElementById('postEditorFieldDate');
        const summaryInput = document.getElementById('postEditorFieldSummary');
        const textarea = document.getElementById('postEditorTextarea');
        const saveBtn = document.getElementById('postEditorSaveBtn');

        const newTitle = titleInput?.value.trim() || postTitle;
        const newTags = tagsInput?.value.split(',').map(s => s.trim()).filter(Boolean) || [];
        const newDate = dateInput?.value.trim() || '';
        const newSummary = summaryInput?.value.trim() || '';
        const newBody = textarea?.value || '';

        const fullMarkdown = serializeMarkdown({
            originalFrontMatterRaw,
            meta: parsedMeta,
            title: newTitle,
            tags: newTags,
            date: newDate,
            summary: newSummary,
            body: newBody
        });

        isSaving = true;
        setStatus('正在提交到 GitHub...', 'saving');
        if (saveBtn) {
            saveBtn.disabled = true;
            const textSpan = saveBtn.querySelector('.save-text');
            if (textSpan) textSpan.innerHTML = '<span class="save-text-full">提交中…</span><span class="save-text-short">提交中</span>';
        }

        try {
            const base64Content = encodeUtf8Base64(fullMarkdown);
            const cleanPath = sourcePath.replace(/^\/+/, '');
            const commitMessage = `fix(post): update ${cleanPath.replace(/^_posts\//, '')} via web editor`;

            const res = await fetch(`https://api.github.com/repos/mfcheer/mfcheer.github.io/contents/${encodeURIComponent(cleanPath).replace(/%2F/g, '/')}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${auth.token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: base64Content,
                    sha: currentSha
                })
            });

            if (!res.ok) {
                if (res.status === 401) {
                    if (typeof clearMomentAuth === 'function') clearMomentAuth();
                    throw new Error('登录凭据已过期，请重新登录授权');
                } else if (res.status === 409) {
                    throw new Error('检测到远端已被更新 (409 Conflict)，请先备份修改后刷新重试');
                }
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `提交失败 (${res.status})`);
            }

            const data = await res.json();
            currentSha = data.content?.sha || currentSha;
            originalRawContent = fullMarkdown;
            localStorage.removeItem(DRAFT_KEY);

            setStatus('已保存', 'success');
            showMomentToast('🎉 文章修改已成功提交至 GitHub！GitHub Pages 正在构建同步。');

            applyOptimisticPostUpdate({
                title: newTitle,
                tags: newTags,
                body: newBody
            });

            setTimeout(() => {
                closePostEditorDrawer();
            }, 600);
        } catch (err) {
            setStatus(err.message || '保存失败', 'error');
            showMomentToast(err.message || '保存失败，请稍后重试', false);
        } finally {
            isSaving = false;
            if (saveBtn) {
                saveBtn.disabled = false;
                const textSpan = saveBtn.querySelector('.save-text');
                if (textSpan) textSpan.innerHTML = '<span class="save-text-full">保存并同步</span><span class="save-text-short">保存</span>';
            }
        }
    }

    function applyOptimisticPostUpdate({ title, tags, body }) {
        const titleEl = document.querySelector('.post-title');
        if (titleEl && title) titleEl.textContent = title;
        document.title = `${title} · mfcheer`;

        const tagsContainer = document.querySelector('.post-tags');
        if (tagsContainer && tags) {
            tagsContainer.innerHTML = tags.map(t => `<a class="post-tag" href="/blog/?tag=${encodeURIComponent(t)}">#${escapeHtml(t)}</a>`).join('');
        }

        const postBodyEl = document.querySelector('.post-body');
        if (postBodyEl && body) {
            postBodyEl.innerHTML = renderSimpleMarkdown(body);
            if (typeof window._mfcheerInitCodeBlocks === 'function') {
                window._mfcheerInitCodeBlocks(postBodyEl);
            }
        }
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function decodeBase64Utf8(base64Str) {
        const clean = base64Str.replace(/\s+/g, '');
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    }

    function encodeUtf8Base64(str) {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function parseMarkdownWithFrontMatter(raw) {
        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (!match) {
            return { frontMatterRaw: '', meta: {}, body: raw };
        }
        const frontMatterRaw = match[1];
        const body = match[2];
        const meta = {};
        const lines = frontMatterRaw.split(/\r?\n/);
        for (const line of lines) {
            const kv = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
            if (kv) {
                let key = kv[1].trim();
                let val = kv[2].trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                } else if (val.startsWith('[') && val.endsWith(']')) {
                    val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
                }
                meta[key] = val;
            }
        }
        return { frontMatterRaw, meta, body };
    }

    function serializeMarkdown({ originalFrontMatterRaw, meta, title, tags, date, summary, body }) {
        let lines = originalFrontMatterRaw ? originalFrontMatterRaw.split(/\r?\n/) : [];
        const newLines = [];

        let titleWritten = false;
        let tagsWritten = false;
        let dateWritten = false;
        let summaryWritten = false;

        for (const line of lines) {
            const kv = line.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
            if (kv) {
                const key = kv[1].trim();
                if (key === 'title') {
                    newLines.push(`title: ${JSON.stringify(title)}`);
                    titleWritten = true;
                    continue;
                }
                if (key === 'tags') {
                    newLines.push(`tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]`);
                    tagsWritten = true;
                    continue;
                }
                if (key === 'date') {
                    newLines.push(`date: '${date || meta.date || ''}'`);
                    dateWritten = true;
                    continue;
                }
                if (key === 'summary') {
                    if (summary) newLines.push(`summary: ${JSON.stringify(summary)}`);
                    summaryWritten = true;
                    continue;
                }
            }
            newLines.push(line);
        }

        if (!titleWritten && title) newLines.unshift(`title: ${JSON.stringify(title)}`);
        if (!tagsWritten && tags.length) newLines.push(`tags: [${tags.map(t => JSON.stringify(t)).join(', ')}]`);
        if (!dateWritten && date) newLines.push(`date: '${date}'`);
        if (!summaryWritten && summary) newLines.push(`summary: ${JSON.stringify(summary)}`);

        return `---\n${newLines.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`;
    }
})();

/* ==========================================================
   首页星尘启动器（Home Stardust Launcher）
   - 纯原生 Canvas 2D，零外部依赖
   - 仅在会话首次进入主页时呈现，2.0s 优雅从容揭幕
   ========================================================== */
function initHomeLauncher() {
    const overlay = document.getElementById("homeLauncherOverlay");
    const canvas = document.getElementById("homeLauncherCanvas");
    if (!overlay || !canvas) return;

    try {
        if (sessionStorage.getItem("mfcheer_home_launched")) {
            overlay.remove();
            return;
        }
        sessionStorage.setItem("mfcheer_home_launched", "1");
    } catch(e) {}

    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    let width = 0;
    let height = 0;
    let animationFrameId = null;

    function getOptimalParticleCount() {
        const screenArea = window.innerWidth * window.innerHeight;
        if (window.innerWidth < 600) {
            return Math.floor(Math.min(240, Math.max(180, screenArea / 3000)));
        } else {
            return Math.floor(Math.min(420, Math.max(280, screenArea / 2800)));
        }
    }

    let particleCount = getOptimalParticleCount();
    let particles = [];
    let startTime = performance.now();
    let durationMs = 2000;
    let countdownInterval = null;

    class AmbientStardust {
        constructor() {
            this.init();
        }

        init() {
            const cx = width / 2;
            const cy = height / 2;
            const angle = Math.random() * Math.PI * 2;
            const maxR = Math.hypot(width, height) * 0.55;
            const minR = Math.min(width, height) * 0.12;
            const r = Math.random() * (maxR - minR) + minR;

            this.radius = r;
            this.angle = angle;

            const depthRand = Math.random();
            if (depthRand < 0.2) {
                this.depth = "near";
                this.size = (Math.random() * 0.7 + 1.6) * dpr;
                this.baseAlpha = Math.random() * 0.35 + 0.45;
                this.speedFactor = 1.05;
            } else if (depthRand < 0.7) {
                this.depth = "mid";
                this.size = (Math.random() * 0.5 + 1.0) * dpr;
                this.baseAlpha = Math.random() * 0.3 + 0.35;
                this.speedFactor = 0.9;
            } else {
                this.depth = "far";
                this.size = (Math.random() * 0.4 + 0.6) * dpr;
                this.baseAlpha = Math.random() * 0.2 + 0.2;
                this.speedFactor = 0.7;
            }

            this.direction = Math.random() > 0.45 ? 1 : -1;
            this.radialSpeed = (Math.random() * 0.45 + 0.35) * this.speedFactor * dpr;
            this.angularSpeed = (Math.random() * 0.004 + 0.002) * this.direction * this.speedFactor;
            this.alpha = 0;

            const centerSafeZone = Math.min(width, height) * 0.18;
            this.stopRadius = Math.random() * (width * 0.3) + centerSafeZone;

            this.x = cx + Math.cos(this.angle) * this.radius;
            this.y = cy + Math.sin(this.angle) * this.radius;
        }

        update(elapsed, cx, cy) {
            if (elapsed < 450) {
                this.alpha = Math.min(this.baseAlpha, (elapsed / 450) * this.baseAlpha);
            }
            if (elapsed < 1600) {
                let distToStop = this.radius - this.stopRadius;
                if (distToStop > 0) {
                    let factor = Math.min(1, Math.max(0.12, distToStop / (width * 0.5)));
                    this.radius -= this.radialSpeed * factor * 1.5;
                }
                this.angle += this.angularSpeed;
            } else {
                this.radius += 0.5 * dpr;
                this.angle += this.angularSpeed * 0.5;
                this.y -= 0.4 * dpr;
                let fadeProgress = (elapsed - 1600) / 400;
                this.alpha = Math.max(0, this.baseAlpha * (1 - fadeProgress));
            }

            this.x = cx + Math.cos(this.angle) * this.radius;
            this.y = cy + Math.sin(this.angle) * this.radius;
        }

        draw(isDark) {
            if (this.alpha <= 0.01) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

            if (isDark) {
                ctx.fillStyle = "rgba(255, 255, 255, " + this.alpha + ")";
                ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
                ctx.shadowBlur = this.size * 1.4;
            } else {
                ctx.fillStyle = "rgba(29, 29, 31, " + (this.alpha * 0.85) + ")";
                ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
                ctx.shadowBlur = this.size * 0.8;
            }

            ctx.fill();
            ctx.restore();
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        width = window.innerWidth * dpr;
        height = window.innerHeight * dpr;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        particleCount = getOptimalParticleCount();
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new AmbientStardust());
        }
    }

    const monogram = overlay.querySelector(".home-launcher-monogram");
    const title = overlay.querySelector(".home-launcher-title");
    const countdownEl = document.getElementById("homeLauncherCountdown");

    function animate(now) {
        const elapsed = now - startTime;
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const cx = width / 2;
        const cy = height / 2;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(elapsed, cx, cy);
            particles[i].draw(isDark);
        }

        if (elapsed > 200 && monogram) {
            monogram.classList.add("visible");
        }
        if (elapsed > 400 && title) {
            title.classList.add("visible");
        }

        if (elapsed < durationMs) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            dismiss();
        }
    }

    function startTimer() {
        clearInterval(countdownInterval);
        startTime = performance.now();
        let remaining = durationMs;
        if (countdownEl) countdownEl.textContent = (remaining / 1000).toFixed(1) + "s";

        countdownInterval = setInterval(() => {
            remaining -= 100;
            if (remaining > 0) {
                if (countdownEl) countdownEl.textContent = (remaining / 1000).toFixed(1) + "s";
            } else {
                if (countdownEl) countdownEl.textContent = "0.0s";
                clearInterval(countdownInterval);
            }
        }, 100);
    }

    let isDismissed = false;
    function dismiss() {
        if (isDismissed) return;
        isDismissed = true;
        clearInterval(countdownInterval);
        overlay.classList.add("launch-exit");
        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            overlay.remove();
        }, 800);
    }

    window.addEventListener("resize", () => {
        if (isDismissed) return;
        resize();
        initParticles();
    });

    overlay.addEventListener("click", () => {
        dismiss();
    });

    resize();
    initParticles();
    startTimer();
    animationFrameId = requestAnimationFrame(animate);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeLauncher);
} else {
    initHomeLauncher();
}
