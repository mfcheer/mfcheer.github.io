/**
 * gallery.js — 相册页渲染与照片灯箱
 *
 * 数据源：data/gallery.json（由 scripts/build-gallery.mjs 构建生成）
 * 布局：疏密交错的 Justified 行式——按宽高比和变化的目标行高装箱，保持原始比例，
 *       最后一行不强行拉伸；窗口缩放自动重排。
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

    // ---------------- Justified 布局 ----------------

    const GAP = 6;

    function photoRatio(photo) {
        const ratio = Number(photo.ratio) || (Number(photo.w) / Number(photo.h));
        return Number.isFinite(ratio) && ratio > 0 ? ratio : 1.5;
    }

    // 交替使用疏密不同的目标行高，照片顺序不变，刷新和分批加载时也不会随机跳动。
    function targetHeight(containerW, rowIndex = 0) {
        const rhythm = containerW < 520
            ? [0.62, 0.34, 0.46, 0.30, 0.55, 0.36]
            : [0.24, 0.38, 0.28, 0.22, 0.34, 0.26];
        return containerW * rhythm[rowIndex % rhythm.length];
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
                const score = Math.abs(Math.log(height / target));
                if (!best || score < best.score) best = { count, ratioSum, score, target };
            }
            const end = start + best.count;
            rows.push({ photos: photos.slice(start, end), ratioSum: best.ratioSum,
                target: best.target, isLast: end === photos.length });
            start = end;
        }
        return rows;
    }

    /** 全站照片流（含尚未渲染的相册），供灯箱全局浏览 */
    function collectAllPhotos() {
        const all = [];
        for (const a of albums) {
            for (const p of a.photos) all.push(Object.assign({}, p, { album: a.title }));
        }
        return all;
    }

    function layoutWall(wall, append = false) {
        let photos;
        try { photos = JSON.parse(wall.dataset.photos); } catch { return; }
        const W = wall.clientWidth;
        if (!W || !photos.length) return;

        const startRow = append ? wall.children.length : 0;
        if (!append) wall.innerHTML = '';
        const rows = buildRows(photos, W);
        if (sentinel) sentinel.hidden = visibleRows >= rows.length;

        for (const rowData of rows.slice(startRow, visibleRows)) {
            const n = rowData.photos.length;
            const gapTotal = GAP * (n - 1);
            const naturalH = (W - gapTotal) / rowData.ratioSum;
            // 末行不足时保持自然大小；其余行按原始宽高比铺满。
            const isUnfilled = rowData.isLast && naturalH > rowData.target * 1.35;
            const rowH = isUnfilled ? rowData.target : naturalH;

            const rowEl = document.createElement('div');
            rowEl.className = 'g-row';
            rowEl.style.height = rowH + 'px';

            rowData.photos.forEach((p) => {
                const itemW = isUnfilled
                    ? rowH * photoRatio(p)
                    : (W - gapTotal) * (photoRatio(p) / rowData.ratioSum);
                const itemEl = document.createElement('button');
                itemEl.type = 'button';
                itemEl.className = 'g-item';
                itemEl.style.width = itemW + 'px';
                itemEl.style.backgroundImage = p.lqip ? 'url("' + p.lqip + '")' : 'none';
                itemEl.setAttribute('aria-label', [p.album, p.date ? p.date.slice(0, 10) : '', '查看照片'].filter(Boolean).join(' · '));

                const img = document.createElement('img');
                img.src = rootUrl(p.thumb);
                img.alt = p.date || '';
                img.loading = 'lazy';
                img.decoding = 'async';
                img.addEventListener('load', () => itemEl.classList.add('g-loaded'));
                img.addEventListener('error', () => itemEl.classList.add('g-error'));

                itemEl.addEventListener('click', () => {
                    const globalPhotos = collectAllPhotos();
                    // JSON.parse 会产生新对象，不能按引用匹配，按 src 定位
                    const startIdx = Math.max(0, globalPhotos.findIndex((q) => q.src === p.src));
                    openLightbox(globalPhotos, startIdx);
                });

                itemEl.append(img);
                rowEl.appendChild(itemEl);
            });
            wall.appendChild(rowEl);
        }
    }

    // ---------------- 连续照片墙：按完整行分批加载 ----------------
    // 先合并所有相册再装箱，跨相册和加载批次都不会留下半行空白。
    const ROW_BATCH = 8;
    let visibleRows = ROW_BATCH;
    let sentinel = null;
    let sentinelIO = null;

    function render() {
        if (sentinelIO) sentinelIO.disconnect();
        sentinelIO = null;
        sentinel = document.getElementById('gallerySentinel');
        if (sentinel) sentinel.hidden = true;
        listEl.innerHTML = '';
        visibleRows = ROW_BATCH;
        const photos = collectAllPhotos();
        if (!photos.length) {
            listEl.innerHTML =
                '<div class="gallery-empty">' +
                '<p>相册还没有照片。</p>' +
                '<p class="gallery-empty-hint">去 GitHub 建一个带 <code>gallery</code> 标签的 Issue，拖入照片发布，几分钟内就会自动出现在这里。</p>' +
                '</div>';
            return;
        }

        const wall = document.createElement('div');
        wall.className = 'gallery-wall';
        wall.dataset.photos = JSON.stringify(photos);
        listEl.appendChild(wall);
        if (sentinel && 'IntersectionObserver' in window) {
            sentinelIO = new IntersectionObserver((entries) => {
                if (entries.some((en) => en.isIntersecting) && !sentinel.hidden) {
                    visibleRows += ROW_BATCH;
                    layoutWall(wall, true);
                }
            }, { rootMargin: '600px 0px' });
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
            document.querySelectorAll('.gallery-wall').forEach((wall) => layoutWall(wall));
        }, 150);
    });

    // 相册与文章、说说共用灯箱。
    function openLightbox(photos, idx) {
        openSitePhotos(photos.map(p => ({
            src: rootUrl(p.src),
            caption: [p.album, p.date && p.date.slice(0, 10)].filter(Boolean).join(' · ')
        })), idx);
    }

    // ---------------- 站内上传发布 ----------------
    // 与说说同链路：OAuth 登录 → 压缩 → contents API 传 assets/gallery/ → 创建 gallery 标签 Issue，
    // 同步流水线（build-gallery.mjs）随后自动拉取处理。Issue 格式与 GitHub 模板一致：
    // 标题「📷 相册 {名}」，正文「### 相册简介」段 + 图片行（extractImages/extractDescription 解析）。

    const GALLERY_MAX_IMAGES = 30;
    let galleryUploadBackdrop = null;
    let galleryUploadFiles = []; // [{ file, dataUrl }]
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
            wrap.querySelector('.moment-thumb-del').addEventListener('click', () => {
                if (galleryUploadBusy) return;
                URL.revokeObjectURL(galleryUploadFiles[index].dataUrl);
                galleryUploadFiles.splice(index, 1);
                galleryDraft.saveFiles(galleryUploadFiles);
                renderGalleryUploadPreviews(previewsEl);
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
                <p class="draft-hint">草稿保存在当前浏览器，关闭后可继续编辑；发布成功后自动清空。</p>
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

                <div class="moment-modal-status" id="galleryUploadStatus" style="display:none;"></div>

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
        const saveDraft = () => galleryDraft.saveFields({ name: nameInput.value, desc: descInput.value });
        nameInput.addEventListener('input', saveDraft);
        descInput.addEventListener('input', saveDraft);
        renderGalleryUploadPreviews(previewsEl);
        card.querySelector('#galleryDiscardBtn').onclick = async () => {
            if (galleryUploadBusy || !confirm('清空这份相册草稿的文字和图片？')) return;
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
            if (galleryUploadBusy) return;
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
        });

        submitBtn.addEventListener('click', () => submitGalleryUpload(card, statusEl, submitBtn));
    }

    async function submitGalleryUpload(card, statusEl, submitBtn) {
        if (galleryUploadBusy) return;
        const setErr = (msg) => {
            statusEl.className = 'moment-modal-status is-error';
            statusEl.style.display = 'block';
            statusEl.textContent = msg;
        };
        const albumName = (card.querySelector('#galleryAlbumName').value || '').trim().slice(0, 40);
        const desc = (card.querySelector('#galleryAlbumDesc').value || '').trim().slice(0, 200);
        if (!galleryUploadFiles.length) { setErr('请至少选择一张照片'); return; }

        const auth = getMomentAuth();
        if (!auth || !auth.token) { renderGalleryUploadModal(); return; }

        galleryUploadBusy = true;
        setEditorBusy(galleryDraft, card, true);
        statusEl.className = 'moment-modal-status is-loading';
        statusEl.style.display = 'block';
        statusEl.textContent = '准备上传…';

        const uploadedSrcs = [];
        try {
            for (let i = 0; i < galleryUploadFiles.length; i++) {
                statusEl.textContent = `正在上传第 ${i + 1}/${galleryUploadFiles.length} 张…`;
                const f = galleryUploadFiles[i].file;
                let filename, base64;
                if (f.type === 'image/gif') {
                    if (f.size > 15 * 1024 * 1024) throw new Error(`动图 ${f.name} 超过 15MB，请压缩后再试`);
                    filename = `gallery-${Date.now()}-${i}.gif`;
                    base64 = await fileToRawBase64(f);
                } else {
                    const result = await compressMomentImage(f, 1600, 0.82);
                    filename = `gallery-${Date.now()}-${i}.jpg`;
                    base64 = result.base64;
                }
                const rel = await uploadMomentImage(auth.token, filename, base64, 'gallery');
                uploadedSrcs.push(`${window.location.origin}/${rel}`);
            }

            statusEl.textContent = '正在创建相册…';
            const body = (desc ? `### 相册简介\n${desc}\n\n` : '') + uploadedSrcs.map((u) => `![photo](${u})`).join('\n');
            await createMomentIssue(auth.token, `📷 相册 ${albumName}`.trim(), body, ['gallery']);

            statusEl.className = 'moment-modal-status';
            statusEl.textContent = '✓ 已提交！同步流水线约 1-2 分钟后展示，可以关闭本页';
            showMomentToast('🎉 相册已提交，照片同步后显示（约 1–2 分钟）');
            galleryUploadFiles.forEach(item => URL.revokeObjectURL(item.dataUrl));
            await galleryDraft.clear();
            galleryUploadFiles = [];
            galleryUploadBusy = false;
            setEditorBusy(galleryDraft, card, false);
            closeGalleryUploadModal();
        } catch (e) {
            galleryUploadBusy = false;
            setEditorBusy(galleryDraft, card, false);
            // token 失效（401 Bad credentials）：自动清除本地凭据，引导重新授权
            if (e.status === 401 || e.message === 'Bad credentials') {
                clearMomentAuth();
                setErr('授权已失效（可能是授权被撤销或过期），已自动退出登录。请关闭弹窗后重新点击「上传照片」并完成 GitHub 授权');
            } else {
                setErr(e.message || '发布失败，请重试');
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
