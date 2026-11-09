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

    const countEl = document.getElementById('galleryCount');

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

    /** 收集全部相册的照片（含封面），供灯箱全局浏览 */
    function collectAllPhotos() {
        const all = [];
        document.querySelectorAll('.gallery-album').forEach((el) => {
            try { all.push(...JSON.parse(el.dataset.photos || '[]')); } catch {}
        });
        return all;
    }

    function renderAlbum(album, no) {
        const albumEl = document.createElement('section');
        albumEl.className = 'gallery-album';
        albumEl.dataset.photos = JSON.stringify(album.photos);

        // 杂志式相册头部：编号 + 标题 + 元信息 + 导语
        const head = document.createElement('header');
        head.className = 'al-head';

        const noEl = document.createElement('span');
        noEl.className = 'al-no';
        noEl.textContent = '№ ' + String(no).padStart(2, '0');
        head.appendChild(noEl);

        const title = document.createElement('h3');
        title.className = 'al-title';
        title.textContent = album.title;
        head.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'al-meta';
        meta.textContent = [album.range, album.count + ' 张'].filter(Boolean).join(' · ');
        head.appendChild(meta);

        if (album.description) {
            const desc = document.createElement('p');
            desc.className = 'al-desc';
            desc.textContent = album.description;
            head.appendChild(desc);
        }
        albumEl.appendChild(head);

        // 封面大图（相册第一张，先声夺人）
        const cover = album.cover || album.photos[0] || null;
        if (cover) {
            const fig = document.createElement('button');
            fig.type = 'button';
            fig.className = 'al-cover';
            fig.style.backgroundImage = cover.lqip ? 'url("' + cover.lqip + '")' : 'none';
            fig.setAttribute('aria-label', '打开相册「' + album.title + '」的首张大图');

            const img = document.createElement('img');
            img.src = rootUrl(cover.src);
            img.alt = cover.date || album.title;
            img.decoding = 'async';
            img.addEventListener('load', () => fig.classList.add('g-loaded'));
            img.addEventListener('error', () => fig.classList.add('g-error'));

            fig.addEventListener('click', () => {
                const globalPhotos = collectAllPhotos();
                const idx = globalPhotos.findIndex((q) => q.src === cover.src);
                openLightbox(globalPhotos, Math.max(0, idx));
            });

            fig.appendChild(img);
            albumEl.appendChild(fig);
        }

        // 其余照片进入 Justified 墙
        const rest = album.photos.filter((p) => !cover || p.src !== cover.src);
        const wall = document.createElement('div');
        wall.className = 'gallery-wall';
        wall.dataset.photos = JSON.stringify(rest);
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

    function render() {
        listEl.innerHTML = '';
        const total = albums.reduce((s, a) => s + a.count, 0);
        if (countEl) countEl.textContent = total ? total + ' 张照片' : '';

        if (!albums.length) {
            listEl.innerHTML =
                '<div class="gallery-empty">' +
                '<p>相册还没有照片。</p>' +
                '<p class="gallery-empty-hint">去 GitHub 建一个带 <code>gallery</code> 标签的 Issue，拖入照片发布，几分钟内就会自动出现在这里。</p>' +
                '</div>';
            return;
        }
        for (const [i, album] of albums.entries()) {
            const el = renderAlbum(album, i + 1);
            listEl.appendChild(el); // 先挂载再布局，layoutWall 依赖 clientWidth
            el.querySelectorAll('.gallery-wall').forEach(layoutWall);
        }
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
        lbCaption.textContent = p.date || albumTitleOf(p) || '';
        lbCounter.textContent = (lbIdx + 1) + ' / ' + lbPhotos.length;
        // 预加载相邻图
        [lbIdx + 1, lbIdx - 1].forEach((i) => {
            const np = lbPhotos[i];
            if (np) { const im = new Image(); im.src = np.src; }
        });
    }

    function albumTitleOf() { return ''; }

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

    // ---------------- 启动 ----------------

    loadGallery();
})();
