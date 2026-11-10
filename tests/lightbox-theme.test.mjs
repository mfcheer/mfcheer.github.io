import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const scriptSource = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

test('主题切换具备平滑过渡机制，支持 View Transitions 与 CSS fallback', () => {
    let themeSet = null;
    let viewTransitionCalled = false;
    let stored = {};
    const rootClasses = new Set();
    const btn = { textContent: '', attributes: {}, setAttribute(k, v) { this.attributes[k] = v; }, addEventListener(ev, fn) { this._handler = fn; } };
    const htmlEl = {
        setAttribute(k, v) { if (k === 'data-theme') themeSet = v; },
        classList: {
            add(c) { rootClasses.add(c); },
            remove(c) { rootClasses.delete(c); }
        }
    };

    const sandbox = {
        document: {
            documentElement: htmlEl,
            getElementById(id) { if (id === 'themeToggle') return btn; return null; },
            startViewTransition(cb) { viewTransitionCalled = true; cb(); },
            addEventListener() {},
            querySelector() { return null; }
        },
        localStorage: {
            getItem(k) { return stored[k] || null; },
            setItem(k, v) { stored[k] = v; }
        },
        window: {
            matchMedia: () => ({ matches: false, addEventListener() {} })
        },
        clearTimeout,
        setTimeout,
        console
    };

    const ctx = vm.createContext(sandbox);
    // Slice theme management section
    const themeSnippet = scriptSource.slice(
        scriptSource.indexOf('// Theme Management'),
        scriptSource.indexOf('// Live Beijing Time')
    );
    vm.runInContext(themeSnippet, ctx);

    assert.equal(themeSet, 'light', '初始默认为浅色模式');
    assert.equal(btn.textContent, '🌙');

    // 点击切换为深色模式，使用 View Transitions
    btn._handler();
    assert.equal(viewTransitionCalled, true, '切换时调用了 startViewTransition');
    assert.equal(themeSet, 'dark', '切换为深色');
    assert.equal(stored.theme, 'dark');
    assert.equal(btn.textContent, '☀️');

    // 禁用 View Transitions 验证 fallback transition class
    delete sandbox.document.startViewTransition;
    btn._handler();
    assert.equal(themeSet, 'light', '再次点击切回浅色');
    assert.equal(stored.theme, 'light');
    assert.ok(rootClasses.has('theme-transitioning'), '无 View Transitions 时打上 theme-transitioning 过渡类');
});

test('相册移动端手势：支持横滑切图、下拉关闭与弹回', () => {
    let closed = false;
    let photoIndex = 0;
    const listeners = {};
    const imgStyle = {};
    const boxStyle = {};
    const img = {
        style: imgStyle,
        onload: null, onerror: null, alt: '', src: '', hidden: false,
        removeAttribute() {}
    };
    const statusBtn = { textContent: '' };
    const counterEl = { textContent: '' };
    const deleteBtn = { hidden: true };
    const closeBtn = { onclick: null };
    const prevBtn = { onclick: null };
    const nextBtn = { onclick: null };
    const box = {
        classList: {
            _classes: new Set(['post-lightbox', 'is-open']),
            add(c) { this._classes.add(c); },
            remove(c) { this._classes.delete(c); if (c === 'is-open') closed = true; },
            contains(c) { return this._classes.has(c); },
            toggle(c, v) { if (v) this.add(c); else this.remove(c); }
        },
        style: boxStyle,
        setAttribute() {}, appendChild() {}, addEventListener(name, fn) { listeners[name] = fn; },
        querySelector(sel) {
            if (sel === 'img') return img;
            if (sel === '.post-lightbox-caption') return { textContent: '' };
            if (sel === '.post-lightbox-close') return closeBtn;
            if (sel === '.site-photo-prev') return prevBtn;
            if (sel === '.site-photo-next') return nextBtn;
            if (sel === '.site-photo-status') return statusBtn;
            if (sel === '.site-photo-counter') return counterEl;
            if (sel === '.site-photo-delete') return deleteBtn;
            return null;
        },
        querySelectorAll(sel) {
            if (sel === '.site-photo-nav') return [prevBtn, nextBtn];
            return [];
        }
    };

    const sandbox = {
        siteLightbox: null,
        siteLightboxImg: img,
        siteLightboxCaption: { textContent: '' },
        sitePhotos: [{ src: '/p1.jpg' }, { src: '/p2.jpg' }],
        sitePhotoIndex: 0,
        siteImageRequest: 0,
        siteLastActiveElement: null,
        siteDeleteBusy: false,
        isSiteOwner: () => false,
        deleteSiteContent() {},
        document: {
            body: { classList: { add() {}, remove() {} }, appendChild() {} },
            createElement: () => box,
            activeElement: null
        },
        window: { addEventListener() {} },
        Date, Math, clearTimeout, setTimeout, Image: class { constructor() {} }
    };

    const ctx = vm.createContext(sandbox);
    const lightboxSnippet = scriptSource.slice(
        scriptSource.indexOf('function resetLightboxTransform'),
        scriptSource.indexOf('function openSitePhotos')
    );
    vm.runInContext(lightboxSnippet, ctx);

    // 1. 初始化并绑定手势
    vm.runInContext('createLightbox();', ctx);
    assert.ok(listeners.touchstart && listeners.touchmove && listeners.touchend, '注册了完整的 touch 事件');

    // 2. 模拟向左横滑切换至下一张
    listeners.touchstart({ touches: [{ clientX: 250, clientY: 100 }], target: box });
    listeners.touchmove({ touches: [{ clientX: 150, clientY: 100 }], cancelable: true, preventDefault() {} });
    listeners.touchend({ changedTouches: [{ clientX: 150, clientY: 100 }] });
    assert.equal(vm.runInContext('sitePhotoIndex', ctx), 1, '横滑成功切换至下一张照片');

    // 3. 模拟下拉手势关闭灯箱
    listeners.touchstart({ touches: [{ clientX: 100, clientY: 100 }], target: box });
    listeners.touchmove({ touches: [{ clientX: 105, clientY: 220 }], cancelable: true, preventDefault() {} });
    listeners.touchend({ changedTouches: [{ clientX: 105, clientY: 220 }] });
    assert.equal(closed, true, '下拉手势超过阈值触发关闭灯箱');

    // 4. 重置并测试未达阈值弹回
    closed = false;
    box.classList.add('is-open');
    listeners.touchstart({ touches: [{ clientX: 100, clientY: 100 }], target: box });
    listeners.touchmove({ touches: [{ clientX: 102, clientY: 120 }], cancelable: true, preventDefault() {} });
    listeners.touchend({ changedTouches: [{ clientX: 102, clientY: 120 }] });
    assert.equal(closed, false, '未达下拉阈值不误关闭');
    assert.equal(img.style.transform, '', '未达阈值弹回并清除 transform');
});
