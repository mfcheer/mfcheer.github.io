// 在本地预览站点的浏览器中执行，不向 GitHub 写入任何数据。
// 页面刷新后再次调用相应 restore 阶段，验证真实的浏览器持久化。
window.runSiteRegression = async function (phase) {
    if (!['127.0.0.1', 'localhost'].includes(location.hostname)) throw new Error('仅允许本地预览运行');
    const checks = [];
    const assert = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
    const until = async fn => {
        const end = Date.now() + 5000;
        while (!fn()) { if (Date.now() > end) throw new Error('等待测试状态超时'); await new Promise(r => setTimeout(r, 20)); }
    };
    const input = (selector, text) => {
        const el = document.querySelector(selector); el.value = text; el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const click = selector => document.querySelector(selector).click();
    const pick = async selector => {
        const blob = await (await fetch('/avatar.jpg')).blob();
        const dt = new DataTransfer();
        dt.items.add(new File([blob], 'one.jpg', { type: 'image/jpeg' }));
        dt.items.add(new File([blob], 'two.jpg', { type: 'image/jpeg' }));
        const el = document.querySelector(selector); el.files = dt.files;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    setMomentAuth('LOCAL_TEST_ONLY', { login: 'mfcheer', avatar_url: '/avatar.jpg' });
    const nativeFetch = window.fetch;
    window.fetch = (url, options = {}) => {
        if (options.method && !['GET', 'HEAD'].includes(options.method)) throw new Error('禁止真实写入');
        return nativeFetch(url, options);
    };
    if (phase === 'moment-save') {
        await openMomentModal();
        input('#momentTextInput', '回归草稿 <script>不得执行</script>');
        click('[data-tag="技术"]');
        await pick('#momentFileInput');
        assert(momentDraft.busy, '图片处理期间锁定编辑');
        closeMomentModal();
        assert(momentDraft.open, '图片处理期间无法关闭');
        await until(() => !momentDraft.busy && !momentDraft.saving);
        assert(selectedMomentFiles.length === 2, '两张配图处理成功');
        closeMomentModal(); await openMomentModal();
        assert(document.querySelector('#momentTextInput').value.includes('回归草稿'), '关闭重开保留正文');
        assert(selectedMomentTags.has('技术') && selectedMomentFiles.length === 2, '关闭重开保留标签和图片');
        requestSiteUpdate();
        assert(sitePendingUpdate && !siteReloading, '编辑期间推迟新版本刷新');
        sitePendingUpdate = false;
        closeMomentModal();
    }
    if (phase === 'moment-restore') {
        await openMomentModal();
        assert(document.querySelector('#momentTextInput').value.includes('<script>'), '刷新恢复正文且作为纯文本');
        assert(selectedMomentTags.has('技术') && selectedMomentFiles.length === 2, '刷新恢复标签及两张图片');
        let release, requests = 0;
        uploadMomentImage = () => { requests++; return new Promise((resolve, reject) => { release = { resolve, reject }; }); };
        click('#momentSubmitBtn');
        const card = document.querySelector('#momentModalCard');
        assert([...card.querySelectorAll('button,input,textarea')].every(el => el.disabled), '上传锁定全部输入和操作');
        click('#momentSubmitBtn'); click('.moment-thumb-del'); closeMomentModal(); await openMomentModal();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        assert(requests === 1 && selectedMomentFiles.length === 2 && momentDraft.open, '阻止重复提交、删除、关闭和重建表单');
        const unload = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(unload);
        assert(unload.defaultPrevented, '上传中离开页面触发保护');
        release.reject(new Error('模拟上传失败'));
        await until(() => !momentDraft.busy);
        assert(selectedMomentFiles.length === 2 && !document.querySelector('#momentSubmitBtn').disabled, '失败后保留草稿并解锁重试');
        let issueCalls = 0;
        uploadMomentImage = async () => '/avatar.jpg';
        createMomentIssue = async () => { issueCalls++; return { number: 99999 }; };
        click('#momentSubmitBtn');
        await until(() => !momentDraft.busy && !momentDraft.open);
        assert(issueCalls === 1 && !momentDraft.files.length && !momentDraft.fields.text, '成功只创建一次并清空草稿');
    }
    if (phase === 'gallery-save') {
        click('#galleryUploadBtn');
        await until(() => document.querySelector('#galleryAlbumName'));
        input('#galleryAlbumName', '回归相册'); input('#galleryAlbumDesc', '回归简介');
        await pick('#galleryFileInput');
        await until(() => ![...siteEditors].find(e => e !== momentDraft).saving);
        click('#galleryUploadCancelBtn'); click('#galleryUploadBtn');
        await until(() => document.querySelector('#galleryAlbumName'));
        assert(document.querySelector('#galleryAlbumName').value === '回归相册', '相册关闭重开保留名称');
        assert(document.querySelectorAll('#galleryImgPreviews img').length === 2, '相册关闭重开保留图片');
        click('#galleryUploadCancelBtn');
    }
    if (phase === 'gallery-restore') {
        click('#galleryUploadBtn');
        await until(() => document.querySelector('#galleryAlbumName'));
        assert(document.querySelector('#galleryAlbumName').value === '回归相册' && document.querySelector('#galleryAlbumDesc').value === '回归简介', '相册刷新恢复名称和简介');
        assert(document.querySelectorAll('#galleryImgPreviews img').length === 2, '相册刷新恢复图片');
        assert([...document.querySelectorAll('#galleryImgPreviews img')].every(img => img.complete && img.naturalWidth > 0), '恢复后的图片预览正常');
        let rejectUpload, requests = 0;
        uploadMomentImage = () => { requests++; return new Promise((_, reject) => { rejectUpload = reject; }); };
        click('#gallerySubmitBtn');
        await until(() => requests === 1);
        const card = document.querySelector('#galleryUploadCard');
        assert([...card.querySelectorAll('button,input,textarea')].every(el => el.disabled), '相册上传期间锁定所有操作');
        click('#galleryUploadCancelBtn'); click('#galleryUploadBtn'); click('.moment-thumb-del');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        assert(document.querySelector('#galleryAlbumName').value === '回归相册' && document.querySelectorAll('#galleryImgPreviews img').length === 2, '相册上传时不能关闭、重开或删图');
        rejectUpload(new Error('模拟失败')); await until(() => !card.querySelector('#gallerySubmitBtn').disabled);
        assert(document.querySelectorAll('#galleryImgPreviews img').length === 2, '相册失败保留图片可重试');
        uploadMomentImage = async () => 'avatar.jpg';
        let issueCalls = 0;
        createMomentIssue = async () => { issueCalls++; return {}; };
        click('#gallerySubmitBtn');
        await until(() => !document.querySelector('#galleryUploadCard'));
        assert(issueCalls === 1, '相册成功只创建一次并关闭');
        click('#galleryUploadBtn'); await until(() => document.querySelector('#galleryAlbumName'));
        assert(!document.querySelector('#galleryAlbumName').value && !document.querySelectorAll('#galleryImgPreviews img').length, '相册成功清空草稿');
        click('#galleryUploadCancelBtn');
    }
    if (phase === 'lightbox') {
        const trigger = document.querySelector('#galleryUploadBtn, #momentWriteBtn, .theme-toggle'); trigger.focus();
        openSitePhotos([{ src: '/avatar.jpg', caption: '第一张' }, { src: '/favicon-32x32.png', caption: '第二张' }], 0, trigger);
        assert(document.querySelector('.site-photo-counter').textContent === '1 / 2', '灯箱显示计数');
        click('.post-lightbox-img');
        assert(siteLightbox.classList.contains('is-open'), '点击图片不会误关闭');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        assert(sitePhotoIndex === 1, '键盘向右切图');
        click('.site-photo-next'); assert(sitePhotoIndex === 0, '末张循环至首张');
        const start = new Event('touchstart'); Object.defineProperty(start, 'touches', { value: [{ clientX: 200, clientY: 100 }] }); siteLightbox.dispatchEvent(start);
        const end = new Event('touchend'); Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 80, clientY: 110 }] }); siteLightbox.dispatchEvent(end);
        assert(sitePhotoIndex === 1, '横向滑动切图');
        const pullStart = new Event('touchstart'); Object.defineProperty(pullStart, 'touches', { value: [{ clientX: 100, clientY: 100 }] }); siteLightbox.dispatchEvent(pullStart);
        const pullEnd = new Event('touchend'); Object.defineProperty(pullEnd, 'changedTouches', { value: [{ clientX: 105, clientY: 200 }] }); siteLightbox.dispatchEvent(pullEnd);
        assert(!siteLightbox.classList.contains('is-open'), '移动端下拉手势关闭灯箱');
        openSitePhotos([{ src: '/avatar.jpg', caption: '第一张' }, { src: '/favicon-32x32.png', caption: '第二张' }], 1, trigger);
        siteLightboxImg.dispatchEvent(new Event('error'));
        assert(document.querySelector('.site-photo-status').textContent.includes('重试'), '图片失败提供重试');
        click('.site-photo-status'); await until(() => !siteLightboxImg.hidden);
        assert(!document.querySelector('.site-photo-status').textContent, '点击重试恢复图片');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        assert(!siteLightbox.classList.contains('is-open') && document.activeElement === trigger, 'Esc关闭并恢复焦点');
        openSitePhotos([{ src: '/avatar.jpg' }]);
        assert([...siteLightbox.querySelectorAll('.site-photo-nav')].every(el => el.hidden), '单图隐藏翻页按钮'); closeLightbox();
        const group = document.createElement('div'); group.className = 'moment-item';
        group.innerHTML = '<img src="/avatar.jpg"><img src="/favicon-32x32.png">'; document.body.appendChild(group);
        group.querySelectorAll('img').forEach(bindZoomableImage);
        group.querySelector('img').click(); assert(sitePhotos.length === 2, '同条说说自动分组'); closeLightbox(); group.remove();
        const article = document.createElement('div'); article.className = 'post-body';
        article.innerHTML = '<img src="/avatar.jpg"><img src="/favicon-32x32.png">'; document.body.appendChild(article);
        article.querySelectorAll('img').forEach(bindZoomableImage);
        article.querySelectorAll('img')[1].click(); assert(sitePhotos.length === 2 && sitePhotoIndex === 1, '文章图片按篇分组并从选中图片打开'); closeLightbox(); article.remove();
    }
    window.fetch = nativeFetch;
    return { phase, passed: checks.length, checks };
};
