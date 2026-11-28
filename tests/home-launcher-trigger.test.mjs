import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("index.html", "utf8");
const scripts = Array.from(html.matchAll(/<script>([\s\S]*?)<\/script>/g));
const trigger = scripts.find(([, source]) => source.includes('getElementById("homeLauncherOverlay")'))?.[1];
assert.ok(trigger, "找到首页实际执行的开场判定");

function simulateTrigger({ type = "navigate", referrer = "", launched = false, reducedMotion = false } = {}) {
    const origin = "https://mfcheer.github.io";
    const overlay = { style: { display: "none" }, remove() { this.removed = true; } };
    const sessionStorage = new Map(launched ? [["mfcheer_home_launched", "1"]] : []);
    vm.runInNewContext(trigger, {
        document: { referrer, getElementById: () => overlay },
        window: { performance: {}, location: { origin, pathname: "/" }, matchMedia: () => ({ matches: reducedMotion }) },
        performance: { getEntriesByType: () => [{ type }] },
        sessionStorage: { getItem: (key) => sessionStorage.get(key), setItem: (key, value) => sessionStorage.set(key, value) },
        URL
    });
    return { visible: !overlay.removed && overlay.style.display === "flex", marked: sessionStorage.has("mfcheer_home_launched") };
}

test("首次进入与刷新都播放，同一会话的普通再访问不播放", () => {
    assert.deepEqual(simulateTrigger(), { visible: true, marked: true });
    assert.equal(simulateTrigger({ referrer: "https://weixin.qq.com/" }).visible, true);
    assert.equal(simulateTrigger({ type: "reload", launched: true }).visible, true);
    assert.equal(simulateTrigger({ launched: true }).visible, false);
});

test("从站内子页返回不播放，但随后刷新照常播放", () => {
    for (const path of ["/moments/", "/gallery/", "/blog/article/"]) {
        const referrer = `https://mfcheer.github.io${path}`;
        assert.deepEqual(simulateTrigger({ referrer }), { visible: false, marked: false });
        assert.equal(simulateTrigger({ type: "reload", referrer, launched: true }).visible, true);
    }
});

test("开启减少动态效果时，首次访问和刷新都直接进入首页", () => {
    assert.deepEqual(simulateTrigger({ reducedMotion: true }), { visible: false, marked: false });
    assert.equal(simulateTrigger({ type: "reload", launched: true, reducedMotion: true }).visible, false);
});
