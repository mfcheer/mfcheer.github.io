#!/usr/bin/env node

/**
 * sync-moments.mjs
 * 从 GitHub Issues 同步说说数据、自动下载并本地化配图，保存为纯静态文件 data/moments.json
 * 
 * 运行方式：
 *   node scripts/sync-moments.mjs
 * 
 * 环境变量支持：
 *   GITHUB_TOKEN / GH_TOKEN: 在 CI 环境或本地进行高配额认证请求（避免触发 60次/h 匿名限流）
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MOMENTS_FILE = path.join(ROOT, 'data', 'moments.json');
const MOMENTS_ASSETS_DIR = path.join(ROOT, 'assets', 'moments');

const REPO = 'mfcheer/mfcheer.github.io';
const API_URL = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc&labels=moment`;

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
        // 放行两类来源：远程绝对 URL（http/https）与仓库内相对路径（assets/...）。
        // 站内发布会把配图直传仓库 assets/moments/，Issue 正文引用相对路径；
        // GitHub 网页发布的附件则是绝对 URL，二者都要认
        if (!trimmedSrc || !(/^https?:\/\//i.test(trimmedSrc) || /^assets\//i.test(trimmedSrc))) return;
        if (!seenSrcs.has(trimmedSrc)) {
            seenSrcs.add(trimmedSrc);
            images.push({
                src: trimmedSrc,
                alt: (alt || '').trim()
            });
        }
    };

    // 1. 匹配 HTML img 标签（src 由 addImage 统一过滤，兼容绝对与仓库相对路径）
    clean = clean.replace(/<img\b([^>]*?)\/?>/gi, (_, attrs) => {
        const srcMatch = attrs.match(/src=["']([^"'\s]+)["']/i);
        const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
        if (srcMatch) {
            addImage(srcMatch[1], altMatch ? altMatch[1] : '');
            return '';
        }
        return '';
    });

    // 2. 匹配 Markdown 图片语法: ![alt](url)，仅匹配可放行的两类前缀，
    //    避免把 javascript: 等非图片协议的普通链接误当图片拆坏文本
    clean = clean.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|assets\/)[^\s\)]+)\)/gi, (_, alt, src) => {
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

/**
 * 将远程配图下载到仓库本地 assets/moments/ 目录下，实现国内同源极速访问
 */
async function downloadAndLocalizeImage(src) {
    if (!src || !/^https?:\/\//i.test(src)) {
        return src; // 已经是本地相对路径，直接复用
    }

    try {
        await fs.mkdir(MOMENTS_ASSETS_DIR, { recursive: true });

        // 提取或生成稳定的文件名
        let filenameBase = '';
        const ghMatch = src.match(/user-attachments\/assets\/([0-9a-fA-F-]+)/);
        if (ghMatch) {
            filenameBase = ghMatch[1].toLowerCase();
        } else {
            filenameBase = crypto.createHash('md5').update(src).digest('hex').slice(0, 16);
        }

        // 检查本地是否已有已下载的对应文件
        const existingFiles = await fs.readdir(MOMENTS_ASSETS_DIR).catch(() => []);
        const matched = existingFiles.find((f) => f.startsWith(filenameBase + '.'));
        if (matched) {
            const stat = await fs.stat(path.join(MOMENTS_ASSETS_DIR, matched)).catch(() => null);
            if (stat && stat.size > 0) {
                console.log(`[Cache Hit] 配图已存在: assets/moments/${matched}`);
                return `assets/moments/${matched}`;
            }
        }

        console.log(`[Downloading] 正在下载说说配图: ${src}`);
        const res = await fetch(src, {
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        if (!res.ok) {
            console.warn(`下载图片失败 (HTTP ${res.status}): ${src}`);
            return src; // 降级返回原 URL
        }

        const contentType = res.headers.get('content-type') || '';
        let ext = '.jpg';
        if (contentType.includes('png')) ext = '.png';
        else if (contentType.includes('webp')) ext = '.webp';
        else if (contentType.includes('gif')) ext = '.gif';
        else if (contentType.includes('svg')) ext = '.svg';
        else if (contentType.includes('jpeg')) ext = '.jpg';
        else {
            const urlPath = new URL(src).pathname;
            const extMatch = urlPath.match(/\.(jpe?g|png|webp|gif|svg)$/i);
            if (extMatch) ext = '.' + extMatch[1].toLowerCase();
        }

        const filename = `${filenameBase}${ext}`;
        const targetPath = path.join(MOMENTS_ASSETS_DIR, filename);

        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(targetPath, buffer);
        console.log(`[Saved] 配图已本地化: assets/moments/${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);

        return `assets/moments/${filename}`;
    } catch (err) {
        console.warn(`下载配图异常: ${src}`, err.message);
        return src; // 降级返回原 URL
    }
}

async function localizeAllMoments(list) {
    for (const m of list) {
        if (m.images && m.images.length) {
            for (const img of m.images) {
                img.src = await downloadAndLocalizeImage(img.src);
            }
        }
    }
    return list;
}

async function main() {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'mfcheer-moments-syncer'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`正在从 GitHub 拉取说说数据: ${API_URL}`);
    let issues = null;
    try {
        const res = await fetch(API_URL, { headers });
        if (res.ok) {
            issues = await res.json();
        } else {
            if (res.status === 403) {
                console.warn('GitHub API 触发匿名限流 (403 Rate Limited)');
            } else {
                console.warn(`请求失败: HTTP ${res.status}`);
            }
        }
    } catch (e) {
        console.warn('拉取 GitHub Issues 网络异常:', e.message);
    }

    let list = [];
    if (Array.isArray(issues)) {
        list = issues
            .filter((it) => {
                if (!it || it.pull_request) return false;
                // 仅同步带 moment 标签的 Issue（防止相册等其他类型 Issue 混入说说流）
                const labels = Array.isArray(it.labels) ? it.labels.map((l) => l && l.name) : [];
                if (!labels.includes('moment')) return false;
                // 仅同步博主本人（mfcheer / OWNER）发布的说说，防止陌生人提交 Issue 注入内容
                const isOwner =
                    it.author_association === "OWNER" ||
                    (it.user && it.user.login && it.user.login.toLowerCase() === "mfcheer");
                return Boolean(isOwner);
            })
            .map((it) => {
                const rawContent = ((it.body || '').trim() || (it.title || '')).trim();
                const { text, images } = parseMomentContent(rawContent, it.title);
                return {
                    date: formatMomentDate(it.created_at),
                    text,
                    name: it.user && it.user.login,
                    avatar: it.user && it.user.avatar_url,
                    labels: (Array.isArray(it.labels) ? it.labels : [])
                        .map((l) => l && l.name)
                        .filter((n) => typeof n === 'string' && n && n !== 'moment'),
                    images
                };
            })
            .filter((m) => m.text || (m.images && m.images.length));
    } else {
        // 读取现有 moments.json
        try {
            const raw = await fs.readFile(MOMENTS_FILE, 'utf-8');
            list = JSON.parse(raw);
            console.log(`使用现有 ${MOMENTS_FILE} 中的数据继续本地化。`);
        } catch {
            throw new Error(`无法获取说说数据，且未找到现有 ${MOMENTS_FILE}`);
        }
    }

    // 自动下载所有外部配图到本地 assets/moments/
    list = await localizeAllMoments(list);

    await fs.mkdir(path.dirname(MOMENTS_FILE), { recursive: true });
    await fs.writeFile(MOMENTS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf-8');
    console.log(`成功同步并本地化 ${list.length} 条说说至 ${MOMENTS_FILE}`);
}

main().catch((err) => {
    console.error('同步失败:', err);
    process.exit(1);
});
