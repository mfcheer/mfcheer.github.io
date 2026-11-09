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

// ---------------- EXIF 最小解析：只取拍摄时间 DateTimeOriginal (0x9003) ----------------

function parseExifDate(exifBuffer) {
    try {
        if (!exifBuffer || exifBuffer.length < 8) return null;
        let off = 0;
        // JPEG APP1 内嵌 TIFF；sharp 返回的 exif 是去掉 APP1 头的 TIFF 原始数据
        if (exifBuffer.toString('ascii', 0, 2) === 'Ex') {
            // "Exif\0\0" 前缀（6 字节）
            off = 6;
        }
        const tiff = off;
        const byteOrder = exifBuffer.toString('ascii', tiff, tiff + 2);
        const little = byteOrder === 'II';
        const big = byteOrder === 'MM';
        if (!little && !big) return null;
        const read16 = (o) => (little ? exifBuffer.readUInt16LE(o) : exifBuffer.readUInt16BE(o));
        const read32 = (o) => (little ? exifBuffer.readUInt32LE(o) : exifBuffer.readUInt32BE(o));

        const ifd0 = tiff + read32(tiff + 4);
        let exifIfd = null;
        const entryCount = read16(ifd0);
        for (let i = 0; i < entryCount; i++) {
            const e = ifd0 + 2 + i * 12;
            if (read16(e) === 0x8769) { // ExifIFDPointer
                exifIfd = tiff + read32(e + 8);
                break;
            }
        }
        if (!exifIfd) return null;
        const count = read16(exifIfd);
        for (let i = 0; i < count; i++) {
            const e = exifIfd + 2 + i * 12;
            const tag = read16(e);
            if (tag === 0x9003 || tag === 0x9004) { // DateTimeOriginal / DateTimeDigitized
                const len = read32(e + 4);
                const valOff = len > 4 ? tiff + read32(e + 8) : e + 8;
                const str = exifBuffer.toString('ascii', valOff, valOff + len).replace(/\0/g, '').trim();
                // 形如 "2023:10:02 08:15:00"
                const m = str.match(/^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
                if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
            }
        }
        return null;
    } catch {
        return null;
    }
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
 * 处理单张图片：压缩出全图/缩略图/LQIP，读取 EXIF 时间与尺寸
 * 返回 { file, thumb, lqip, w, h, takenAt, bytes }
 */
async function processImage(src, id, takenAtFallback) {
    const { buffer } = await readLocalOrDownload(src);
    if (!buffer) return null;

    const isGif = buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46; // GIF8
    const meta = await sharp(buffer, { animated: isGif }).metadata().catch(() => null);
    if (!meta) {
        console.warn(`[Skip] 无法解析的图片: ${src}`);
        return null;
    }

    const takenAt = parseExifDate(meta.exif) || takenAtFallback;
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

    console.log(`[Saved] ${fullFile} ${w}x${h} ${(stat.size / 1024).toFixed(0)}KB${takenAt ? ` 拍摄 ${takenAt}` : ''}`);
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

    const res = await fetch(API_URL, { headers });
    if (!res.ok) throw new Error(`GitHub API 请求失败 HTTP ${res.status}`);
    const issues = await res.json();
    return (Array.isArray(issues) ? issues : [])
        .filter((it) => !it.pull_request)
        .filter((it) => it.author_association === 'OWNER' || (it.user && it.user.login && it.user.login.toLowerCase() === OWNER_LOGIN));
}

function albumTitleFromIssue(issue) {
    const t = (issue.title || '').trim();
    // 模板标题或空标题 → 按拍摄月份分组
    if (!t || t === '📷 相册' || /^[✨📷]/.test(t)) return null;
    return t;
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
                batches.push({
                    album: sub,
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
        const issues = await fetchIssues();
        console.log(`拉取到 ${issues.length} 个 gallery 相册 Issue`);
        batches = issues.map((it) => ({
            album: albumTitleFromIssue(it),
            created: it.created_at,
            images: extractImages(it.body).map((src) => ({ src, fallbackDate: it.created_at, key: stableId(src) }))
        })).filter((b) => b.images.length > 0);
    }

    await fs.mkdir(GALLERY_ASSETS_DIR, { recursive: true });

    // 逐张处理（带缓存：同一 id 已有产物则复用）
    const albumsMap = new Map(); // albumName -> photos[]
    for (const batch of batches) {
        const albumName = batch.album || null; // null = 之后按月份归组
        for (const img of batch.images) {
            const id = img.key;
            try {
                let photo;
                const fullExists = await fs.stat(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).catch(() => null);
                if (fullExists && fullExists.size > 0 && !seedDir) {
                    // 缓存命中：只需补齐元数据（尺寸/EXIF 时间从产物与兜底推断）
                    const meta = await sharp(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).metadata();
                    const lqipBuf = await sharp(path.join(GALLERY_ASSETS_DIR, `${id}.jpg`)).resize({ width: LQIP_W }).jpeg({ quality: 30 }).toBuffer();
                    photo = {
                        src: `assets/gallery/${id}.jpg`,
                        thumb: `assets/gallery/${id}_s.jpg`,
                        lqip: `data:image/jpeg;base64,${lqipBuf.toString('base64')}`,
                        w: meta.width, h: meta.height,
                        ratio: Math.round((meta.width / meta.height) * 1000) / 1000,
                        takenAt: img.fallbackDate ? img.fallbackDate.slice(0, 19).replace('T', ' ') : null,
                        bytes: fullExists.size,
                        source: img.src
                    };
                    console.log(`[Cache Hit] ${id}.jpg`);
                } else {
                    photo = await processImage(img.src, id, img.fallbackDate ? img.fallbackDate.slice(0, 19).replace('T', ' ') : null);
                }
                if (!photo) continue;
                keptSources.add(`${id}.jpg`);
                keptSources.add(`${id}_s.jpg`);

                const name = albumName || formatMonth(photo.takenAt || batch.created || '');
                if (!albumsMap.has(name)) albumsMap.set(name, []);
                albumsMap.get(name).push({
                    src: photo.src,
                    thumb: photo.thumb,
                    w: photo.w,
                    h: photo.h,
                    ratio: photo.ratio,
                    lqip: photo.lqip,
                    date: photo.takenAt || null
                });
            } catch (err) {
                console.warn(`[Skip] 处理失败 ${img.src}: ${err.message}`);
            }
        }
    }

    // 相册排序：标题含年份的按标题，否则按内部最早时间；相册内按拍摄时间
    const albums = [...albumsMap.entries()].map(([title, photos]) => {
        photos.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
        return { title, count: photos.length, photos };
    }).sort((a, b) => a.title.localeCompare(b.title));

    const total = albums.reduce((s, a) => s + a.count, 0);
    const json = JSON.stringify({ updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '), total, albums }, null, 2) + '\n';

    const changed = await writeIfChanged(GALLERY_FILE, json);

    // 清理不再被引用的产物（Issue 删除/关闭后其照片自动下架）
    const existing = await fs.readdir(GALLERY_ASSETS_DIR).catch(() => []);
    let removed = 0;
    for (const f of existing) {
        if (!keptSources.has(f)) { await fs.rm(path.join(GALLERY_ASSETS_DIR, f)); removed++; }
    }
    if (removed) console.log(`[Cleanup] 清理下架产物 ${removed} 个`);

    console.log(`相册同步完成：${albums.length} 个相册 / ${total} 张照片${changed ? '（数据有更新）' : '（无变化）'}`);
}

main().catch((err) => {
    console.error('相册同步失败:', err);
    process.exit(1);
});
