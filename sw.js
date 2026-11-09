/**
 * Service Worker for mfcheer.github.io
 * 
 * 缓存策略：
 * 1. 同源核心资源（HTML/CSS/JS/本地图片/JSON）：Stale-While-Revalidate，0ms 极速呈现，后台静默拉取更新。
 * 2. 外部媒体（ESPN队徽、GitHub贡献图、GitHub头像）：Stale-While-Revalidate，专属 IMAGE_CACHE。
 * 3. 动态数据接口（GitHub Issues、说说静态数据 data/moments.json、ESPN 赛程）：Network-First，带超时竞态（2.5s），断网退回缓存。
 * 4. 实时交互（Giscus 留言系统）：Network-Only，不干扰正常使用。
 */

const CACHE_VERSION = 'v1.5.30';
const STATIC_CACHE = `mfcheer-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `mfcheer-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `mfcheer-images-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './blog/index.html',
    './moments/index.html',
    './gallery/index.html',
    './styles.css?v=1.3.27',
    './script.js?v=1.3.28',
    './gallery.js?v=1.2.3',
    './manifest.json',
    './favicon.ico',
    './favicon-32x32.png',
    './apple-touch-icon.png',
    './avatar.jpg?v=1.0.9',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './assets/projects/still.png',
    './assets/projects/tripnote.png',
    './data/media-stats.json',
    './data/blog-index.json',
    './data/gallery.json',
    './404.html'
];

// 安装：预缓存 App Shell 核心资源
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(async (cache) => {
            // 使用 allSettled 容错，避免单一文件 404 导致整个 SW 安装失败
            await Promise.allSettled(
                PRECACHE_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn(`[SW] Precache skipped for ${url}:`, err);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// 激活：清除旧版本的过期缓存
self.addEventListener('activate', (event) => {
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (!currentCaches.includes(key)) {
                        console.log('[SW] Clearing outdated cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 请求拦截与智能策略分发
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // 只拦截 GET 请求
    if (request.method !== 'GET') return;

    // 忽略非 HTTP/HTTPS 协议
    if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

    const url = new URL(request.url);

    // 1. Giscus 评论服务：不拦截，直连网络
    if (url.hostname.includes('giscus.app') || url.hostname.includes('github-discussions')) {
        return;
    }

    // 2. 外部动态接口与同源动态数据：Network-First（网络优先，2.5s 超时后退回缓存）
    // 包含：GitHub Issues、ESPN 赛程、以及同源的说说静态数据 data/moments.json
    const isDynamicApi =
        (url.hostname === 'api.github.com' && url.pathname.includes('/issues')) ||
        (url.hostname.includes('espn.com') && url.pathname.includes('/schedule')) ||
        (url.origin === self.location.origin && url.pathname.includes('/data/moments.json')) ||
        (url.origin === self.location.origin && url.pathname.includes('/data/gallery.json'));

    if (isDynamicApi) {
        event.respondWith(networkFirstWithTimeout(request, DYNAMIC_CACHE, 2500));
        return;
    }

    // 3. 外部图片与图表：Stale-While-Revalidate（缓存优先响应，后台拉取更新）
    // 包含：ESPN 队徽 (espncdn.com)、GitHub 贡献图 (ghchart.rshah.org)、GitHub 用户头像
    const isExternalMedia =
        url.hostname.includes('espncdn.com') ||
        url.hostname.includes('ghchart.rshah.org') ||
        url.hostname.includes('avatars.githubusercontent.com');

    if (isExternalMedia) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // 4. 同源资源（站点页面、样式、脚本与本地资源）
    if (url.origin === self.location.origin) {
        // 页面导航请求（如访问 / 或刷新）
        if (request.mode === 'navigate') {
            event.respondWith(
                // cache:'no-cache'：强制与源站 revalidate。GitHub Pages 对 HTML 下发 max-age=600，
                // 默认 fetch 会命中浏览器 HTTP 缓存，导致部署后 10 分钟内普通刷新一直拿到旧页面。
                fetch(request, { cache: 'no-cache' })
                    .then((networkRes) => {
                        if (networkRes && networkRes.ok) {
                            const copy = networkRes.clone();
                            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
                        }
                        return networkRes;
                    })
                    .catch(async () => {
                        // 离线时依次匹配缓存
                        return (
                            (await caches.match(request, { ignoreSearch: true })) ||
                            (await caches.match('./index.html')) ||
                            (await caches.match('/')) ||
                            (await caches.match('./404.html'))
                        );
                    })
            );
            return;
        }

        // 其他同源静态资源（CSS / JS / 本地 JSON / 图片）：Stale-While-Revalidate
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }
});

/**
 * Network-First 策略（带超时限制与缓存降级）
 */
async function networkFirstWithTimeout(request, cacheName, timeoutMs = 2500) {
    const cache = await caches.open(cacheName);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response && response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        // 网络失败或超时，从缓存中读取兜底
        const cached = await cache.match(request);
        if (cached) {
            console.log('[SW] Network failed, serving cached fallback for:', request.url);
            return cached;
        }
        // 若无缓存，返回标准离线 JSON，避免前端 promise 崩溃
        return new Response(
            JSON.stringify({ error: 'offline', message: 'Network offline and no cache available' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            }
        );
    }
}

/**
 * Stale-While-Revalidate 策略（缓存优先，后台同步更新）
 * 注意：match 不使用 ignoreSearch——URL 里的 ?v= 版本参数参与匹配，
 * 文件更新 bump query 后旧缓存自然失配，浏览器转而走网络拿新版。
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => null);

    const res = cachedResponse || (await fetchPromise);
    if (!res) {
        return fetch(request).catch(() => new Response('', { status: 404, statusText: 'Not Found' }));
    }
    return res;
}
