#!/usr/bin/env node
// 统一构建入口：比较完整输入快照，串行构建变化模块，组装完整站点。
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { syncSiteChrome } from './build-nav.mjs';

export const PUBLIC_DIRS = ['assets', 'blog', 'data', 'gallery', 'moments', 'privacy'];
export const PUBLIC_FILES = ['index.html', '404.html', '.nojekyll', 'CNAME', 'atom.xml', 'sitemap.xml', 'robots.txt', 'manifest.json', 'sw.js', 'styles.css', 'script.js', 'gallery.js', 'avatar.jpg', 'apple-touch-icon.png', 'favicon-32x32.png', 'favicon.ico', 'giscus.json'];
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');

async function filesUnder(root, relative) {
    let stat;
    try { stat = await fs.lstat(path.join(root, relative)); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    if (stat.isSymbolicLink()) throw new Error(`不允许发布符号链接：${relative}`);
    if (!stat.isDirectory()) return [relative];
    const names = (await fs.readdir(path.join(root, relative))).sort();
    return (await Promise.all(names.map((name) => filesUnder(root, `${relative}/${name}`)))).flat();
}
export async function hashFiles(root, paths) {
    const files = (await Promise.all(paths.map((p) => filesUnder(root, p)))).flat().sort();
    const hashes = await Promise.all(files.map(async (p) => [p, digest(await fs.readFile(path.join(root, p)))]));
    return digest(JSON.stringify(hashes));
}

export async function fetchIssues(label, fetcher = fetch) {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'mfcheer-site-builder' };
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (token) headers.Authorization = `Bearer ${token}`;
    const result = [];
    for (let page = 1; page <= 50; page++) {
        const url = `https://api.github.com/repos/mfcheer/mfcheer.github.io/issues?state=open&labels=${label}&per_page=100&sort=created&direction=desc&page=${page}`;
        const response = await fetcher(url, { headers, signal: AbortSignal.timeout(60000) });
        if (!response.ok) throw new Error(`读取 ${label} 第 ${page} 页失败：HTTP ${response.status}`);
        const batch = await response.json();
        if (!Array.isArray(batch)) throw new Error(`${label} 返回格式错误`);
        result.push(...batch);
        if (batch.length < 100) return normalizeIssues(result, label);
    }
    throw new Error(`${label} 超过 5000 条，停止发布以避免截断`);
}
export function normalizeIssues(issues, label) {
    return issues.filter((it) => !it.pull_request && it.state === 'open' &&
        it.user?.login?.toLowerCase() === 'mfcheer' &&
        it.labels?.some((l) => l.name === label))
        .map(({ number, title, body, created_at, updated_at, user, labels, author_association }) => ({
            number, title, body, created_at, updated_at,
            user: { login: user.login, avatar_url: user.avatar_url },
            labels: labels.map(({ name }) => ({ name })).sort((a, b) => a.name.localeCompare(b.name)),
            author_association
        })).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.number - a.number);
}

export async function buildSite({ root, output, getIssues = fetchIssues, run, force = false }) {
    // 先完整读取两个模块：任一 API 分页失败，不写数据、不发布旧快照。
    const [moments, gallery] = await Promise.all([getIssues('moment'), getIssues('gallery')]);
    let previous = {};
    try { previous = JSON.parse(await fs.readFile(path.join(root, '.build-state.json'), 'utf8')); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
    // 在输入摘要前更新模板，联系区或导航变化会自动触发文章重建。
    if (await fs.stat(path.join(root, 'data/nav.json')).catch(() => null)) syncSiteChrome(root);
    const common = ['package.json', 'package-lock.json'];
    const inputs = {
        blog: await hashFiles(root, [...common, '_posts', 'templates', 'scripts/build-posts.mjs', 'scripts/lib/post-toc.mjs']),
        moments: digest(JSON.stringify([moments, await hashFiles(root, [...common, 'scripts/sync-moments.mjs'])])),
        gallery: digest(JSON.stringify([gallery, await hashFiles(root, [...common, 'scripts/build-gallery.mjs'])]))
    };
    const outputs = {
        blog: ['blog', 'atom.xml', 'sitemap.xml', 'data/blog-index.json'],
        moments: ['data/moments.json'], gallery: ['data/gallery.json']
    };
    const changed = {};
    for (const name of Object.keys(inputs)) {
        changed[name] = force || previous.inputs?.[name] !== inputs[name] ||
            !previous.outputs?.[name] || previous.outputs[name] !== await hashFiles(root, outputs[name]);
    }
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'mfcheer-build-'));
    try {
        const runner = run || ((script, env) => execFileSync(process.execPath, [path.join(root, script)], {
            cwd: root, env: { ...process.env, ...env }, stdio: 'inherit', timeout: 600000
        }));
        for (const [name, script, issues] of [
            ['blog', 'scripts/build-posts.mjs'],
            ['moments', 'scripts/sync-moments.mjs', moments],
            ['gallery', 'scripts/build-gallery.mjs', gallery]
        ]) {
            if (!changed[name]) { console.log(`[Skip] ${name} 输入未变化`); continue; }
            const env = { STRICT_BUILD: '1' };
            if (issues) {
                env.ISSUES_SNAPSHOT = path.join(temp, `${name}.json`);
                await fs.writeFile(env.ISSUES_SNAPSHOT, JSON.stringify(issues));
            }
            console.log(`[Build] ${name}`);
            await runner(script, env);
        }
        // 校验所有本地图片都存在，防止缺图的部分产物上线。
        const galleryData = JSON.parse(await fs.readFile(path.join(root, 'data/gallery.json'), 'utf8'));
        const momentData = JSON.parse(await fs.readFile(path.join(root, 'data/moments.json'), 'utf8'));
        const images = [
            ...galleryData.albums.flatMap((a) => a.photos.flatMap((p) => [p.src, p.thumb])),
            ...momentData.flatMap((m) => (m.images || []).map((i) => i.src))
        ];
        for (const src of images) {
            const relative = String(src).replace(/^\//, '');
            if (!relative.startsWith('assets/')) throw new Error(`图片未本地化：${src}`);
            if (relative.split('/').includes('..')) throw new Error(`图片路径非法：${src}`);
            const stat = await fs.stat(path.join(root, relative));
            if (!stat.isFile() || !stat.size) throw new Error(`图片为空：${src}`);
        }
        const publicPaths = [...PUBLIC_DIRS, ...PUBLIC_FILES];
        const site = await hashFiles(root, publicPaths);
        const publish = force || site !== previous.site;
        const state = { version: 1, inputs, outputs: {}, site };
        for (const name of Object.keys(inputs)) state.outputs[name] = await hashFiles(root, outputs[name]);
        // 状态与所有生成物仅在部署成功后由 workflow 一起回写 main。
        await fs.writeFile(path.join(root, '.build-state.json'), JSON.stringify(state, null, 2) + '\n');
        if (output) {
            const resolved = path.resolve(output);
            if (resolved === path.resolve(root) || path.resolve(root).startsWith(resolved + path.sep)) throw new Error('发布目录不能覆盖项目目录');
            await fs.rm(output, { recursive: true, force: true });
            await fs.mkdir(output, { recursive: true });
            for (const p of publicPaths) {
                if ((await filesUnder(root, p)).length) await fs.cp(path.join(root, p), path.join(output, p), { recursive: true });
            }
        }
        return { changed, publish, state };
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
    buildSite({ root, output: path.join(root, '_site'), force: process.env.FULL_BUILD === 'true' })
        .then(async (result) => {
            console.log(JSON.stringify({ changed: result.changed, publish: result.publish }));
            if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `publish=${result.publish}\n`);
        }).catch((error) => { console.error(error); process.exitCode = 1; });
}
