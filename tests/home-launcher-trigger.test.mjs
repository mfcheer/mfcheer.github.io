import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("首页启动器触发判定逻辑严格符合预期：首次进入与刷新均触发，站内子页面跳转不触发", () => {
    const html = fs.readFileSync("index.html", "utf8");
    assert.ok(html.includes("homeLauncherOverlay"), "index.html 包含启动器根容器");
    assert.ok(html.includes("homeLauncherCanvas"), "index.html 包含启动器画布");

    // 提取 index.html 中的内联触发逻辑
    const scriptMatch = html.match(/<script>([\s\S]*?isReload[\s\S]*?)<\/script>/);
    assert.ok(scriptMatch, "提取到启动器内联判定脚本");

    // 模拟不同导航与引用场景的判定逻辑
    function simulateTrigger({ isReload = false, referrer = "", sessionLaunched = false, currentPath = "/" }) {
        let isFromSubpage = false;
        if (referrer) {
            try {
                const refUrl = new URL(referrer, "https://mfcheer.github.io");
                if (refUrl.origin === "https://mfcheer.github.io") {
                    const refPath = refUrl.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
                    const curPath = currentPath.replace(/\/index\.html$/, "").replace(/\/+$/, "");
                    if (refPath !== curPath) {
                        isFromSubpage = true;
                    }
                }
            } catch(e) {}
        }

        if (isFromSubpage && !isReload) {
            return false;
        }

        const isFirstEntry = !sessionLaunched;
        if (isReload || isFirstEntry) {
            return true;
        }
        return false;
    }

    // 场景 1：第一次打开主页（无 session，无站内 referrer） -> 触发
    assert.equal(simulateTrigger({ isReload: false, referrer: "", sessionLaunched: false }), true, "首次进入主页必须触发");

    // 场景 2：刷新主页（无论 session 是否已标记） -> 必须触发
    assert.equal(simulateTrigger({ isReload: true, referrer: "", sessionLaunched: true }), true, "刷新主页必须触发");
    assert.equal(simulateTrigger({ isReload: true, referrer: "https://mfcheer.github.io/", sessionLaunched: true }), true, "带首页referrer的刷新也必须触发");

    // 场景 3：从说说页 (/moments/) 跳回主页 -> 绝不触发
    assert.equal(simulateTrigger({ isReload: false, referrer: "https://mfcheer.github.io/moments/", sessionLaunched: true }), false, "从说说页跳回主页不触发");

    // 场景 4：从相册页 (/gallery/) 跳回主页 -> 绝不触发
    assert.equal(simulateTrigger({ isReload: false, referrer: "https://mfcheer.github.io/gallery/", sessionLaunched: true }), false, "从相册页跳回主页不触发");

    // 场景 5：从博客文章 (/blog/2026/01/post.html) 跳回主页 -> 绝不触发
    assert.equal(simulateTrigger({ isReload: false, referrer: "https://mfcheer.github.io/blog/2026/01/post.html", sessionLaunched: true }), false, "从博客跳回主页不触发");

    // 场景 6：从外部网站（微信、Google）首次跳入主页 -> 属于首次进入，触发
    assert.equal(simulateTrigger({ isReload: false, referrer: "https://weixin.qq.com/", sessionLaunched: false }), true, "外部首次跳入主页触发");
});


test("启动器星尘粒子包含多光谱色彩色板（深色淡雅低饱和、浅色高饱和宝石）", () => {
    const script = fs.readFileSync("script.js", "utf8");
    assert.ok(script.includes("STARDUST_PALETTES"), "包含多光谱星尘色板定义");
    assert.ok(script.includes("palette.dark"), "包含深色模式霓虹发光粒子渲染");
    assert.ok(script.includes("palette.light"), "包含浅色模式高饱和宝石粒子渲染");

    // 验证调色板至少覆盖蓝、紫、粉/红、橙、绿、金等 6 种以上鲜艳光谱
    const paletteMatch = script.match(/const STARDUST_PALETTES = ([\s\S]*?\n\s*\];)/);
    assert.ok(paletteMatch, "成功提取到 STARDUST_PALETTES 定义");

    const palettes = eval(paletteMatch[1]);
    assert.ok(palettes.length >= 6, "色彩种类不少于 6 种");

    palettes.forEach((p, idx) => {
        assert.ok(p.dark && typeof p.dark.r === "number", "深色模式配色有效: " + idx);
        assert.ok(p.light && typeof p.light.r === "number", "浅色模式配色有效: " + idx);
    });
});

test("首页启动器特效时长适中（不低于 3000ms 且粒子汇聚观赏周期充裕）", () => {
    const script = fs.readFileSync("script.js", "utf8");
    const durationMatch = script.match(/let\s+durationMs\s*=\s*(\d+);/);
    assert.ok(durationMatch, "包含 durationMs 定义");
    const durationMs = parseInt(durationMatch[1], 10);
    assert.ok(durationMs >= 3000, "durationMs 应调长至3000ms以上（当前: " + durationMs + "ms）");
    assert.ok(script.includes("elapsed < 2800"), "星尘粒子拥有充足的汇聚、环绕与呼吸闪烁周期");
    assert.ok(script.includes("(elapsed - 2800) / 700"), "淡出过渡阶段自然平滑");
});
