#!/usr/bin/env node
// 自动同步豆瓣公开书影音数据（统计总数、最新条目、封面图与 index.html 静态模板渲染）
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export async function syncDouban() {
    console.log("正在同步豆瓣公开书影音数据...");
    const statsPath = path.join(root, "data", "media-stats.json");
    const mediaPath = path.join(root, "data", "media.json");
    const coversDir = path.join(root, "assets", "covers");

    await fs.mkdir(coversDir, { recursive: true });

    let existingMedia = { movies: [], books: [], games: [] };
    try {
        existingMedia = JSON.parse(await fs.readFile(mediaPath, "utf-8"));
    } catch {
        // use default
    }

    let existingStats = { movies: 315, books: 52, games: 17 };
    try {
        existingStats = JSON.parse(await fs.readFile(statsPath, "utf-8"));
    } catch {
        // use default
    }

    try {
        // 1. 抓取豆瓣主页提取累计统计
        const resHome = await fetch("https://www.douban.com/people/mfcheer/", {
            headers: { "User-Agent": UA },
            signal: AbortSignal.timeout(15000)
        });

        if (resHome.ok) {
            const homeHtml = await resHome.text();
            const movieMatch = homeHtml.match(/(\d+)部看过/);
            const bookMatch = homeHtml.match(/(\d+)本读过/);
            const gameMatch = homeHtml.match(/玩过(\d+)/);

            if (movieMatch) existingStats.movies = Number(movieMatch[1]);
            if (bookMatch) existingStats.books = Number(bookMatch[1]);
            if (gameMatch) existingStats.games = Number(gameMatch[1]);

            await fs.writeFile(statsPath, JSON.stringify(existingStats, null, 2) + "\n", "utf-8");
            console.log("豆瓣统计已更新:", existingStats);

            // 提取主页中的玩过游戏
            const gameSectionMatch = homeHtml.match(/<div class="[^"]*" id="game">[\s\S]*?<div class="clear"><\/div>/);
            if (gameSectionMatch) {
                const gameHtml = gameSectionMatch[0];
                const itemRegex = /<li class="aob">\s*<a title="([^"]*)" href="https:\/\/www\.douban\.com\/game\/(\d+)\/?"><img [^>]*src="([^"]*)"/g;
                const games = [];
                let match;
                while ((match = itemRegex.exec(gameHtml)) !== null) {
                    const [, title, subjectId, coverUrl] = match;
                    games.push({
                        title: title.trim(),
                        link: `https://www.douban.com/game/${subjectId}/`,
                        cover: `assets/covers/${subjectId}.jpg`,
                        coverUrl,
                        subjectId,
                        rating: null,
                        date: null,
                        status: "玩过"
                    });
                }
                if (games.length >= 3) {
                    existingMedia.games = games.slice(0, 5);
                }
            }
        }
    } catch (err) {
        console.warn("拉取豆瓣主页未成功（保留现有缓存）:", err.message);
    }

    // 2. 抓取豆瓣 RSS 提取最新电影与图书打卡
    try {
        const resRss = await fetch("https://www.douban.com/feed/people/mfcheer/interests", {
            headers: { "User-Agent": UA },
            signal: AbortSignal.timeout(15000)
        });

        if (resRss.ok) {
            const rssText = await resRss.text();
            const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<description><!\[CDATA\[[\s\S]*?<img src="(.*?)"[\s\S]*?\]\]><\/description>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?<\/item>/g;
            let match;
            const rssMovies = [];
            const rssBooks = [];

            while ((match = itemRegex.exec(rssText)) !== null) {
                const [, rawTitle, link, coverUrl, pubDate] = match;
                const dateObj = new Date(pubDate);
                const dateStr = !isNaN(dateObj) ? dateObj.toISOString().slice(0, 10) : null;
                const title = rawTitle.replace(/^(想看|看过|在看|读过|在读|想读)/, "").trim();

                let subjectId = null;
                const subMatch = link.match(/subject\/(\d+)/);
                if (subMatch) subjectId = subMatch[1];
                if (!subjectId) continue;

                if (link.includes("movie.douban.com")) {
                    rssMovies.push({
                        title,
                        link,
                        cover: `assets/covers/${subjectId}.jpg`,
                        coverUrl,
                        subjectId,
                        rating: 4,
                        date: dateStr
                    });
                } else if (link.includes("book.douban.com")) {
                    rssBooks.push({
                        title,
                        link,
                        cover: `assets/covers/${subjectId}.jpg`,
                        coverUrl,
                        subjectId,
                        rating: null,
                        date: dateStr,
                        status: "读过"
                    });
                }
            }

            // 合并并去重更新电影
            if (rssMovies.length > 0) {
                const mergedMovies = [...rssMovies];
                for (const old of existingMedia.movies) {
                    if (!mergedMovies.some(m => m.link === old.link)) {
                        mergedMovies.push(old);
                    }
                }
                existingMedia.movies = mergedMovies.slice(0, 5);
            }

            // 合并并去重更新书籍
            if (rssBooks.length > 0) {
                const mergedBooks = [...rssBooks];
                for (const old of existingMedia.books) {
                    if (!mergedBooks.some(b => b.link === old.link)) {
                        mergedBooks.push(old);
                    }
                }
                existingMedia.books = mergedBooks.slice(0, 5);
            }
        }
    } catch (err) {
        console.warn("拉取豆瓣 RSS 未成功（保留现有条目）:", err.message);
    }

    // 3. 异步下载缺失的本地封面（带 Referer 头绕过防盗链）
    const allItems = [
        ...existingMedia.movies,
        ...existingMedia.books,
        ...existingMedia.games
    ];

    for (const item of allItems) {
        if (!item.coverUrl) continue;
        const subId = item.subjectId || item.cover.replace(/[^0-9]/g, "");
        if (!subId) continue;
        const localTarget = path.join(coversDir, `${subId}.jpg`);
        try {
            const stat = await fs.stat(localTarget).catch(() => null);
            if (!stat || stat.size === 0) {
                const referer = item.link.includes("movie.douban.com")
                    ? "https://movie.douban.com/"
                    : item.link.includes("book.douban.com")
                    ? "https://book.douban.com/"
                    : "https://www.douban.com/";
                const imgRes = await fetch(item.coverUrl, {
                    headers: { "User-Agent": UA, "Referer": referer },
                    signal: AbortSignal.timeout(10000)
                });
                if (imgRes.ok) {
                    const buf = Buffer.from(await imgRes.arrayBuffer());
                    if (buf.length > 100) {
                        await fs.writeFile(localTarget, buf);
                        console.log(`封面下载成功: assets/covers/${subId}.jpg (${buf.length} bytes)`);
                    }
                }
            }
        } catch (e) {
            console.warn(`封面下载跳过 ${item.title}: ${e.message}`);
        }
        delete item.coverUrl;
        delete item.subjectId;
    }

    // 4. 落盘 data/media.json
    await fs.writeFile(mediaPath, JSON.stringify(existingMedia, null, 2) + "\n", "utf-8");
    console.log("已更新 data/media.json");

    // 5. 将更新后的最新条目同步渲染至 index.html 的 #media 板块
    await updateIndexHtmlMedia(existingMedia);
    return true;
}

function renderMediaColumn(colTitle, items, isMovie = false) {
    let html = `                    <div class="media-col">\n                    <div class="media-col-head"><span class="media-col-title">${colTitle}</span></div>\n`;
    for (const item of items) {
        let starHtml = "";
        if (isMovie && item.rating) {
            const filled = "★".repeat(item.rating);
            const empty = "☆".repeat(5 - item.rating);
            const stars = filled + empty;
            starHtml = `\n                    <span class="media-stars" title="我的评分：${stars}">${stars}</span>`;
        } else if (item.status) {
            starHtml = `\n                    <span class="media-stars" title="状态：${item.status}">${item.status}</span>`;
        }
        html += `                    <a class="media-item" href="${item.link}" target="_blank" rel="noreferrer">\n` +
            `                    <img class="media-cover" src="${item.cover}" alt="${item.title}" loading="lazy">\n` +
            `                    <div class="media-info">\n` +
            `                    <span class="media-title">${item.title}</span>${starHtml}\n` +
            `                    </div>\n` +
            `                    </a>\n`;
    }
    html += `                    </div>`;
    return html;
}

async function updateIndexHtmlMedia(media) {
    const indexPath = path.join(root, "index.html");
    let html = await fs.readFile(indexPath, "utf-8");
    const gridStart = html.indexOf('<div class="media-grid">');
    if (gridStart === -1) return;
    const mediaSectionEnd = html.indexOf('</section>', gridStart);
    if (mediaSectionEnd === -1) return;
    const gridEnd = html.lastIndexOf('</div>', mediaSectionEnd);
    if (gridEnd === -1) return;

    const moviesCol = renderMediaColumn("🎬 电影", media.movies, true);
    const booksCol = renderMediaColumn("📚 读书", media.books, false);
    const gamesCol = renderMediaColumn("🎮 游戏", media.games, false);

    const newGrid = `<div class="media-grid">\n${moviesCol}\n${booksCol}\n${gamesCol}\n                </div>`;
    html = html.slice(0, gridStart) + newGrid + html.slice(gridEnd + 6);
    await fs.writeFile(indexPath, html, "utf-8");
    console.log("index.html 的 #media 板块已同步更新！");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    syncDouban().catch(console.error);
}
