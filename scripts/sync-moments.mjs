#!/usr/bin/env node

/**
 * sync-moments.mjs
 * 从 GitHub Issues 同步说说数据并保存为静态文件 data/moments.json
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MOMENTS_FILE = path.join(ROOT, 'data', 'moments.json');

const REPO = 'mfcheer/mfcheer.github.io';
const API_URL = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc`;

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
        const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
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

    return { text: clean, images };
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
    const res = await fetch(API_URL, { headers });

    if (!res.ok) {
        if (res.status === 403) {
            console.warn('GitHub API 触发匿名限流 (403 Rate Limited)');
        } else {
            console.warn(`请求失败: HTTP ${res.status}`);
        }
        // 如果本地已存在 moments.json，保留现有数据
        try {
            await fs.access(MOMENTS_FILE);
            console.log(`保留现有 ${MOMENTS_FILE} 静态数据。`);
            return;
        } catch {
            throw new Error(`无法获取说说数据，且未找到现有 ${MOMENTS_FILE}`);
        }
    }

    const issues = await res.json();
    const list = (Array.isArray(issues) ? issues : [])
        .filter((it) => it && !it.pull_request)
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

    await fs.mkdir(path.dirname(MOMENTS_FILE), { recursive: true });
    await fs.writeFile(MOMENTS_FILE, JSON.stringify(list, null, 2) + '\n', 'utf-8');
    console.log(`成功同步 ${list.length} 条说说至 ${MOMENTS_FILE}`);
}

main().catch((err) => {
    console.error('同步失败:', err);
    process.exit(1);
});
