import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../gallery.js', import.meta.url), 'utf8');
const layout = source.slice(source.indexOf('    const GAP ='), source.indexOf('    /** 全站照片流'));
const photos = JSON.parse(readFileSync(new URL('../data/gallery.json', import.meta.url))).albums.flatMap(a => a.photos);
function rowsFor(photos, width) {
    return vm.runInNewContext(layout + '; buildRows(photos, width)', { photos, width });
}

test('照片墙在不同屏幕下疏密交错、保留顺序且重复计算稳定', () => {
    for (const width of [240, 330, 390, 520, 720, 940]) {
        const rows = rowsFor(photos, width);
        assert.ok(new Set(rows.map(row => row.photos.length)).size > 1);
        assert.deepEqual(Array.from(rows.flatMap(row => row.photos)), photos);
        assert.equal(JSON.stringify(rows), JSON.stringify(rowsFor(photos, width)));
        for (const row of rows) {
            const height = row.height;
            assert.ok(Number.isFinite(height) && height > 0);
            const ratios = row.photos.map(p => p.ratio || p.w / p.h);
            const totalWidth = ratios.reduce((sum, ratio) => sum + height * ratio, 0) + 6 * (ratios.length - 1);
            assert.ok(totalWidth <= width + 0.001);
        }
    }
});

test('照片墙兼容空列表、单张、缺失比例及不同方向照片', () => {
    assert.equal(rowsFor([], 330).length, 0);
    for (const photos of [[{}], [{ ratio: -1 }], Array(30).fill({ w: 600, h: 1200 }),
        Array(30).fill({ ratio: 2.5 }), [{ ratio: 0.2 }, { ratio: 4 }, {}]]) {
        for (const width of [240, 940]) {
            const rows = rowsFor(photos, width);
            assert.equal(rows.flatMap(row => row.photos).length, photos.length);
            assert.ok(rows.every(row => Number.isFinite(row.ratioSum) && row.ratioSum > 0));
        }
    }
});


test('极端长图、全景图与连续竖图受到行高和比例限制，不溢出且不丢照片', () => {
    const extreme = [0.001, 1000, 0.1, 10, 0.5, 0.75, 1, 1.5, 2, 3].map(ratio => ({ ratio }));
    for (const input of [extreme, Array(31).fill({ ratio: 0.01 }), Array(31).fill({ ratio: 100 })]) {
        for (const width of [240, 330, 390, 519, 520, 720, 940, 1440]) {
            const rows = rowsFor(input, width);
            assert.deepEqual(Array.from(rows.flatMap(row => row.photos)), input);
            const min = width < 520 ? Math.min(100, width / 3) : 140;
            const max = width < 520 ? Math.min(300, width * 0.85) : 420;
            for (const row of rows) {
                assert.ok(row.height >= min - 0.001 && row.height <= max + 0.001);
                assert.ok(row.height * row.ratioSum + 6 * (row.photos.length - 1) <= width + 0.001);
                for (const photo of row.photos) {
                    const ratio = Math.max(1 / 3, Math.min(3, photo.ratio));
                    const itemWidth = row.height * ratio;
                    assert.ok(itemWidth >= row.height / 3 - 0.001 && itemWidth <= width + 0.001);
                }
            }
        }
    }
});
