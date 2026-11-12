/**
 * gallery.js — 相册页渲染与照片灯箱
 *
 * 数据源：data/gallery.json（由 scripts/build-gallery.mjs 构建生成）
 * 布局：疏密交错的 Justified 行式——按宽高比和变化的目标行高装箱，普通照片保持原始比例，
 *       限制极端比例和行高，最后一行不强行拉伸；窗口缩放自动重排。
 * 加载：缩略图 480w + LQIP 模糊占位 + loading="lazy"，点开灯箱再取 1600w 全图。
 */
(function () {
    'use strict';

    const listEl = document.getElementById('galleryList');
    if (!listEl) return; // 非相册页直接退出

    // 页面不再展示统计数字（设计决定：墙面零文字）

    // ---------------- 数据 ----------------

    let albums = []; // [{ title, count, photos: [{src, thumb, w, h, ratio, lqip, date}] }]

    // JSON 里的图片路径是站点根相对路径（assets/...），页面在子目录时需补根前缀
    function rootUrl(p) {
        return (p.startsWith('http') || p.startsWith('/')) ? p : '/' + p;
    }

    async function loadGallery() {
        try {
            const res = await fetch('/data/gallery.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();
            albums = Array.isArray(data.albums) ? data.albums : [];
            render();
        } catch (err) {
            listEl.innerHTML = '<div class="gallery-empty">相册数据加载失败，请刷新重试。</div>';
        }
    }

    document.addEventListener('site-photo-deleted', e => {
        const { issueNumber, source } = e.detail;
        for (const album of albums) album.photos = album.photos.filter(p => !(p.issueNumber === issueNumber && p.source === source));
        render();
    });
    document.addEventListener('site-auth-change', () => render());

    // ---------------- Justified 布局 ----------------

    const GAP = 6;

    function photoRatio(photo) {
        const ratio = Number(photo.ratio) || (Number(photo.w) / Number(photo.h));
        // 仅约束墙面预览；灯箱仍使用完整原图。
        return Number.isFinite(ratio) && ratio > 0 ? Math.max(1 / 3, Math.min(3, ratio)) : 1.5;
    }

    function heightLimits(containerW) {
        return containerW < 520
            ? { min: Math.min(100, containerW / 3), max: Math.min(300, containerW * 0.85) }
            : { min: 140, max: 420 };
    }

    // 交替使用疏密不同的目标行高，照片顺序不变，刷新和分批加载时也不会随机跳动。
    function targetHeight(containerW, rowIndex = 0) {
        const rhythm = containerW < 520
            ? [0.62, 0.34, 0.46, 0.30, 0.55, 0.36]
            : [0.24, 0.38, 0.28, 0.22, 0.34, 0.26];
        const limits = heightLimits(containerW);
        return Math.max(limits.min, Math.min(limits.max, containerW * rhythm[rowIndex % rhythm.length]));
    }

    function buildRows(photos, containerW) {
        const rows = [];
        const maxItems = containerW < 520 ? 3 : 5;
        let start = 0;
        while (start < photos.length) {
            const target = targetHeight(containerW, rows.length);
            let ratioSum = 0;
            let best = null;
            for (let count = 1; count <= maxItems && start + count <= photos.length; count++) {
                ratioSum += photoRatio(photos[start + count - 1]);
                const height = (containerW - GAP * (count - 1)) / ratioSum;
                // 不为凑满一行而把照片压成细条；单张最宽也只到 3:1。
                if (height < heightLimits(containerW).min && count > 1) break;
                const score = Math.abs(Math.log(height / target));
                if (!best || score < best.score) best = { count, ratioSum, score, target };
            }
            const end = start + best.count;
            const naturalH = (containerW - GAP * (best.count - 1)) / best.ratioSum;
            const isLast = end === photos.length;
            const height = Math.min(heightLimits(containerW).max,
                isLast && naturalH > best.target * 1.35 ? best.target : naturalH);
            rows.push({ photos: photos.slice(start, end), ratioSum: best.ratioSum,
                target: best.target, isLast, height });
            start = end;
        }
        return rows;
    }

    /** 全站照片流（含尚未渲染的相册），供灯箱全局浏览 */
    function collectAllPhotos() {
        const all = [];
        for (const a of albums) {
            for (const p of a.photos) {
                if (!isSiteDeleted('photo', p.issueNumber, p.source, p.issueUpdatedAt)) all.push(Object.assign({}, p, { album: a.title }));
            }
        }
        return all;
    }

    let initialScreenRows = 3;

    function layoutWall(wall, append = false) {
        let photos;
        try { photos = JSON.parse(wall.dataset.photos); } catch { return; }
        const W = wall.clientWidth;
        if (!W || !photos.length) return;

        const existingRows = wall.querySelectorAll(".g-row");
        const startRow = append ? existingRows.length : 0;
        if (!append) wall.innerHTML = "";
        const rows = buildRows(photos, W);
        if (sentinel) sentinel.hidden = visibleRows >= rows.length;

        const seenYears = new Set(Array.from(wall.querySelectorAll(".gallery-year-anchor")).map(a => a.dataset.year));
        const vh = window.innerHeight || document.documentElement.clientHeight || 800;

        for (let rIdx = startRow; rIdx < Math.min(visibleRows, rows.length); rIdx++) {
            const rowData = rows[rIdx];
            const firstDate = rowData.photos.find(p => p.date)?.date || "";
            const yearMatch = firstDate.match(/^(\d{4})/);
            if (yearMatch && !seenYears.has(yearMatch[1])) {
                const year = yearMatch[1];
                seenYears.add(year);
                const anchor = document.createElement("div");
                anchor.className = "gallery-year-anchor";
                anchor.id = `gallery-year-${year}`;
                anchor.dataset.year = year;
                wall.appendChild(anchor);
            }
            // 达到高度上限时允许行尾留白，避免拉伸照片或产生超高大图。
            const rowH = rowData.height;

            const rowEl = document.createElement("div");
            rowEl.className = "g-row g-row-float";
            rowEl.style.height = rowH + "px";

            // 同一行内照片随机分配吸附延迟顺序（不再按从左到右机械顺序排列）
            const count = rowData.photos.length;
            const staggerOrder = Array.from({ length: count }, (_, i) => i);
            for (let i = count - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [staggerOrder[i], staggerOrder[j]] = [staggerOrder[j], staggerOrder[i]];
            }

            rowData.photos.forEach((p, idx) => {
                const itemW = rowH * photoRatio(p);
                const itemEl = document.createElement("button");
                itemEl.type = "button";
                itemEl.className = "g-item";
                itemEl.style.width = itemW + "px";
                // 随机乱序 + 屏幕最底边飞升起跳位移 (240px ~ 300px)
                const order = staggerOrder[idx] !== undefined ? staggerOrder[idx] : idx;
                itemEl.style.setProperty("--stagger-i", order);
                const randomFloatY = 240 + Math.round(Math.random() * 50);
                itemEl.style.setProperty("--float-y", randomFloatY + "px");
                itemEl.style.backgroundImage = p.lqip ? ("url('" + p.lqip + "')") : "none";
                itemEl.setAttribute("aria-label", [p.album, p.date ? p.date.slice(0, 10) : "", "查看照片"].filter(Boolean).join(" · "));

                const img = document.createElement("img");
                img.src = rootUrl(p.thumb);
                img.alt = p.date || "";
                img.loading = "lazy";
                img.decoding = "async";
                img.addEventListener("load", () => itemEl.classList.add("g-loaded"));
                img.addEventListener("error", () => itemEl.classList.add("g-error"));

                itemEl.addEventListener("click", () => {
                    const globalPhotos = collectAllPhotos();
                    // JSON.parse 会产生新对象，不能按引用匹配，按 src 定位
                    const startIdx = Math.max(0, globalPhotos.findIndex((q) => q.src === p.src && q.issueNumber === p.issueNumber && q.source === p.source));
                    openLightbox(globalPhotos, startIdx);
                });

                itemEl.append(img);
                rowEl.appendChild(itemEl);
            });
            wall.appendChild(rowEl);

            // 首屏照片（初次整墙渲染且处于视口内）直接固化展现；后续随手势滚动逐行挂载的新行由观察器触发屏幕底边反重力吸附
            const isInitialRow = !append && rIdx < initialScreenRows;
            if (isInitialRow || !floatObserver) {
                rowEl.classList.add("g-absorbed");
            } else {
                floatObserver.observe(rowEl);
            }
        }

        // 视口未撑满时的自愈填充保护
        if (sentinel && !sentinel.hidden && visibleRows < rows.length) {
            const sRect = sentinel.getBoundingClientRect();
            if (sRect.top <= vh + 100) {
                requestAnimationFrame(() => {
                    if (visibleRows < rows.length) {
                        visibleRows += 1;
                        layoutWall(wall, true);
                    }
                });
            }
        }
    }

    // ---------------- 连续照片墙：按行逐行动态加载与底边吸附 ----------------
    const ROW_BATCH = 1;
    let visibleRows = ROW_BATCH;
    let sentinel = null;
    let sentinelIO = null;
    let floatObserver = null;

    function initFloatObserver() {
        if (floatObserver) {
            floatObserver.disconnect();
            floatObserver = null;
        }
        if (!("IntersectionObserver" in window)) return;
        floatObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("g-absorbed");
                    floatObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: "0px 0px -10px 0px",
            threshold: 0.01
        });
    }

    function renderYearNav(photos) {
        let yearNav = document.getElementById('galleryYearNav');
        const years = [...new Set(photos.map(p => (p.date || '').slice(0, 4)).filter(y => y && /^\d{4}$/.test(y)))].sort().reverse();
        if (years.length <= 1) {
            if (yearNav) yearNav.remove();
            return;
        }
        if (!yearNav) {
            yearNav = document.createElement('nav');
            yearNav.id = 'galleryYearNav';
            yearNav.className = 'gallery-year-nav';
            yearNav.setAttribute('aria-label', '相册年份快速定位');
            listEl.before(yearNav);
        }
        yearNav.innerHTML = years.map((y, idx) =>
            `<button class="gallery-year-btn${idx === 0 ? " active" : ""}" type="button" data-year="${y}">${y}</button>`
        ).join('');

        yearNav.querySelectorAll(".gallery-year-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const year = btn.dataset.year;
                const wall = document.querySelector(".gallery-wall");
                if (wall && wall.dataset.photos) {
                    try {
                        const photos = JSON.parse(wall.dataset.photos);
                        const rows = buildRows(photos, wall.clientWidth);
                        const targetIdx = rows.findIndex(r => r.photos.some(p => (p.date || "").startsWith(year)));
                        if (targetIdx !== -1 && visibleRows <= targetIdx) {
                            visibleRows = targetIdx + 2;
                            layoutWall(wall, true);
                        }
                    } catch {}
                }
                const anchor = document.getElementById(`gallery-year-${year}`);
                if (anchor) {
                    anchor.scrollIntoView({ behavior: "smooth" });
                    yearNav.querySelectorAll(".gallery-year-btn").forEach(b => b.classList.toggle("active", b === btn));
                }
            });
        });
        const onScrollYear = () => {
            const anchors = Array.from(document.querySelectorAll('.gallery-year-anchor'));
            const scrollY = window.scrollY + 140;
            let currentYear = years[0];
            for (const a of anchors) {
                if (a.offsetTop <= scrollY) {
                    currentYear = a.dataset.year;
                }
            }
            yearNav.querySelectorAll('.gallery-year-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.year === currentYear);
            });
        };
        window.removeEventListener('scroll', window._onGalleryScrollYear);
        window._onGalleryScrollYear = onScrollYear;
        window.addEventListener('scroll', onScrollYear, { passive: true });
    }

    function render() {
        initFloatObserver();
        if (sentinelIO) sentinelIO.disconnect();
        sentinelIO = null;
        sentinel = document.getElementById("gallerySentinel");
        if (sentinel) sentinel.hidden = true;
        listEl.innerHTML = "";
        
        const photos = collectAllPhotos();
        if (!photos.length) {
            listEl.innerHTML =
                "<div class=\"gallery-empty\">" +
                "<p>相册还没有照片。</p>" +
                "<p class=\"gallery-empty-hint\">去 GitHub 建一个带 <code>gallery</code> 标签的 Issue，拖入照片发布，几分钟内就会自动出现在这里。</p>" +
                "</div>";
            return;
        }

        const wall = document.createElement("div");
        wall.className = "gallery-wall";
        wall.dataset.photos = JSON.stringify(photos);
        listEl.appendChild(wall);
        renderYearNav(photos);

        const W = wall.clientWidth || window.innerWidth || 800;
        initialScreenRows = Math.max(2, Math.min(4, Math.ceil((window.innerHeight || 800) / (W < 520 ? 190 : 250))));
        visibleRows = initialScreenRows;

        if (sentinel && "IntersectionObserver" in window) {
            sentinelIO = new IntersectionObserver((entries) => {
                if (entries.some((en) => en.isIntersecting) && !sentinel.hidden) {
                    const allP = collectAllPhotos();
                    const allR = buildRows(allP, wall.clientWidth || W);
                    if (visibleRows < allR.length) {
                        visibleRows += 1; // 一行一行动态按需加载
                        layoutWall(wall, true);
                    }
                }
            }, { rootMargin: "120px 0px" });
            sentinelIO.observe(sentinel);
        } else {
            // 不支持观察器时全部展示，图片依然由浏览器延迟加载。
            visibleRows = Infinity;
        }
        layoutWall(wall);
    }

    // 响应式重排
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initFloatObserver();
            document.querySelectorAll('.gallery-wall').forEach((wall) => layoutWall(wall));
        }, 150);
    });

    // 相册与文章、说说共用灯箱。
    function openLightbox(photos, idx) {
        openSitePhotos(photos.map(p => ({
            issueNumber: p.issueNumber,
            source: p.source,
            src: rootUrl(p.src),
            caption: [p.album, p.date && p.date.slice(0, 10)].filter(Boolean).join(' · '),
            album: p.album,
            date: p.date,
            w: p.w,
            h: p.h,
            exif: p.exif
        })), idx);
    }

    // ---------------- 站内上传发布 ----------------
    // 与说说同链路：OAuth 登录 → 压缩 → contents API 传 assets/gallery/ → 创建 gallery 标签 Issue，
    // 同步流水线（build-gallery.mjs）随后自动拉取处理。Issue 格式与 GitHub 模板一致：
    // 标题「📷 相册 {名}」，正文「### 相册简介」段 + 图片行（extractImages/extractDescription 解析）。

    const GALLERY_MAX_IMAGES = 30;
    let galleryUploadBackdrop = null;
    let galleryUploadFiles = []; // [{ file, dataUrl, upload: { filename, base64, sha, attempted, path } }]
    let galleryUploadBusy = false;
    const galleryDraft = createSiteDraft('gallery');

    function fileToRawBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = () => reject(new Error('读取文件失败'));
            reader.readAsDataURL(file);
        });
    }

    function ensureGalleryUploadModal() {
        if (galleryUploadBackdrop) return;
        galleryUploadBackdrop = document.createElement('div');
        galleryUploadBackdrop.className = 'moment-modal-backdrop';
        galleryUploadBackdrop.innerHTML = '<div class="moment-modal-card" id="galleryUploadCard" role="dialog" aria-modal="true" aria-label="上传照片"></div>';
        document.body.appendChild(galleryUploadBackdrop);
        galleryUploadBackdrop.addEventListener('click', (e) => {
            if (e.target === galleryUploadBackdrop && !galleryUploadBusy) closeGalleryUploadModal();
        });
        document.addEventListener('keydown', galleryUploadEscHandler);
    }

    function galleryUploadEscHandler(e) {
        if (e.key === 'Escape' && !galleryUploadBusy) closeGalleryUploadModal();
    }

    function closeGalleryUploadModal() {
        if (!galleryUploadBackdrop || galleryUploadBusy) return;
        galleryDraft.open = false;
        document.removeEventListener('keydown', galleryUploadEscHandler);
        galleryUploadBackdrop.remove();
        galleryUploadBackdrop = null;
        document.body.classList.remove('lightbox-open');
        applySiteUpdate();
    }

    function renderGalleryUploadPreviews(previewsEl) {
        if (!previewsEl) return;
        previewsEl.innerHTML = '';
        galleryUploadFiles.forEach((item, index) => {
            const wrap = document.createElement('div');
            wrap.className = 'moment-thumb-item';
            wrap.innerHTML = `
                <img class="moment-thumb-img" src="${item.dataUrl}" alt="预览">
                <button class="moment-thumb-del" type="button" title="移除照片">&times;</button>
            `;
            if (item.upload?.path) {
                const badge = document.createElement('span');
                badge.className = 'gallery-upload-badge';
                badge.style.cssText = 'position:absolute;left:4px;bottom:4px;padding:2px 5px;border-radius:4px;background:rgba(0,0,0,.72);color:#fff;font-size:11px;pointer-events:none';
                badge.textContent = '已上传';
                wrap.appendChild(badge);
            }
            wrap.querySelector('.moment-thumb-del').disabled = galleryUploadBusy || Boolean(galleryDraft.fields.publish);
            wrap.querySelector('.moment-thumb-del').addEventListener('click', () => {
                if (galleryUploadBusy || galleryDraft.fields.publish) return;
                URL.revokeObjectURL(galleryUploadFiles[index].dataUrl);
                galleryUploadFiles.splice(index, 1);
                galleryDraft.saveFiles(galleryUploadFiles);
                renderGalleryUploadPreviews(previewsEl);
                updateGalleryResumeUI();
            });
            previewsEl.appendChild(wrap);
        });
    }

    async function renderGalleryUploadModal() {
        if (galleryUploadBusy) return;
        galleryDraft.open = true;
        await galleryDraft.ready;
        galleryUploadFiles = galleryDraft.files;
        ensureGalleryUploadModal();
        // CSS 默认 opacity:0 + visibility:hidden，必须加 is-open 才可见（与说说弹窗同机制）。
        // 此前漏加导致弹窗在 DOM 中但不可见，表现为「点击无反应」。
        // rAF：先以隐藏态入 DOM，下一帧加类以触发淡入过渡。
        requestAnimationFrame(() => {
            if (galleryUploadBackdrop) galleryUploadBackdrop.classList.add('is-open');
        });
        document.body.classList.add('lightbox-open');
        const card = document.getElementById('galleryUploadCard');
        const auth = typeof getMomentAuth === 'function' ? getMomentAuth() : null;

        // 未认证视图：引导授权（记录回跳意图，授权成功后由首页 checkOAuthCallback 送回本页）
        if (!auth || !auth.token) {
            card.innerHTML = `
                <div class="moment-modal-header">
                    <div class="moment-user-info"><span class="moment-user-name">上传照片到相册</span></div>
                    <button class="moment-modal-close" type="button" aria-label="关闭">&times;</button>
                </div>
                <div class="moment-modal-body">
                    <p style="margin:0 0 14px;font-size:14px;opacity:.75;line-height:1.7;">发布需要验证博主身份（@mfcheer）。使用 GitHub 授权登录后即可在本页完成选图与上传，无需跳转 GitHub 网站。</p>
                    <div class="moment-modal-status" id="galleryAuthStatus" style="display:none;"></div>
                    <div class="moment-modal-btns" style="justify-content:center;gap:10px;">
                        <button type="button" class="moment-btn moment-btn-primary" id="galleryOauthBtn">GitHub 授权登录</button>
                    </div>
                    <p style="margin:14px 0 0;text-align:center;font-size:12.5px;opacity:.6;">
                        授权不可用时也可 <a href="https://github.com/mfcheer/mfcheer.github.io/issues/new?template=gallery.yml&labels=gallery" target="_blank" rel="noreferrer">前往 GitHub 提交相册 Issue ↗</a>
                    </p>
                </div>
            `;
            card.querySelector('.moment-modal-close').addEventListener('click', closeGalleryUploadModal);
            card.querySelector('#galleryOauthBtn').addEventListener('click', () => {
                sessionStorage.setItem('mfcheer_post_auth_return', '/gallery/');
                const config = getOAuthConfig();
                if (!config.clientId || config.clientId.includes('XXXX')) {
                    const inputId = prompt('【初次使用 GitHub 授权登录】\n请填入你的 GitHub OAuth App Client ID（只需填一次，保存在当前设备）：');
                    if (!inputId || !inputId.trim()) { sessionStorage.removeItem('mfcheer_post_auth_return'); return; }
                    localStorage.setItem('mfcheer_github_oauth_client_id', inputId.trim());
                    config.clientId = inputId.trim();
                }
                if (!config.proxy) {
                    const proxy = prompt('【需要 OAuth 代理服务】\n请填入你的 OAuth Gatekeeper/Proxy 代理地址（用于安全换取 Token）：');
                    if (!proxy || !proxy.trim()) { sessionStorage.removeItem('mfcheer_post_auth_return'); return; }
                    localStorage.setItem('mfcheer_github_oauth_proxy', proxy.trim());
                    config.proxy = proxy.trim();
                }
                const redirectUri = window.location.origin + '/';
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(config.clientId)}&scope=public_repo&redirect_uri=${encodeURIComponent(redirectUri)}`;
            });
            return;
        }

        // 已认证视图：相册选择 + 简介 + 多图上传
        const user = auth.user || { login: 'mfcheer', avatar_url: 'avatar.jpg' };
        const albumOptions = albums.map((a) => `<option value="${a.title.replace(/"/g, '&quot;')}"></option>`).join('');
        card.innerHTML = `
            <div class="moment-modal-header">
                <div class="moment-user-badge">
                    <img class="moment-modal-avatar" src="${user.avatar_url || 'avatar.jpg'}" alt="${user.login || 'mfcheer'}">
                    <div class="moment-user-info">
                        <span class="moment-user-name">${user.login || 'mfcheer'}</span>
                        <span class="moment-user-tag">博主已认证</span>
                    </div>
                </div>
                <button class="moment-modal-close" type="button" aria-label="关闭">&times;</button>
            </div>
            <div class="moment-modal-body">
                <p class="draft-hint">草稿和上传进度保存在当前浏览器，关闭或刷新后可继续；重试只补传未完成的照片。</p>
                <input id="galleryAlbumName" class="moment-textarea" list="galleryAlbumOptions" style="min-height:0;height:42px;padding:10px 14px;resize:none;margin-bottom:10px;" maxlength="40" placeholder="相册名称（留空则自动按月份分组）">
                <datalist id="galleryAlbumOptions">${albumOptions}</datalist>
                <textarea id="galleryAlbumDesc" class="moment-textarea" rows="2" maxlength="200" placeholder="相册简介（可选，最多 200 字）"></textarea>

                <div class="moment-img-picker-wrap">
                    <div class="moment-img-previews" id="galleryImgPreviews"></div>
                    <label class="moment-add-img-btn" id="galleryAddImgBtn" title="添加照片">
                        <input type="file" id="galleryFileInput" accept="image/*" multiple hidden>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span>添加照片（最多 ${GALLERY_MAX_IMAGES} 张）</span>
                    </label>
                </div>

                <div class="moment-modal-status" id="galleryUploadStatus" role="status" aria-live="polite" style="display:none;"></div>

                <div class="moment-modal-footer">
                    <button type="button" class="moment-logout-link" id="galleryLogoutBtn" title="退出身份并清除本地保存的 Token">退出登录</button>
                    <div class="moment-modal-btns">
                        <button type="button" class="moment-btn moment-btn-cancel" id="galleryDiscardBtn">清空草稿</button>
                        <button type="button" class="moment-btn moment-btn-cancel" id="galleryUploadCancelBtn">保存并关闭</button>
                        <button type="button" class="moment-btn moment-btn-primary" id="gallerySubmitBtn">上传并发布</button>
                    </div>
                </div>
            </div>
        `;

        const closeBtn = card.querySelector('.moment-modal-close');
        const fileInput = card.querySelector('#galleryFileInput');
        const previewsEl = card.querySelector('#galleryImgPreviews');
        const statusEl = card.querySelector('#galleryUploadStatus');
        const submitBtn = card.querySelector('#gallerySubmitBtn');

        const nameInput = card.querySelector('#galleryAlbumName');
        const descInput = card.querySelector('#galleryAlbumDesc');
        nameInput.value = galleryDraft.fields.name || '';
        descInput.value = galleryDraft.fields.desc || '';
        const saveDraft = () => galleryDraft.saveFields({ ...galleryDraft.fields, name: nameInput.value, desc: descInput.value });
        nameInput.addEventListener('input', saveDraft);
        descInput.addEventListener('input', saveDraft);
        renderGalleryUploadPreviews(previewsEl);
        updateGalleryResumeUI();
        card.querySelector('#galleryDiscardBtn').onclick = async () => {
            if (galleryUploadBusy || !confirm('清空这份相册草稿和上传进度？已上传的文件不会删除；如果刚才发布结果不明，请先重试确认是否已发布。')) return;
            galleryUploadBusy = true;
            setEditorBusy(galleryDraft, card, true);
            galleryUploadFiles.forEach(item => URL.revokeObjectURL(item.dataUrl));
            await galleryDraft.clear();
            galleryUploadFiles = [];
            galleryUploadBusy = false;
            setEditorBusy(galleryDraft, card, false);
            renderGalleryUploadModal();
        };
        closeBtn.addEventListener('click', () => { if (!galleryUploadBusy) closeGalleryUploadModal(); });
        card.querySelector('#galleryUploadCancelBtn').addEventListener('click', () => { if (!galleryUploadBusy) closeGalleryUploadModal(); });
        card.querySelector('#galleryLogoutBtn').addEventListener('click', () => {
            if (galleryUploadBusy) return;
            if (confirm('确定退出博主身份并清除本地保存的 Token 吗？')) {
                clearMomentAuth();
                showMomentToast('已退出博主身份');
                renderGalleryUploadModal();
            }
        });

        fileInput.addEventListener('change', () => {
            if (galleryUploadBusy || galleryDraft.fields.publish) return;
            const picked = Array.from(fileInput.files || []);
            fileInput.value = '';
            for (const f of picked) {
                if (!f.type.startsWith('image/')) continue;
                if (galleryUploadFiles.length >= GALLERY_MAX_IMAGES) {
                    statusEl.className = 'moment-modal-status is-error';
                    statusEl.style.display = 'block';
                    statusEl.textContent = `一次最多上传 ${GALLERY_MAX_IMAGES} 张照片`;
                    break;
                }
                galleryUploadFiles.push({ file: f, dataUrl: URL.createObjectURL(f) });
            }
            galleryDraft.saveFiles(galleryUploadFiles);
            renderGalleryUploadPreviews(previewsEl);
            updateGalleryResumeUI();
        });

        submitBtn.addEventListener('click', () => submitGalleryUpload(card, statusEl, submitBtn));
    }

    function updateGalleryResumeUI() {
        const card = document.getElementById('galleryUploadCard');
        if (!card || galleryUploadBusy || !card.querySelector('#gallerySubmitBtn')) return;
        const done = galleryUploadFiles.filter(item => item.upload?.path).length;
        const pending = galleryDraft.fields.publish;
        card.querySelector('#gallerySubmitBtn').textContent = pending ? '确认并继续发布' : done ? '继续上传并发布' : '上传并发布';
        // 创建请求结果不明时，先核实原批次，防止修改后把新草稿当作已发布。
        for (const selector of ['#galleryAlbumName', '#galleryAlbumDesc', '#galleryFileInput', '.moment-thumb-del']) {
            card.querySelectorAll(selector).forEach(el => { el.disabled = Boolean(pending); });
        }
        if (pending || done) {
            const status = card.querySelector('#galleryUploadStatus');
            status.style.display = 'block';
            status.className = 'moment-modal-status';
            status.textContent = pending ? '照片已传完，点击继续确认上次发布结果，无需重新上传。'
                : `已上传 ${done}/${galleryUploadFiles.length} 张，继续时将跳过已完成照片。`;
        }
    }

    // 每张图片的请求身份与压缩结果先落盘，再发请求；响应丢失时按相同路径核对 Git blob SHA。
    async function prepareGalleryImage(item) {
        if (item.upload) return;
        const f = item.file;
        let base64, ext;
        if (f.type === 'image/gif') {
            if (f.size > 15 * 1024 * 1024) throw new Error(`动图 ${f.name} 超过 15MB，请压缩后再试`);
            base64 = await fileToRawBase64(f);
            ext = 'gif';
        } else {
            base64 = (await compressMomentImage(f, 1600, 0.82)).base64;
            ext = 'jpg';
        }
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const header = new TextEncoder().encode(`blob ${bytes.length}\0`);
        const blob = new Uint8Array(header.length + bytes.length);
        blob.set(header); blob.set(bytes, header.length);
        const sha = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', blob)), b => b.toString(16).padStart(2, '0')).join('');
        item.upload = { filename: `gallery-${crypto.randomUUID()}.${ext}`, base64, sha, attempted: false };
    }

    async function galleryRead(token, suffix) {
        const res = await fetch(`https://api.github.com/repos/mfcheer/mfcheer.github.io/${suffix}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: suffix.startsWith('contents/') ? 'application/vnd.github.object+json' : 'application/vnd.github+json' },
            cache: 'no-store', signal: AbortSignal.timeout(30000)
        });
        if (res.status === 404 && suffix.startsWith('contents/')) return null;
        if (!res.ok) {
            const err = new Error(`无法确认上次上传或发布结果 (${res.status})，请稍后继续`);
            err.status = res.status;
            throw err;
        }
        return res.json();
    }

    async function resumeGalleryImage(token, item) {
        await prepareGalleryImage(item);
        const upload = item.upload;
        if (upload.path) return upload.path;
        const path = `assets/gallery/${upload.filename}`;
        if (upload.attempted) {
            const remote = await galleryRead(token, `contents/${path}`);
            if (remote) {
                if (remote.sha !== upload.sha) throw new Error('同名照片内容不一致，已停止上传，请保留草稿后重试');
                upload.path = path;
                delete upload.base64;
                await galleryDraft.saveFiles(galleryUploadFiles);
                return path;
            }
        }
        upload.attempted = true;
        await galleryDraft.saveFiles(galleryUploadFiles);
        // 失败时保留 attempted 和相同文件名；下次先核对，绝不覆盖已有文件。
        const result = await uploadMomentImage(token, upload.filename, upload.base64, 'gallery');
        upload.path = result;
        delete upload.base64;
        await galleryDraft.saveFiles(galleryUploadFiles);
        return result;
    }

    async function findGalleryPublication(token, publish) {
        if (publish.created) return true;
        const marker = `<!-- gallery-upload:${publish.id} -->`;
        for (let page = 1; page <= 50; page++) {
            const issues = await galleryRead(token, `issues?state=all&creator=mfcheer&since=${encodeURIComponent(publish.since)}&per_page=100&page=${page}`);
            if (!Array.isArray(issues)) throw new Error('无法确认相册发布结果，请稍后继续');
            if (issues.some(issue => !issue.pull_request && issue.user?.login?.toLowerCase() === 'mfcheer' && issue.body?.includes(marker))) return true;
            if (issues.length < 100) return false;
        }
        throw new Error('待核对的相册过多，请稍后继续，暂不重复发布');
    }

    async function submitGalleryUpload(card, statusEl, submitBtn) {
        if (galleryUploadBusy) return;
        const setErr = msg => {
            statusEl.className = 'moment-modal-status is-error';
            statusEl.style.display = 'block';
            statusEl.textContent = msg;
        };
        const albumName = (card.querySelector('#galleryAlbumName').value || '').trim().slice(0, 40);
        const desc = (card.querySelector('#galleryAlbumDesc').value || '').trim().slice(0, 200);
        if (!galleryUploadFiles.length && !galleryDraft.fields.publish) { setErr('请至少选择一张照片'); return; }
        const auth = getMomentAuth();
        if (!auth || !auth.token) { renderGalleryUploadModal(); return; }

        galleryUploadBusy = true;
        setEditorBusy(galleryDraft, card, true);
        statusEl.className = 'moment-modal-status is-loading';
        statusEl.style.display = 'block';
        statusEl.textContent = '准备继续上传…';
        try {
            const pending = galleryDraft.fields.publish;
            const published = pending && await findGalleryPublication(auth.token, pending);
            if (!published) {
                const uploadedSrcs = [];
                for (let i = 0; i < galleryUploadFiles.length; i++) {
                    statusEl.textContent = `正在处理第 ${i + 1}/${galleryUploadFiles.length} 张（已完成 ${galleryUploadFiles.filter(item => item.upload?.path).length} 张）…`;
                    const rel = await resumeGalleryImage(auth.token, galleryUploadFiles[i]);
                    uploadedSrcs.push(`${window.location.origin}/${rel}`);
                    renderGalleryUploadPreviews(card.querySelector('#galleryImgPreviews'));
                }
                statusEl.textContent = '正在创建相册…';
                const publish = pending || { id: crypto.randomUUID(), since: new Date(Date.now() - 60000).toISOString() };
                // 先保存发布标记，网络异常后可用 Issues 列表直接核对，不依赖搜索索引。
                galleryDraft.saveFields({ ...galleryDraft.fields, publish });
                if (!galleryDraft.textSaved) throw new Error('无法保存发布进度，请恢复浏览器存储后继续');
                const body = (desc ? `### 相册简介\n${desc}\n\n` : '') +
                    `<!-- gallery-upload:${publish.id} -->\n` + uploadedSrcs.map(u => `![photo](${u})`).join('\n');
                await createMomentIssue(auth.token, `📷 相册 ${albumName}`.trim(), body, ['gallery']);
                galleryDraft.saveFields({ ...galleryDraft.fields, publish: { ...publish, created: true } });
            }
            showMomentToast('🎉 相册已提交，照片同步后显示（约 1–2 分钟）');
            galleryDraft.saveFields({ ...galleryDraft.fields, publish: { ...galleryDraft.fields.publish, created: true } });
            await galleryDraft.saveFiles([]);
            if (!galleryDraft.imageSaved) throw new Error('相册已提交，但清理本地草稿失败，请继续以完成清理');
            galleryDraft.saveFields({});
            if (!galleryDraft.textSaved) throw new Error('相册已提交，但清理本地进度失败，请继续以完成清理');
            galleryUploadFiles.forEach(item => URL.revokeObjectURL(item.dataUrl));
            galleryUploadFiles = [];
            galleryUploadBusy = false;
            setEditorBusy(galleryDraft, card, false);
            closeGalleryUploadModal();
        } catch (e) {
            galleryUploadBusy = false;
            setEditorBusy(galleryDraft, card, false);
            renderGalleryUploadPreviews(card.querySelector('#galleryImgPreviews'));
            updateGalleryResumeUI();
            if (e.status === 401 || e.message === 'Bad credentials') {
                clearMomentAuth();
                setErr('授权已失效，上传进度已保留。请保存并关闭，重新登录后继续');
            } else {
                const done = galleryUploadFiles.filter(item => item.upload?.path).length;
                setErr(`${e.message || '发布失败'}。已完成 ${done}/${galleryUploadFiles.length} 张，点击继续将保留进度并核对上次结果。`);
            }
        }
    }

    // 事件委托绑定：即使按钮元素被后续 DOM 操作替换，点击依然可达
    document.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('#galleryUploadBtn')) renderGalleryUploadModal();
    });

    // ---------------- 启动 ----------------

    loadGallery();
})();
