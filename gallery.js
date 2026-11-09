/**
 * gallery.js — 相册页渲染与照片灯箱
 *
 * 数据源：data/gallery.json（由 scripts/build-gallery.mjs 构建生成）
 * 布局：Justified 行式——运行时按宽高比逐行装箱，行内照片等高、按原始比例排满，
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

    function targetHeight(containerW) {
        if (containerW >= 760) return 240;
        if (containerW >= 520) return 200;
        return 140;
    }

    function buildRows(photos, containerW) {
        const th = targetHeight(containerW);
        const rows = [];
        let row = [];
        let ratioSum = 0;
        for (const p of photos) {
            const r = p.ratio || (p.w && p.h ? p.w / p.h : 1.5);
            row.push(p);
            ratioSum += r;
            if (ratioSum >= containerW / th) {
                rows.push({ photos: row, ratioSum });
                row = [];
                ratioSum = 0;
            }
        }
        if (row.length) rows.push({ photos: row, ratioSum, isLast: true });
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

    function renderAlbum(album) {
        const albumEl = document.createElement('section');
        albumEl.className = 'gallery-album';

        // 墙面零文字：不渲染相册名/张数，相册信息注入每张照片供 hover 角标与灯箱使用
        const wall = document.createElement('div');
        wall.className = 'gallery-wall';
        wall.dataset.photos = JSON.stringify(album.photos.map((p) => ({ ...p, album: album.title })));
        albumEl.appendChild(wall);

        return albumEl;
    }

    function layoutWall(wall) {
        let photos;
        try { photos = JSON.parse(wall.dataset.photos); } catch { return; }
        const W = wall.clientWidth;
        if (!W || !photos.length) return;

        wall.innerHTML = '';
        const rows = buildRows(photos, W);

        for (const rowData of rows) {
            const n = rowData.photos.length;
            const gapTotal = GAP * (n - 1);
            let rowH = (W - gapTotal) / rowData.ratioSum;
            // 最后一行（或整行只有一张图）不强行拉满：限制最大行高
            if (rowData.isLast || n === 1) {
                rowH = Math.min(rowH, targetHeight(W) * 1.35);
            }
            rowH = Math.max(80, Math.round(rowH));

            const rowEl = document.createElement('div');
            rowEl.className = 'g-row';
            rowEl.style.height = rowH + 'px';

            rowData.photos.forEach((p, idx) => {
                const itemW = Math.floor((W - gapTotal) * (p.ratio / rowData.ratioSum));
                const itemEl = document.createElement('button');
                itemEl.type = 'button';
                itemEl.className = 'g-item';
                itemEl.style.width = itemW + 'px';
                itemEl.style.backgroundImage = p.lqip ? 'url("' + p.lqip + '")' : 'none';
                itemEl.setAttribute('aria-label', (p.date ? p.date + ' ' : '') + '查看照片');
                // hover 角标：拍摄日期 · 所属相册
                if (p.album) itemEl.dataset.info = (p.date ? p.date.slice(0, 10) + ' · ' : '') + p.album;

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

                itemEl.appendChild(img);
                rowEl.appendChild(itemEl);
            });
            wall.appendChild(rowEl);
        }
    }

    // ---------------- 渲染：分批无感加载 ----------------
    // 每批渲染 ALBUM_BATCH 个相册；滑到接近底部时自动续渲染下一批（哨兵提前 600px 触发），用户无感。
    // Justified 装箱按相册独立、按顺序贪心填行，前缀稳定，分批渲染不影响已有行的布局。

    const ALBUM_BATCH = 2;
    let renderedAlbums = 0;
    let fadeIO = null;      // 相册淡入观察器
    let sentinel = null;    // 无限加载哨兵（列表容器后的静态元素）
    let sentinelIO = null;

    const teardownSentinel = () => {
        if (sentinelIO) sentinelIO.disconnect();
        // 注意：不能动 fadeIO——最后一批相册刚被 observeFade 挂上观察，
        // disconnect 会连它们一起取消，导致相册永远停在 opacity:0（盲点）。
        if (sentinel) sentinel.hidden = true;
        sentinel = sentinelIO = null;
    };

    function observeFade(el) {
        if (fadeIO) fadeIO.observe(el);
        else el.classList.add('g-inview'); // 无动效环境直接显示
    }

    const renderNextAlbums = () => {
        if (sentinel) sentinel.hidden = true; // 先藏哨兵，保证追加的相册都在其之前
        const batch = albums.slice(renderedAlbums, renderedAlbums + ALBUM_BATCH);
        for (const album of batch) {
            const el = renderAlbum(album);
            listEl.appendChild(el); // 先挂载再布局，layoutWall 依赖 clientWidth
            el.querySelectorAll('.gallery-wall').forEach(layoutWall);
            observeFade(el);
            renderedAlbums++;
        }
        if (sentinel && renderedAlbums < albums.length) sentinel.hidden = false;
        else teardownSentinel();
    };

    function render() {
        listEl.innerHTML = '';
        teardownSentinel();
        renderedAlbums = 0;
        if (!albums.length) {
            listEl.innerHTML =
                '<div class="gallery-empty">' +
                '<p>相册还没有照片。</p>' +
                '<p class="gallery-empty-hint">去 GitHub 建一个带 <code>gallery</code> 标签的 Issue，拖入照片发布，几分钟内就会自动出现在这里。</p>' +
                '</div>';
            return;
        }

        // 滚动淡入（尊重系统减少动效设置）
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
            fadeIO = new IntersectionObserver((entries) => {
                entries.forEach((en) => {
                    if (en.isIntersecting) {
                        en.target.classList.add('g-inview');
                        fadeIO.unobserve(en.target);
                    }
                });
            }, { rootMargin: '0px 0px -8% 0px' });
        } else {
            fadeIO = null;
        }

        if (albums.length > ALBUM_BATCH && 'IntersectionObserver' in window) {
            sentinel = document.getElementById('gallerySentinel');
            if (sentinel) {
                sentinel.hidden = false;
                sentinelIO = new IntersectionObserver((entries) => {
                    if (entries.some((en) => en.isIntersecting)) renderNextAlbums();
                }, { rootMargin: '600px 0px' });
                sentinelIO.observe(sentinel);
            }
        }

        renderNextAlbums();

        // 安全网：无论 IO 环境如何（无头测试、异常渲染循环），
        // 2 秒后强制显示所有仍未淡入的相册，物理杜绝「占位盲点」。
        setTimeout(() => {
            document.querySelectorAll('.gallery-album:not(.g-inview)').forEach((el) => el.classList.add('g-inview'));
        }, 2000);
    }

    // 响应式重排
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('.gallery-wall').forEach(layoutWall);
        }, 150);
    });

    // ---------------- 灯箱 ----------------

    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCaption = document.getElementById('lbCaption');
    const lbCounter = document.getElementById('lbCounter');
    let lbPhotos = [];
    let lbIdx = 0;
    let lastFocus = null;

    function showLb() {
        const p = lbPhotos[lbIdx];
        if (!p) return;
        lbImg.classList.remove('lb-loaded');
        lbImg.src = rootUrl(p.src);
        lbImg.alt = p.date || '';
        lbCaption.textContent = [p.album, p.date && p.date.slice(0, 10)].filter(Boolean).join(' · ');
        lbCounter.textContent = (lbIdx + 1) + ' / ' + lbPhotos.length;
        // 预加载相邻图
        [lbIdx + 1, lbIdx - 1].forEach((i) => {
            const np = lbPhotos[i];
            if (np) { const im = new Image(); im.src = np.src; }
        });
    }

    function openLightbox(photos, idx) {
        lbPhotos = photos;
        lbIdx = idx;
        lastFocus = document.activeElement;
        lb.hidden = false;
        document.body.style.overflow = 'hidden';
        showLb();
        document.getElementById('lbClose').focus();
    }

    function closeLightbox() {
        lb.hidden = true;
        lbImg.src = '';
        document.body.style.overflow = '';
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function step(dir) {
        if (!lbPhotos.length) return;
        lbIdx = (lbIdx + dir + lbPhotos.length) % lbPhotos.length;
        showLb();
    }

    document.getElementById('lbClose').addEventListener('click', closeLightbox);
    document.getElementById('lbPrev').addEventListener('click', () => step(-1));
    document.getElementById('lbNext').addEventListener('click', () => step(1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') step(-1);
        else if (e.key === 'ArrowRight') step(1);
    });

    // 触屏滑动切换
    let touchX = null;
    lb.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 50) step(dx > 0 ? -1 : 1);
        touchX = null;
    }, { passive: true });

    // 全图加载淡入
    lbImg.addEventListener('load', () => lbImg.classList.add('lb-loaded'));

    // ---------------- 站内上传发布 ----------------
    // 与说说同链路：OAuth 登录 → 压缩 → contents API 传 assets/gallery/ → 创建 gallery 标签 Issue，
    // 同步流水线（build-gallery.mjs）随后自动拉取处理。Issue 格式与 GitHub 模板一致：
    // 标题「📷 相册 {名}」，正文「### 相册简介」段 + 图片行（extractImages/extractDescription 解析）。

    const GALLERY_MAX_IMAGES = 30;
    let galleryUploadBackdrop = null;
    let galleryUploadFiles = []; // [{ file, dataUrl }]
    let galleryUploadBusy = false;

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
        if (!galleryUploadBackdrop) return;
        document.removeEventListener('keydown', galleryUploadEscHandler);
        galleryUploadFiles = [];
        galleryUploadBusy = false;
        galleryUploadBackdrop.remove();
        galleryUploadBackdrop = null;
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
                galleryUploadFiles.splice(index, 1);
                renderGalleryUploadPreviews(previewsEl);
            });
            previewsEl.appendChild(wrap);
        });
    }

    function renderGalleryUploadModal() {
        ensureGalleryUploadModal();
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
                        <button type="button" class="moment-btn moment-btn-cancel" id="galleryUploadCancelBtn">取消</button>
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
        submitBtn.disabled = true;
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
            showMomentToast('🎉 相册已提交');
            setTimeout(closeGalleryUploadModal, 1800);
        } catch (e) {
            galleryUploadBusy = false;
            submitBtn.disabled = false;
            setErr(e.message || '发布失败，请重试');
        }
    }

    // 事件委托绑定：即使按钮元素被后续 DOM 操作替换，点击依然可达
    document.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('#galleryUploadBtn')) renderGalleryUploadModal();
    });

    // ---------------- 启动 ----------------

    loadGallery();
})();
