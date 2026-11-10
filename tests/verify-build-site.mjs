// 显式联网的整站集成验证：在临时副本运行真实脚本，不写仓库、不发布。
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildSite, fetchIssues, hashFiles, PUBLIC_DIRS, PUBLIC_FILES } from '../scripts/build-site.mjs';

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mfcheer-integration-'));
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; console.log(`PASS ${message}`); }
try {
    for (const name of [...PUBLIC_DIRS, ...PUBLIC_FILES, '_posts', 'templates', 'scripts', 'package.json', 'package-lock.json']) {
        try { await fs.cp(path.join(source, name), path.join(root, name), { recursive: true }); }
        catch (e) { if (e.code !== 'ENOENT') throw e; }
    }
    await fs.symlink(path.join(source, 'node_modules'), path.join(root, 'node_modules'), 'dir');
    let moments = await fetchIssues('moment');
    let gallery = await fetchIssues('gallery');
    const options = {
        root, output: path.join(root, '_site'),
        getIssues: async (label) => structuredClone(label === 'moment' ? moments : gallery),
        run: (script, env) => {
            const log = execFileSync(process.execPath, [path.join(root, script)], {
                cwd: root, env: { ...process.env, ...env }, timeout: 600000, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024
            });
            console.log(log.trim().split('\n').at(-1));
        }
    };
    console.log(`公开 Issue 快照：${moments.length} 条说说，${gallery.length} 个相册`);
    const first = await buildSite(options);
    const count = JSON.parse(await fs.readFile(path.join(root, 'data/blog-index.json'))).count;
    check(first.publish && Object.values(first.changed).every(Boolean), '首次完整构建');
    check(count >= 625, `真实文章完整保留：${count} 篇`);
    const blogHash = await hashFiles(root, ['blog', 'data/blog-index.json', 'atom.xml', 'sitemap.xml']);
    const galleryHash = await hashFiles(root, ['data/gallery.json']);
    const repeat = await buildSite(options);
    check(!repeat.publish && Object.values(repeat.changed).every((v) => !v), '重复事件不构建不部署');

    moments[0].body += '\n\n临时验证文字，仅存在临时副本。';
    const momentUpdate = await buildSite(options);
    check(momentUpdate.changed.moments && !momentUpdate.changed.blog && !momentUpdate.changed.gallery, '修改说说仅同步说说');
    check(await hashFiles(root, ['blog', 'data/blog-index.json', 'atom.xml', 'sitemap.xml']) === blogHash, '说说更新保留全部文章');
    check(await hashFiles(root, ['data/gallery.json']) === galleryHash, '说说更新保留相册');
    const momentHash = await hashFiles(root, ['data/moments.json']);

    gallery[0].title += ' 临时验证';
    const galleryUpdate = await buildSite(options);
    check(galleryUpdate.changed.gallery && !galleryUpdate.changed.blog && !galleryUpdate.changed.moments, '修改相册仅构建相册');
    check(await hashFiles(root, ['data/moments.json']) === momentHash, '相册更新保留最新说说');
    check(await hashFiles(root, ['blog', 'data/blog-index.json', 'atom.xml', 'sitemap.xml']) === blogHash, '相册更新保留全部文章');
    const beforeTotal = JSON.parse(await fs.readFile(path.join(root, 'data/gallery.json'))).total;
    const targetIdx = gallery.findIndex((i) => i.body && (i.body.includes("http") || i.body.includes("assets/"))); gallery.splice(targetIdx >= 0 ? targetIdx : 0, 1);
    await buildSite(options);
    check(JSON.parse(await fs.readFile(path.join(root, 'data/gallery.json'))).total < beforeTotal, '相册下架清理对应照片');

    const postPath = path.join(root, '_posts/2026-11-10-build-verification.md');
    await fs.writeFile(postPath, "---\ntitle: 临时构建验证\ndate: '2026-11-10 01:00'\nslug: build-verification\n---\n仅在临时副本存在。\n");
    const addPost = await buildSite(options);
    check(addPost.changed.blog && !addPost.changed.gallery && !addPost.changed.moments, '新增文章只构建文章');
    await fs.access(path.join(root, '_site/blog/build-verification/index.html'));
    await fs.rm(postPath);
    await buildSite(options);
    check(!(await fs.stat(path.join(root, '_site/blog/build-verification')).catch(() => null)), '删除文章清理旧页面');
    check(JSON.parse(await fs.readFile(path.join(root, '_site/data/blog-index.json'))).count === count, '下架后文章索引数量恢复');

    await fs.rm(path.join(root, 'blog'), { recursive: true });
    const repair = await buildSite(options);
    check(repair.changed.blog && JSON.parse(await fs.readFile(path.join(root, '_site/data/blog-index.json'))).count === count, '整个文章目录丢失后自动完整修复');

    const previousState = await fs.readFile(path.join(root, '.build-state.json'), 'utf8');
    const previousSite = await hashFiles(path.join(root, '_site'), [...PUBLIC_DIRS, ...PUBLIC_FILES]);
    await fs.writeFile(path.join(root, 'assets/gallery/gallery-999999-invalid.jpg'), 'invalid image');
    gallery.push({ ...gallery[0], number: 99999999, title: '故障验证', body: '![](assets/gallery/gallery-999999-invalid.jpg)' });
    await assert.rejects(buildSite(options));
    check(await fs.readFile(path.join(root, '.build-state.json'), 'utf8') === previousState, '图片损坏时不推进成功状态');
    check(await hashFiles(path.join(root, '_site'), [...PUBLIC_DIRS, ...PUBLIC_FILES]) === previousSite, '图片损坏时保留上次完整发布目录');
    gallery.pop();
    await fs.rm(path.join(root, 'assets/gallery/gallery-999999-invalid.jpg'));
    const retry = await buildSite({ ...options, force: true });
    check(Object.values(retry.changed).every(Boolean) && retry.publish, '失败后强制全量重建可恢复');
    console.log(`整站集成验证通过：${checks} 项，原始 ${count} 篇文章。没有发布或改动真实内容。`);
} finally { await fs.rm(root, { recursive: true, force: true }); }
