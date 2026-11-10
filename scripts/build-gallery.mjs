#!/usr/bin/env node

/**
 * build-gallery.mjs
 * 从 GitHub Issues（带 gallery 标签）同步相册照片：
 *   下载附件 → sharp 压缩 + 三档图（全图 1600w / 缩略图 480w / LQIP 微缩图）
 *   → 读取 EXIF 拍摄时间 → 生成 data/gallery.json（含宽高比，前端做 Justified 布局）
 *
 * 发布约定：一个 Issue = 一个相册批次
 *   - 标签必须包含 gallery
 *   - Issue 标题作为相册名（如「2026.10 川西」），留空/为模板标题时按拍摄月份自动分组
 *   - 仅同步博主本人（OWNER）发布的 Issue，陌生 Issue 静默丢弃（防注入）
 *
 * 运行方式：
 *   node scripts/build-gallery.mjs
 *   node scripts/build-gallery.mjs --seed-dir ./some-images   # 本地开发：从本地目录导入
 *
 * 环境变量：
 *   GITHUB_TOKEN / GH_TOKEN：认证请求，避免匿名限流
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GALLERY_FILE = path.join(ROOT, 'data', 'gallery.json');
const GALLERY_ASSETS_DIR = path.join(ROOT, 'assets', 'gallery');

const REPO = 'mfcheer/mfcheer.github.io';
const OWNER_LOGIN = 'mfcheer';
const LABEL = 'gallery';
const API_URL = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&sort=created&direction=desc&labels=${LABEL}`;

// 图片处理档位
const FULL_MAX_W = 1600;   // 全图（Lightbox 用）
const THUMB_W = 480;       // 墙面缩略图
const LQIP_W = 16;         // 微缩占位图
const JPEG_QUALITY_FULL = 82;
const JPEG_QUALITY_THUMB = 78;

// ---------------- 时间处理 ----------------

// UTC ISO 时间 → 东八区 "YYYY-MM-DD HH:mm:ss"
// 照片日期统一取「上传到 GitHub 的时间」（Issue created_at），不使用 EXIF 拍摄时间；
// created_at 为 UTC，按北京时间呈现，避免晚上上传的照片被算成前一天
function toCN(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const p = (n) => String(n).padStart(2, '0');
    const t = new Date(d.getTime() + 8 * 3600 * 1000);
    return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())}`;
}

// ---------------- 工具函数 ----------------

function stableId(src) {
    const ghMatch = String(src).match(/user-attachments\/assets\/([0-9a-fA-F-]+)/);
    if (ghMatch) return ghMatch[1].toLowerCase().slice(0, 20);
    return crypto.createHash('md5').update(String(src)).digest('hex').slice(0, 16);
}

/** 从 Issue 正文提取图片链接（复用 sync-moments 的三类语法识别） */
function extractImages(raw) {
    const images = [];
    const seen = new Set();
    const add = (src) => {
        const s = (src || '').trim();
        if (!s || !(/^(https?:\/\/|assets\/)/i.test(s))) return;
        if (!seen.has(s)) { seen.add(s); images.push(s); }
    };
    let clean = raw || '';
    clean = clean.replace(/<img\b[^>]*?src=["']([^"'\s]+)["'][^>]*?\/?>/gi, (_, src) => {
        add(src);
        return '';
    });
    clean = clean.replace(/!\[([^\]]*)\]\(((?:https?:\/\/|assets\/)[^\s\)]+)\)/gi, (_, _alt, src) => {
        add(src);
        return '';
    });
    clean = clean.replace(/^(https?:\/\/(?:github\.com\/user-attachments\/assets\/|user-images\.githubusercontent\.com\/)[^\s]+)$/gmi, (_, src) => {
        add(src);
        return '';
    });
    return images;
}

async function readLocalOrDownload(src) {
    // 本站绝对 URL → 仓库内相对路径：站内上传的图片在 Issue 创建前已提交进仓库，
    // 直接读 checkout 的本地文件，避免「Issue 触发同步早于 Pages 部署」导致的 404 竞态
    try {
        const u = new URL(src);
        if (u.hostname === 'mfcheer.github.io' && /^\/assets\//i.test(u.pathname)) {
            src = decodeURIComponent(u.pathname).slice(1);
        }
    } catch { /* 非 URL 字符串，按原逻辑处理 */ }
    // 本地文件路径（seed 导入模式）或仓库内相对路径：直接读文件
    if (/^assets\//i.test(src) || !/^https?:\/\//i.test(src)) {
        const local = path.isAbsolute(src) ? src : path.join(ROOT, src);
        try {
            return { buffer: await fs.readFile(local), kind: 'local' };
        } catch {
            console.warn(`[Skip] 本地文件不存在: ${src}`);
            return null;
        }
    }
    const res = await fetch(src, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
    });
    if (!res.ok) {
        console.warn(`[Skip] 下载失败 HTTP ${res.status}: ${src}`);
        return null;
    }
    return { buffer: Buffer.from(await res.arrayBuffer()), kind: 'remote' };
}

async function writeIfChanged(file, content) {
    const prev = await fs.readFile(file, 'utf-8').catch(() => null);
    if (prev !== content) {
        await fs.mkdir(path.dirname(file), { recursive: true });
        await fs.writeFile(file, content, 'utf-8');
        return true;
    }
    return false;
}

/**
 * 处理单张图片：压缩出全图/缩略图/LQIP，读取尺寸
 * 返回 { file, thumb, lqip, w, h, takenAt, bytes }（takenAt = 上传时间）
 */
async function processImage(src, id, createdAtFallback) {
    const fetched = await readLocalOrDownload(src);
    if (!fetched || !fetched.buffer) return null;
    const { buffer } = fetched;

    const isGif = buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46; // GIF8
    const meta = await sharp(buffer, { animated: isGif }).metadata().catch(() => null);
    if (!meta) {
        console.warn(`[Skip] 无法解析的图片: ${src}`);
        return null;
    }

    const takenAt = createdAtFallback;
    const fullFile = `${id}.jpg`;
    const thumbFile = `${id}_s.jpg`;
    const fullPath = path.join(GALLERY_ASSETS_DIR, fullFile);
    const thumbPath = path.join(GALLERY_ASSETS_DIR, thumbFile);

    if (isGif) {
        // 动图不压帧，原样入库；缩略图取首帧
        await fs.writeFile(fullPath, buffer);
        await sharp(buffer, { animated: false }).resize({ width: THUMB_W, withoutEnlargement: true }).jpeg({ quality: JPEG_QUALITY_THUMB }).toFile(thumbPath);
    } else {
        await sharp(buffer).rotate().resize({ width: FULL_MAX_W, height: FULL_MAX_W, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: JPEG_QUALITY_FULL, mozjpeg: true }).toFile(fullPath);
        await sharp(buffer).rotate().resize({ width: THUMB_W, withoutEnlargement: true }).jpeg({ quality: JPEG_QUALITY_THUMB, mozjpeg: true }).toFile(thumbPath);
    }

    // LQIP：极小 JPEG 转 base64 内嵌
    const lqipBuf = await sharp(buffer).rotate().resize({ width: LQIP_W }).jpeg({ quality: 30 }).toBuffer();
    const lqip = `data:image/jpeg;base64,${lqipBuf.toString('base64')}`;

    // 以实际落盘的全图尺寸为准（保证 ratio 与展示文件一致）
    const fullMeta = await sharp(fullPath).metadata();
    const stat = await fs.stat(fullPath);
    const w = fullMeta.width || meta.width || 1;
    const h = fullMeta.height || meta.height || 1;

    console.log(`[Saved] ${fullFile} ${w}x${h} ${(stat.size / 1024).toFixed(0)}KB${takenAt ? ` 上传 ${takenAt}` : ''}`);
    return {
        src: `assets/gallery/${fullFile}`,
        thumb: `assets/gallery/${thumbFile}`,
        lqip,
        w,
        h,
        ratio: Math.round((w / h) * 1000) / 1000,
        takenAt,
        bytes: stat.size,
        source: src
    };
}

// ---------------- 主流程 ----------------

async function fetchIssues() {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'mfcheer-gallery-syncer' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 分页拉取全部（GitHub 单页上限 100 条），相册 Issue 超过一页时也不丢数据；
    // 任一页失败直接抛错终止，避免静默截断
    const MAX_PAGES = 50; // 安全阀：50 页 × 100 条，防异常循环
    const sep = API_URL.includes('?') ? '&' : '?';
    const all = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
        const res = await fetch(`${API_URL}${sep}page=${page}`, { headers });
        if (!res.ok) throw new Error(`GitHub API 请求失败 HTTP ${res.status}`);
        const batch = await res.json();
        if (!Array.isArray(batch) || !batch.length) break;
        all.push(...batch);
        if (batch.length < 100) break; // 末页
    }
    return all
        .filter((it) => !it.pull_request)
        .filter((it) => it.author_association === 'OWNER' || (it.user && it.user.login && it.user.login.toLowerCase() === OWNER_LOGIN));
}

function albumTitleFromIssue(issue) {
    let t = (issue.title || '').trim();
    // 「📷 相册 秋」→ 剥离模板前缀，取实际相册名「秋」
    t = t.replace(/^[✨📷]\s*(相册|说说)\s*[:：]?\s*/u, '').trim();
    // 剩余为空（纯模板标题）→ 按拍摄月份分组
    if (!t) return null;
    return t;
}

/** 从 Issue 正文提取「相册简介」段落（模板中的可选 textarea） */
function extractDescription(raw) {
    if (!raw) return null;
    const m = raw.match(/###\s*相册简介[^\n]*\n+([\s\S]*?)(?=\n###\s|\n<!--[^\n]*-->|$)/);
    let text = (m ? m[1] : '').trim();
    if (!text || /^_No response_$/i.test(text) || text === '无') return null;
    text = text.replace(/\r/g, '').split('\n').filter(Boolean).join(' ');
    return text.slice(0, 200);
}

function formatMonth(dateStr) {
    const d = new Date(dateStr.replace(' ', 'T') + (dateStr.length === 16 ? ':00' : ''));
    if (isNaN(d)) return '未分组';
    return `${d.getFullYear()}·${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function main() {
    const seedDirIdx = process.argv.indexOf('--seed-dir');
    const seedDir = seedDirIdx > -1 ? process.argv[seedDirIdx + 1] : null;

    // 收集「相册批次」：[{ album, images: [{src, fallbackDate}] }]
    let batches = [];
    const keptSources = new Set();

    if (seedDir) {
        const entries = await fs.readdir(seedDir, { withFileTypes: true });
        const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
        if (subDirs.length > 0) {
            // 子目录模式：每个子目录 = 一个相册（目录名即相册标题）
            for (const sub of subDirs) {
                const dir = path.join(seedDir, sub);
                const files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
                if (!files.length) continue;
                let description = null;
                try {
                    description = (await fs.readFile(path.join(dir, 'desc.txt'), 'utf8')).trim() || null;
                } catch { /* 无简介 */ }
                batches.push({
                    album: sub,
                    description,
                    images: files.map((f) => ({ src: path.join(dir, f), fallbackDate: null, key: `${sub}-${f.replace(/\.[^.]+$/, '')}` }))
                });
            }
            console.log(`[Seed] 子目录相册模式: ${subDirs.join(' / ')}`);
        } else {
            const files = (await fs.readdir(seedDir)).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
            batches = [{
                album: '本地导入',
                images: files.map((f) => ({ src: path.join(seedDir, f), fallbackDate: null, key: f.replace(/\.[^.]+$/, '') }))
            }];
            console.log(`[Seed] 本地目录导入模式: ${seedDir}，共 ${files.length} 张`);
        }
    } else {
        const issues = process.env.ISSUES_SNAPSHOT
            ? JSON.parse(await fs.readFile(process.env.ISSUES_SNAPSHOT, 'utf8'))
            : await fetchIssues();
        console.log(`拉取到 ${issues.length} 个 gallery 相册 Issue`);
        batches = issues.map((it) => ({
            issueNumber: it.number,
            issueUpdatedAt: it.updated_at,
            album: albumTitleFromIssue(it),
            created: it.created_at,
            description: extractDescription(it.body),
            images: extractImages(it.body).map((src) => ({ src, fallbackDate: it.created_at, key: stableId(src) }))
        })).filter((b) => b.images.length > 0);
    }

    await fs.mkdir(GALLERY_ASSETS_DIR, { recursive: true });

    // 逐张处理（带缓存：同一 id 已有产物则复用）
    const albumsMap = new Map(); // albumName -> photos[]
    const descriptions = new Map(); // albumName -> 简介文字
    for (const batch of batches) {
        const albumName = batch.album || null; // null = 之后按月份归组
        for (const img of batch.images) {
            // 保留站内上传的原始配图文件，防止清理逻辑误删原图导致 Issue 图片 404 与重新构建丢失
            try {
                const u = new URL(img.src);
                if (u.hostname === 'mfcheer.github.io' && /^\/assets\/gallery\//i.test(u.pathname)) {
                    keptSources.add(path.basename(decodeURIComponent(u.pathname)));
                }
            } catch {
                if (/^assets\/gallery\//i.test(img.src)) {
                    keptSources.add(path.basename(img.src));
                }
            }

            const id = img.key;
            try {
                let photo;
                const fullExists = await fs.stat(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).catch(() => null);
                if (fullExists && fullExists.size > 0 && !seedDir) {
                    // 缓存命中：只需补齐元数据（尺寸/EXIF 时间从产物与兜底推断）
                    const thumbPath = path.join(GALLERY_ASSETS_DIR, `${id}_s.jpg`);
                    const thumbExists = await fs.stat(thumbPath).catch(() => null);
                    if (!thumbExists || !thumbExists.size) {
                        await sharp(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`), { animated: false })
                            .resize({ width: THUMB_W, withoutEnlargement: true })
                            .jpeg({ quality: JPEG_QUALITY_THUMB }).toFile(thumbPath);
                    }
                    const meta = await sharp(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).metadata();
                    const lqipBuf = await sharp(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).resize({ width: LQIP_W }).jpeg({ quality: 30 }).toBuffer();
                    photo = {
                        src: `assets/gallery/${id}.jpg`,
                        thumb: `assets/gallery/${id}_s.jpg`,
                        lqip: `data:image/jpeg;base64,${lqipBuf.toString('base64')}`,
                        w: meta.width, h: meta.height,
                        ratio: Math.round((meta.width / meta.height) * 1000) / 1000,
                        takenAt: toCN(img.fallbackDate),
                        bytes: fullExists.size,
                        source: img.src
                    };
                    console.log(`[Cache Hit] ${id}.jpg`);
                } else {
                    photo = await processImage(img.src, id, toCN(img.fallbackDate));
                }
                if (!photo) {
                    if (process.env.STRICT_BUILD === '1') throw new Error('图片未生成');
                    continue;
                }
                keptSources.add(`${id}.jpg`);
                keptSources.add(`${id}_s.jpg`);

                const name = albumName || formatMonth(photo.takenAt || batch.created || '');
                if (!albumsMap.has(name)) albumsMap.set(name, []);
                if (albumName && !descriptions.has(name) && batch.description) descriptions.set(name, batch.description);
                albumsMap.get(name).push({
                    issueNumber: batch.issueNumber || null,
                    issueUpdatedAt: batch.issueUpdatedAt,
                    source: img.src,
                    src: photo.src,
                    thumb: photo.thumb,
                    w: photo.w,
                    h: photo.h,
                    ratio: photo.ratio,
                    lqip: photo.lqip,
                    date: photo.takenAt || null
                });
            } catch (err) {
                if (process.env.STRICT_BUILD === '1') throw err;
                console.warn(`[Skip] 处理失败 ${img.src}: ${err.message}`);
            }
        }
    }

    // 相册组装：上传时间范围 + 封面 + 简介；最新相册优先展示
    const albums = [...albumsMap.entries()].map(([title, photos]) => {
        // 相册内按上传时间倒序：最新上传的照片排最前；同批次（时间相同）保持 Issue 内出现顺序
        photos.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        const dates = photos.map((p) => p.date).filter(Boolean).sort();
        let range = null;
        if (dates.length) {
            const fmt = (s) => s.slice(0, 7).replace('-', '.');
            const a = fmt(dates[0]);
            const b = fmt(dates[dates.length - 1]);
            range = a === b ? a : `${a} – ${b}`;
        }
        const cover = photos[0] || null;
        return {
            title,
            count: photos.length,
            description: descriptions.get(title) || null,
            range,
            cover: cover ? { src: cover.src, thumb: cover.thumb, lqip: cover.lqip, w: cover.w, h: cover.h, ratio: cover.ratio, date: cover.date } : null,
            photos
        };
    }).sort((a, b) => {
        const last = (al) => al.photos.map((p) => p.date).filter(Boolean).sort().pop() || '';
        const da = last(a);
        const db = last(b);
        if (da !== db) return db.localeCompare(da);
        return a.title.localeCompare(b.title);
    });

    const total = albums.reduce((s, a) => s + a.count, 0);
    const json = JSON.stringify({ updated_at: toCN(new Date().toISOString()), total, albums }, null, 2) + '\n';

    const changed = await writeIfChanged(GALLERY_FILE, json);

    // 清理不再被引用的产物（Issue 删除/关闭后其照片自动下架）
    // 注意：豁免站内上传的原图（gallery-*），防止并发或重构时误删原始资产
    const existing = await fs.readdir(GALLERY_ASSETS_DIR).catch(() => []);
    let removed = 0;
    for (const f of existing) {
        if (!keptSources.has(f) && !/^gallery-\d+/i.test(f)) {
            await fs.rm(path.join(GALLERY_ASSETS_DIR, f));
            removed++;
        }
    }
    if (removed) console.log(`[Cleanup] 清理下架产物 ${removed} 个`);

    console.log(`相册同步完成：${albums.length} 个相册 / ${total} 张照片${changed ? '（数据有更新）' : '（无变化）'}`);
}

main().catch((err) => {
    console.error('相册同步失败:', err);
    process.exit(1);
});
