// 在本地相册页依次运行 start / resume / confirm；每阶段之间刷新。
// 仅使用模拟 GitHub 响应，禁止真实远程写入。
window.runGalleryResumeRegression = async function(phase) {
    if (!['127.0.0.1', 'localhost'].includes(location.hostname)) throw Error('仅限本地预览');
    const checks = [];
    const assert = (ok, message) => { if (!ok) throw Error(message); checks.push(message); };
    const until = async check => {
        for (let i = 0; i < 200; i++) { if (check()) return; await new Promise(r => setTimeout(r, 25)); }
        throw Error('操作超时');
    };
    const nativeFetch = window.fetch;
    let puts = 0, posts = 0;
    window.fetch = async (url, options = {}) => {
        if (String(url).startsWith('https://api.github.com/')) {
            if (options.method && !['GET', 'HEAD'].includes(options.method)) throw Error('禁止远程写入');
            if (String(url).includes('/contents/')) return { ok: false, status: 404 };
            const fields = JSON.parse(localStorage.getItem('mfcheer_draft_gallery'));
            return { ok: true, status: 200, json: async () => phase === 'confirm' ? [{ user: { login: 'mfcheer' }, body: `<!-- gallery-upload:${fields.publish.id} -->` }] : [] };
        }
        if (options.method && !['GET', 'HEAD'].includes(options.method)) throw Error('禁止远程写入');
        return nativeFetch(url, options);
    };
    try {
        setMomentAuth('LOCAL_TEST_ONLY', { login: 'mfcheer', avatar_url: '/avatar.jpg' });
        document.querySelector('#galleryUploadBtn').click();
        await until(() => document.querySelector('#galleryAlbumName'));
        if (phase === 'start') {
            assert(!document.querySelectorAll('#galleryImgPreviews img').length, '从空草稿开始');
            const name = document.querySelector('#galleryAlbumName');
            name.value = '续传回归相册'; name.dispatchEvent(new Event('input'));
            const photo = await (await nativeFetch('/avatar.jpg')).blob();
            const dt = new DataTransfer();
            ['a', 'b', 'c'].forEach(n => dt.items.add(new File([photo], `${n}.jpg`, { type: 'image/jpeg' })));
            const input = document.querySelector('#galleryFileInput'); input.files = dt.files; input.dispatchEvent(new Event('change'));
            uploadMomentImage = async (_, filename) => {
                puts++;
                if (puts === 2) throw Error('模拟第2张断网');
                return `assets/gallery/${filename}`;
            };
            createMomentIssue = async () => { posts++; throw Error('不应创建'); };
            document.querySelector('#gallerySubmitBtn').click();
            document.querySelector('#gallerySubmitBtn').click();
            await until(() => !document.querySelector('#gallerySubmitBtn').disabled);
            assert(puts === 2 && posts === 0, '中途失败停止，重复点击不会另起流程');
            assert(document.querySelectorAll('.gallery-upload-badge').length === 1, '成功照片显示已上传');
            assert(document.querySelector('#galleryUploadStatus').textContent.includes('1/3'), '失败提示保留1/3进度');
            document.querySelector('#galleryUploadCancelBtn').click();
            document.querySelector('#galleryUploadBtn').click();
            await until(() => document.querySelector('#galleryAlbumName'));
            assert(document.querySelectorAll('.gallery-upload-badge').length === 1, '关闭重开保留进度');
            document.querySelector('#galleryUploadCancelBtn').click();
        } else if (phase === 'resume') {
            assert(document.querySelector('#galleryAlbumName').value === '续传回归相册', '刷新恢复相册名称');
            assert(document.querySelectorAll('#galleryImgPreviews img').length === 3, '刷新恢复三张照片');
            assert(document.querySelectorAll('.gallery-upload-badge').length === 1, '刷新恢复已完成进度');
            uploadMomentImage = async (_, filename) => { puts++; return `assets/gallery/${filename}`; };
            createMomentIssue = async () => { posts++; throw Error('模拟相册已创建但响应丢失'); };
            document.querySelector('#gallerySubmitBtn').click();
            await until(() => !document.querySelector('#gallerySubmitBtn').disabled);
            assert(puts === 2 && posts === 1, '只补传两张，再创建相册');
            assert(document.querySelectorAll('.gallery-upload-badge').length === 3, '全部成功照片保留进度');
            assert(document.querySelector('#galleryAlbumName').disabled && document.querySelector('#galleryFileInput').disabled, '发布结果不明时先确认原批次');
            document.querySelector('#galleryUploadCancelBtn').click();
        } else if (phase === 'confirm') {
            assert(document.querySelectorAll('.gallery-upload-badge').length === 3, '再次刷新仍无需重传');
            uploadMomentImage = async () => { puts++; throw Error('不应上传'); };
            createMomentIssue = async () => { posts++; throw Error('不应重复创建'); };
            document.querySelector('#gallerySubmitBtn').click();
            await until(() => !document.querySelector('#galleryUploadCard'));
            assert(puts === 0 && posts === 0, '查到原批次后不重复上传或创建');
            document.querySelector('#galleryUploadBtn').click();
            await until(() => document.querySelector('#galleryAlbumName'));
            assert(!document.querySelector('#galleryAlbumName').value && !document.querySelectorAll('#galleryImgPreviews img').length, '成功后草稿与进度全部清空');
            document.querySelector('#galleryUploadCancelBtn').click();
            clearMomentAuth();
        } else throw Error('未知阶段');
    } finally { window.fetch = nativeFetch; }
    return { phase, passed: checks.length, checks };
};
